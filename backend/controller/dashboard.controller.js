const Order = require("../models/orders.model");
const User = require("../models/user.model");
const Client = require("../models/client.model");
exports.getPaymentStatusPie = async (req, res) => {
  try {
    const orders = await Order.find({ status: "completed" });

    let totalAmount = 0;
    let paidAmount = 0;

    orders.forEach(order => {
      const orderTotal =
        Number(order.paymentDetails?.totalAmount) || 0;

      const orderPaid =
        Number(order.paymentDetails?.paidAmount) || 0;

      totalAmount += orderTotal;
      paidAmount += orderPaid;
    });

    const pendingAmount = Math.max(totalAmount - paidAmount, 0);

    res.json([
      { name: "Paid", value: paidAmount },
      { name: "Pending", value: pendingAmount },
      {name : "TotalAmount", value: totalAmount}
    ]);
  } catch (err) {
    console.error("Payment Pie Error:", err);
    res.status(500).json({ message: "Failed to load payment summary" });
  }
};


exports.getTopProducts = async (req, res) => {
  try {
    const limit = Number(req.query.limit || 5);
    const period = req.query.period || "year";

    const now = new Date();
    let startDate = null;

    // ⏱ PERIOD FILTER
    if (period === "week") {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
    } else if (period === "month") {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 30);
    } else if (period === "year") {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 365);
    }

    const matchStage = {
      status: "completed",
      ...(startDate && { createdAt: { $gte: startDate } }),
    };

    const result = await Order.aggregate([
      // ✅ FILTER BY STATUS + DATE
      { $match: matchStage },

      // ✅ BREAK ORDER ITEMS
      { $unwind: "$items" },

      // ✅ GROUP BY PRODUCT
      {
        $group: {
          _id: "$items.productId",
          totalQty: { $sum: "$items.quantity" },
          sampleName: { $first: "$items.productName" },
        },
      },

      // ✅ SORT BY MOST SOLD
      { $sort: { totalQty: -1 } },

      // ✅ LIMIT
      { $limit: limit },

      // ✅ LOOKUP PRODUCT DETAILS
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },

      { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },

      // ✅ FINAL SHAPE
      {
        $project: {
          _id: 1,
          totalQty: 1,
          productName: {
            $ifNull: ["$product.name", "$sampleName", "Unknown product"],
          },
          image: {
            $cond: [
              { $ifNull: ["$product.thumbnail", false] },
              { $concat: ["/uploads/", "$product.thumbnail"] },
              { $arrayElemAt: ["$product.images", 0] },
            ],
          },
        },
      },
    ]);

    // 🔹 Normalize image paths
    const normalizeImage = (img) => {
      if (!img) return null;
      if (typeof img === "string" && img.startsWith("http")) return img;

      let out = img;
      if (out.startsWith("uploads/")) out = "/" + out;
      out = out.replace(/\/uploads\/uploads\//g, "/uploads/");
      if (!out.startsWith("/uploads/")) {
        out = out.startsWith("/") ? "/uploads" + out : "/uploads/" + out;
      }
      return out;
    };

    const formatted = result.map((p, index) => ({
      rank: index + 1,
      productId: p._id,
      productName: p.productName,
      quantitySold: p.totalQty, // ✅ THIS IS FILTERED BY PERIOD
      image: normalizeImage(p.image),
    }));

    res.json(formatted);
  } catch (err) {
    console.error("Top Products Error:", err);
    res.status(500).json({ message: "Failed to load top products" });
  }
};



