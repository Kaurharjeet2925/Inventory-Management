const Order = require("../models/orders.model");
const ExcelJS = require("exceljs");
const moment = require("moment");
const Product = require("../models/product.model");
const mongoose = require("mongoose");


exports.generateDailySalesReport = async (req, res) => {
  try {
    let { start, end, download, search } = req.query;

    /* ================= DATE HANDLING ================= */
    if (!start || !end) {
      start = moment().startOf("day");
      end = moment().endOf("day");
    } else {
      start = moment(start).startOf("day");
      end = moment(end).endOf("day");
    }

    /* ================= FETCH DATA ================= */
    const allOrders = await Order.find({ status: "completed" })

      .populate("clientId")
      .populate("deliveryPersonId")
      .populate("assignedBy");

    const filteredOrders = await Order.find({
      status: "completed",
      createdAt: { $gte: start.toDate(), $lte: end.toDate() },
    })
      .populate("clientId")
      .populate("deliveryPersonId")
      .populate("assignedBy");

    let searchedOrders = filteredOrders;

    if (search) {
      const q = search.toLowerCase();

      searchedOrders = filteredOrders.filter((order) => {
        const orderIdMatch = order.orderId?.toLowerCase().includes(q);
        const clientMatch = order.clientId?.name?.toLowerCase().includes(q);
        const statusMatch = order.status?.toLowerCase().includes(q);

        const productMatch = order.items?.some((item) =>
          item.productName?.toLowerCase().includes(q)
        );

        return orderIdMatch || clientMatch || statusMatch || productMatch;
      });
    }
    // 🔒 SAFETY FILTER (ensure only completed)
          searchedOrders = searchedOrders.filter(
            (order) => order.status === "completed"
            );


    /* =================================================
       📥 EXCEL DOWNLOAD (SEARCH APPLIED)
       ================================================= */
    if (download === "true") {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("Daily Sales Report");

      sheet.addRow([
        "Date",
        "Order ID",
        "Admin Name",
        "Client Name",
        "Company Name",
        "Client Address",
        "Agent",
        "Product",
        "Qty",
        "Warehouse",
        "Order Status",
        "Amount",
        "Balance ",
        "Payment Status",
      ]);

      sheet.getRow(1).eachCell((cell) => (cell.font = { bold: true }));

      searchedOrders.forEach((order) => {
  const items = order.items || [];

  const orderAmount =
    order.paymentDetails?.totalAmount ||
    items.reduce(
      (sum, item) =>
        sum + (item.price || 0) * (item.quantity || 0),
      0
    );

  const paidAmount = order.paymentDetails?.paidAmount ?? 0;
  const balanceAmount =
    order.paymentDetails?.balanceAmount ?? orderAmount - paidAmount;


        items.forEach((item, index) => {
          sheet.addRow([
            index === 0 ? moment(order.createdAt).format("DD-MM-YYYY") : "",
            index === 0 ? order.orderId : "",
            index === 0 ? order.assignedBy?.name || "N/A" : "",
            index === 0 ? order.clientId?.name || "N/A" : "",
            index === 0 ? order.clientId?.companyName || "N/A" : "",
            index === 0 ? order.clientId?.address || "N/A" : "",
            index === 0 ? order.deliveryPersonId?.name || "N/A" : "",
            `${item.productName} (${item.quantityValue}${item.quantityUnit})`,
            item.quantity,
            item.warehouseName || "N/A",
            index === 0 ? order.status : "",
            index === 0 ? orderAmount : "",
            index === 0? balanceAmount :"",
            index === 0
               ? order.paymentDetails?.paymentStatus || "cod"
              : ""


          ]);
        });
      });

      sheet.columns.forEach((col) => {
        let maxLength = 10;
        col.eachCell({ includeEmpty: true }, (cell) => {
          maxLength = Math.max(
            maxLength,
            cell.value ? cell.value.toString().length : 10
          );
        });
        col.width = maxLength + 4;
      });

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=DailySalesReport.xlsx"
      );

      await workbook.xlsx.write(res);
      return res.end();
    }

    /* =================================================
       📊 DASHBOARD CARDS (ALL ORDERS – unchanged)
       ================================================= */
    const todayStart = moment().startOf("day");
    const todayEnd = moment().endOf("day");
    const weekStart = moment().subtract(6, "days").startOf("day");
    const monthStart = moment().startOf("month");

    let todaySales = 0,
      todayOrders = 0,
      weekSales = 0,
      weekOrders = 0,
      monthSales = 0,
      monthOrders = 0,
      totalSales = 0,
      totalOrders = allOrders.length;

    const productMap = {};

    allOrders.forEach((order) => {
      const items = order.items || [];
      const amount =
        order.paymentDetails?.totalAmount ||
        items.reduce(
          (sum, i) => sum + (i.price || 0) * (i.quantity || 0),
          0
        );

      totalSales += amount;
      const created = moment(order.createdAt);

      if (created.isBetween(todayStart, todayEnd, null, "[]")) {
        todaySales += amount;
        todayOrders++;
      }
      if (created.isSameOrAfter(weekStart)) {
        weekSales += amount;
        weekOrders++;
      }
      if (created.isSameOrAfter(monthStart)) {
        monthSales += amount;
        monthOrders++;
      }

      items.forEach((i) => {
        productMap[i.productName] =
          (productMap[i.productName] || 0) + i.quantity;
      });
    });

    let topProduct = "N/A";
    let topProductQty = 0;
    Object.entries(productMap).forEach(([name, qty]) => {
      if (qty > topProductQty) {
        topProduct = name;
        topProductQty = qty;
      }
    });

    const topProducts = Object.entries(productMap)
      .map(([name, qty]) => ({ name, quantity: qty }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    /* =================================================
       📈 CHART (SEARCHED ORDERS)
       ================================================= */
    const chartMap = {};
    searchedOrders.forEach((order) => {
      const items = order.items || [];
      const amount =
        order.paymentDetails?.totalAmount ||
        items.reduce(
          (sum, i) => sum + (i.price || 0) * (i.quantity || 0),
          0
        );

      const key = moment(order.createdAt).format("YYYY-MM-DD");
      chartMap[key] = (chartMap[key] || 0) + amount;
    });

    const chart = Object.keys(chartMap).map((d) => ({
      date: d,
      amount: chartMap[d],
    }));

    /* =================================================
       📋 TABLE (SEARCHED ORDERS)
       ================================================= */
  const table = searchedOrders.map((o) => {
  const items = o.items || [];

  const totalAmount =
  o.paymentDetails?.totalAmount ||
  items.reduce((s, i) => s + (i.price || 0) * (i.quantity || 0), 0);

const paidAmount = o.paymentDetails?.paidAmount ?? 0;
const balanceAmount =
  o.paymentDetails?.balanceAmount ?? totalAmount - paidAmount;


  return {
    orderId: o.orderId,
    date: moment(o.createdAt).format("YYYY-MM-DD"),
    clientName: o.clientId?.name || "N/A",

   productName: items.map(
  (i) => `${i.productName} (${i.quantityValue}${i.quantityUnit})`
),


    totalAmount,
    paidAmount,
    balanceAmount,

    // ✅ BOTH STATUS
    orderStatus: o.status,
    paymentStatus: o.paymentDetails?.paymentStatus || "cod",
  };
});



    /* ================= FINAL RESPONSE ================= */
    res.json({
      cards: {
        todaySales,
        todayOrders,
        weekSales,
        weekOrders,
        monthSales,
        monthOrders,
        totalSales,
        totalOrders,
        topProduct,
        topProductQty,
      },
      chart,
      topProducts,
      table,
    });
  } catch (err) {
    console.error("Sales Report Error:", err);
    res.status(500).json({ message: "Failed to generate sales report" });
  }
};



exports.generateInventoryReport = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("category", "name")
      .populate("brand", "name")
      .populate("location", "name address"); // ✅ ADDRESS ADDED

    let totalProducts = products.length;
    let totalStock = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    const productChart = [];
    const statusChart = {
      inStock: 0,
      lowStock: 0,
      outOfStock: 0,
    };

    const table = [];

    products.forEach((p) => {
      const qty = Number(p.totalQuantity ?? 0);
      totalStock += qty;

      let status = "In Stock";

      if (qty === 0) {
        status = "Out of Stock";
        outOfStockCount++;
        statusChart.outOfStock++;
      } else if (qty <= 10) {
        status = "Low Stock";
        lowStockCount++;
        statusChart.lowStock++;
      } else {
        statusChart.inStock++;
      }

      productChart.push({
        name: p.name,
        quantity: qty,
      });

      table.push({
        productName: p.name,
        category: p.category?.name || "N/A",
        brand: p.brand?.name || "N/A",
        quantity: qty,
        unit: p.quantityValue
          ? `${p.quantityValue} ${p.quantityUnit}`
          : "-",
        price: p.price || 0,

        // ✅ LOCATION DETAILS
        locationName: p.location?.name || "N/A",
        locationAddress: p.location?.address || "N/A",

        status,
      });
    });

    /* ================= EXCEL DOWNLOAD ================= */
    if (req.query.download === "true") {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("Inventory Report");

      sheet.addRow([
        "Product",
        "Category",
        "Brand",
        "Quantity",
        "Unit",
        "Price",
        "Location Name",
        "Location Address",
        "Stock Status",
      ]);

      sheet.getRow(1).eachCell((c) => (c.font = { bold: true }));

      table.forEach((r) => {
        sheet.addRow([
          r.productName,
          r.category,
          r.brand,
          r.quantity,
          r.unit,
          r.price,
          r.locationName,
          r.locationAddress,
          r.status,
        ]);
      });

      sheet.columns.forEach((c) => (c.width = 22));

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=InventoryReport.xlsx"
      );

      await workbook.xlsx.write(res);
      return res.end();
    }

    /* ================= FINAL RESPONSE ================= */
    res.json({
      cards: {
        totalProducts,
        totalStock,
        lowStockCount,
        outOfStockCount,
      },
      productChart: productChart
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 10),
      statusChart,
      table,
    });
  } catch (err) {
    console.error("Inventory Report Error:", err);
    res.status(500).json({ message: err.message });
  }
};