// Dashboard summary: order counts, sales totals and growth, inventory overview
exports.getDashboardSummary = async (req, res) => {
  try {
    // range in days for sales summary (default: 7 days)
    const rangeDays = Number(req.query.rangeDays || 7);
    const now = new Date();
    const startCurrent = new Date(now.getTime() - rangeDays * 24 * 60 * 60 * 1000);
    const startPrev = new Date(now.getTime() - 2 * rangeDays * 24 * 60 * 60 * 1000);

    // Order counts by normalized status (lowercase + trimmed)
    const countsAgg = await Order.aggregate([
      { $project: { normStatus: { $toLower: { $trim: { input: { $ifNull: ["$status", ""] } } } }, orderId: 1 } },
      { $group: { _id: "$normStatus", count: { $sum: 1 } } }
    ]);
    const counts = countsAgg.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    // Also collect a small sample of orderIds per status to aid debugging
    const samplesAgg = await Order.aggregate([
      { $project: { normStatus: { $toLower: { $trim: { input: { $ifNull: ["$status", ""] } } } }, orderId: 1 } },
      { $group: { _id: "$normStatus", sampleOrders: { $push: "$orderId" } } }
    ]);
    const samples = samplesAgg.reduce((acc, item) => {
      acc[item._id] = (item.sampleOrders || []).slice(0, 10);
      return acc;
    }, {});

    const pending = counts.pending || 0;
    const processing = counts.processing || 0;
    const shipped = counts.shipped || 0;
    const delivered = counts.delivered || 0;
    const completed = counts.completed || 0;

    // Sales total for the current period (completed orders)
    const salesCurrentAgg = await Order.aggregate([
      { $match: { status: "completed", createdAt: { $gte: startCurrent } } },
      { $group: { _id: null, total: { $sum: { $ifNull: ["$paymentDetails.totalAmount", 0] } } } }
    ]);
    const totalSalesCurrent = (salesCurrentAgg[0] && salesCurrentAgg[0].total) || 0;

    // Sales total for the previous period
    const salesPrevAgg = await Order.aggregate([
      { $match: { status: "completed", createdAt: { $gte: startPrev, $lt: startCurrent } } },
      { $group: { _id: null, total: { $sum: { $ifNull: ["$paymentDetails.totalAmount", 0] } } } }
    ]);
    const totalSalesPrev = (salesPrevAgg[0] && salesPrevAgg[0].total) || 0;

    // Growth percentage vs previous period
    let growth = 0;
    if (totalSalesPrev === 0 && totalSalesCurrent > 0) growth = 100;
    else if (totalSalesPrev === 0 && totalSalesCurrent === 0) growth = 0;
    else growth = ((totalSalesCurrent - totalSalesPrev) / Math.abs(totalSalesPrev)) * 100;

    // Inventory overview
    const Product = require("../models/product.model");
    const products = await Product.find();
    const totalQty = products.reduce((s, p) => s + (p.totalQuantity || 0), 0);
    const lowStock = products.filter(p => (p.totalQuantity || 0) <= 5).length;
    const outOfStock = products.filter(p => (p.totalQuantity || 0) <= 0).length;

    res.json({
      // include processing separately for clarity
      orders: { pending, processing, shipped, delivered, completed },
      // debugging samples for quick inspection
      ordersDebug: { samples },
      sales: { total: totalSalesCurrent, growth: Number(growth.toFixed(2)), periodDays: rangeDays },
      inventory: { totalQty, lowStock, outOfStock }
    });
  } catch (err) {
    console.error('Dashboard Summary Error:', err);
    res.status(500).json({ message: 'Failed to load dashboard summary' });
  }
};



exports.getUserStatsForDashboard = async (req, res) => {
  try {
    // 1️⃣ Clients count (from Client collection)
    const clientsCount = await Client.countDocuments();

    // 2️⃣ Admins count (admin + superAdmin)
    const adminsCount = await User.countDocuments({
      role: { $in: ["admin", "superAdmin"] }
    });

    // 3️⃣ Delivery partners count
    const deliveryCount = await User.countDocuments({
      role: "delivery-boy"
    });

    res.json({
      clients: clientsCount,
      admins: adminsCount,
      delivery: deliveryCount
    });
  } catch (err) {
    console.error("Dashboard User Stats Error:", err);
    res.status(500).json({ message: "Failed to load dashboard user stats" });
  }
};