exports.getSalesTrend = async (req, res) => {
  try {
    const { range, scope = "dashboard" } = req.query;
    let startDate;
    let groupFormat;

    // 🔹 DATE RANGE
    if (!range || range === "7days") {
      startDate = moment().subtract(6, "days").startOf("day").toDate();
      groupFormat = "%d %b";
    } else if (range === "month") {
      startDate = moment().startOf("month").toDate();
      groupFormat = "%d %b";
    } else if (range === "year") {
      startDate = moment().startOf("year").toDate();
      groupFormat = "%b";
    }

    // 🔐 ROLE-BASED FILTER (ONLY FOR DASHBOARD)
    let roleFilter = {};

    if (scope === "dashboard") {
      if (req.user.role === "admin") {
        roleFilter.assignedBy = new mongoose.Types.ObjectId(req.user._id);
      }
      // superAdmin → no filter
    }

    const result = await Order.aggregate([
      {
        $match: {
          status: "completed",
          createdAt: { $gte: startDate },
          ...roleFilter
        }
      },
      {
        $project: {
          createdAt: 1,
          orderAmount: {
            $ifNull: [
              "$paymentDetails.totalAmount",
              {
                $sum: {
                  $map: {
                    input: { $ifNull: ["$items", []] },
                    as: "it",
                    in: {
                      $multiply: [
                        { $ifNull: ["$$it.price", 0] },
                        { $ifNull: ["$$it.quantity", 0] }
                      ]
                    }
                  }
                }
              }
            ]
          }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: groupFormat,
              date: "$createdAt"
            }
          },
          sales: { $sum: "$orderAmount" },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json(
      result.map(r => ({
        label: r._id,
        sales: r.sales,
        orders: r.orders
      }))
    );
  } catch (err) {
    console.error("Sales Trend Error:", err);
    res.status(500).json({ message: "Failed to load sales trend" });
  }
};
