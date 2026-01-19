const Order = require("../models/orders.model");
const Product = require("../models/product.model");
const Client = require("../models/client.model")
const ClientLedger = require("../models/clientLedger.model")
const {getLastLedgerBalance} = require("../utils/getLastLedgerBalance")
const paginate = require("../utils/pagination");
const PDFDocument = require("pdfkit");

const mongoose = require("mongoose")
const { createNotification } = require("./notification.controller");
// Helper to generate orderId like STN00001

function calculateOrderPayment({
  totalAmount,
  discount = 0,
  payments = [],
  availableAdvance = 0, // positive number
}) {
  const payable = Math.max(totalAmount - discount, 0);

  const manualPaid = payments.reduce(
    (sum, p) => sum + Number(p.amount || 0),
    0
  );

  const advanceUsed = Math.min(availableAdvance, payable - manualPaid);

  const totalPaid = manualPaid + advanceUsed;
  const balanceAmount = Math.max(payable - totalPaid, 0);

  let paymentStatus = "unpaid";
  if (balanceAmount === 0) paymentStatus = "paid";
  else if (totalPaid > 0) paymentStatus = "partial";

  return {
    payable,
    manualPaid,
    advanceUsed,
    totalPaid,
    balanceAmount,
    paymentStatus,
  };
}
const generateOrderId = async () => {
  // Find all orders and get the highest number
  const allOrders = await Order.find().sort({ createdAt: -1 });
  let nextNumber = 1;
  
  for (let order of allOrders) {
    if (order.orderId) {
      const match = order.orderId.match(/\d+$/);
      if (match) {
        const num = parseInt(match[0]);
        if (num >= nextNumber) {
          nextNumber = num + 1;
        }
      }
    }
  }
  
  return `STN${String(nextNumber).padStart(5, '0')}`;
};

exports.createOrder = async (req, res) => {
  try {
    const {
      clientId,
      deliveryPersonId,
      paymentDetails,
      items,
      notes,
      status = "pending",
    } = req.body;

    const assignedBy = req.user._id;

    if (!clientId) return res.status(400).json({ message: "Client is required" });
    if (!deliveryPersonId)
      return res.status(400).json({ message: "Delivery person is required" });
    if (!items || items.length === 0)
      return res.status(400).json({ message: "Order must contain at least 1 item" });

    const io = req.app.get("io");

    /* ================= STOCK CHECK ================= */
    for (let item of items) {
      const product = await Product.findById(item.productId).populate(
        "warehouses.location"
      );

      if (!product) {
        return res.status(404).json({
          message: `Product not found: ${item.productName}`,
        });
      }

      const warehouse = product.warehouses.find(
        (w) => w.location._id.toString() === item.warehouseId
      );

      if (!warehouse) {
        return res.status(404).json({
          message: `Warehouse stock not found for product: ${item.productName}`,
        });
      }

      if (Number(item.quantity) > Number(warehouse.quantity || 0)) {
        return res.status(400).json({
          message: `Not enough stock in ${warehouse.location.name}`,
        });
      }
    }

    /* ================= STOCK DEDUCTION ================= */
    for (let item of items) {
      const product = await Product.findById(item.productId);

      const warehouseIndex = product.warehouses.findIndex(
        (w) => w.location.toString() === item.warehouseId
      );

      if (warehouseIndex !== -1) {
        product.warehouses[warehouseIndex].quantity -= Number(item.quantity);
        await product.save();
        io.emit("product_updated", { productId: product._id });
      }
    }

    /* ================= ORDER ITEMS ================= */
    const orderId = await generateOrderId();

    let totalAmount = 0;
    const formattedItems = [];

    for (let item of items) {
      const price = Number(item.price || 0);
      const qty = Number(item.quantity || 0);
      const totalPrice = price * qty;

      totalAmount += totalPrice;

      formattedItems.push({
        productId: item.productId,
        productName: item.productName,
        quantity: qty,
        quantityValue: item.quantityValue,
        quantityUnit: item.quantityUnit,
        price,
        totalPrice,
        warehouseId: item.warehouseId,
        warehouseName: item.warehouseName,
      });
    }

    /* ================= PAYMENT CALCULATION ================= */
    const discount = Math.max(Number(paymentDetails?.discount || 0), 0);

    const payments = Array.isArray(paymentDetails?.payments)
      ? paymentDetails.payments
      : [];

    const manualPaid = payments.reduce(
  (sum, p) => sum + Number(p.amount || 0),
  0
);


    const payable = Math.max(totalAmount - discount, 0);
   
 const client = await Client.findById(clientId);
 

if (!client) {
  return res.status(404).json({ message: "Client not found" });
}

const previousBalance = await getLastLedgerBalance(
  clientId,
  client.openingBalanceType === "credit"
    ? -client.openingBalance
    : client.openingBalance
);

// only ADVANCE is usable
const availableAdvance =
  previousBalance < 0 ? Math.abs(previousBalance) : 0;

// ✅ USE ADVANCE AUTOMATICALLY
const advanceUsed = Math.min(
  availableAdvance,
  Math.max(payable - manualPaid, 0)
);

const totalPaid = manualPaid + advanceUsed;
const balanceAmount = Math.max(payable - totalPaid, 0);

let paymentStatus = "unpaid";
if (balanceAmount === 0) paymentStatus = "paid";
else if (totalPaid > 0) paymentStatus = "partial";

const finalPaymentDetails = {
  totalAmount,
  discount,
  payments,          // only cash/upi/card etc
  paidAmount: totalPaid,
  manualPaidAmount: manualPaid,   // ✅ ADD
  advanceUsed,  
  balanceAmount,
  paymentStatus,
};


    /* ================= SAVE ORDER ================= */
    const newOrder = await Order.create({
      orderId,
      clientId,
      deliveryPersonId,
      assignedBy,
      paymentDetails: finalPaymentDetails,
      items: formattedItems,
      notes,
      status,
    });

    /* ================= CLIENT BALANCE UPDATE ================= */
   

// Ledger flow:
// 1. Order debit
const afterOrderBalance = previousBalance + payable;

// 2. Advance usage
let balanceAfterPayment = afterOrderBalance;

// subtract manual payment first
if (manualPaid > 0) {
  balanceAfterPayment -= manualPaid;
}

// advance is already implicitly used by order debit
// so DO NOT subtract it again



    /* ================= CLIENT LEDGER ENTRY ================= */
 await ClientLedger.create({
  clientId,
  type: "order",
  referenceId: newOrder._id,
  description: `Order ${orderId}`,
  debit: payable,
  credit: 0,
  balanceAfter: afterOrderBalance,
  createdBy: req.user._id,
});

if (manualPaid > 0) {
  await ClientLedger.create({
    clientId,
    type: "payment",
    referenceId: newOrder._id,
    description: `Payment received at order creation (${orderId})`,
    debit: 0,
    credit: manualPaid,
    balanceAfter: balanceAfterPayment,
    createdBy: req.user._id,
  });
}

await Client.findByIdAndUpdate(clientId, {
  balance: balanceAfterPayment,
});


    /* ================= SOCKET + NOTIFICATIONS ================= */
    const populatedOrder = await Order.findById(newOrder._id)
      .select("+paymentDetails")
      .populate("deliveryPersonId", "name phone email")
      .populate("assignedBy", "name role")
      .populate("clientId", "name phone address");

     let dpId =
      typeof deliveryPersonId === "string"
        ? deliveryPersonId
        : (deliveryPersonId?._id || "").toString();
    
// 🔔 Delivery Boy
if (dpId) {
  io.to(dpId).emit("order_created", populatedOrder);

  await createNotification({
    io,
    message: `New order ${orderId} assigned to you`,
    targetUser: dpId,
    data: { orderId: populatedOrder._id },
  });
}

// 🔔 Assigned Admin
if (assignedBy) {
  io.to(`admin_${assignedBy.toString()}`).emit("order_created", populatedOrder);

  await createNotification({
    io,
    message: `You created a new order ${orderId}`,
    targetUser: assignedBy,
    data: { orderId: populatedOrder._id },
  });
}

// 🔔 SuperAdmin (only if creator is NOT superadmin)
if (req.user.role !== "superAdmin") {
  io.to("superadmins").emit("order_created", populatedOrder);

  await createNotification({
    io,
    message: `New order ${orderId} created`,
    targetRole: "superadmins",
    data: { orderId: populatedOrder._id },
  });
}


    // Notify all admins
    // try {
    //   await createNotification({ io, message: `New order ${orderId} created`, targetRole: 'admins', data: { orderId: populatedOrder._id } });
    // } catch (e) { console.error('notify admins failed', e); }

    // io.emit("order_created_global", populatedOrder);
  console.log("FINAL PAYMENT DETAILS =>", finalPaymentDetails);
    return res.status(201).json({
      message: "Order created successfully",
      order: populatedOrder
    });

  } catch (error) {
    console.error("Create Order Error:", error);
    return res.status(500).json({ message: "Server error", error });
  }
};



exports.getOrders = async (req, res) => {
  try {
    const user = req.user;

    /* ---------------- BASE FILTER (ROLE) ---------------- */
    const baseFilter = { deleted: { $ne: true } };

    // 🚚 Delivery boy → only his deliveries
    if (user.role === "delivery-boy") {
      baseFilter.deliveryPersonId = new mongoose.Types.ObjectId(user._id);
    }

    // 🧑‍💼 Admin → only orders created by him
    // if (user.role === "admin") {
    //   baseFilter.assignedBy = new mongoose.Types.ObjectId(user._id);
    // }

    /* ---------------- LIST FILTER ---------------- */
    const listFilter = { ...baseFilter };

    /* ---------------- STATUS FILTER ---------------- */
    if (req.query.status) {
      listFilter.status = req.query.status; // ✅ exact status only
    }

    /* ---------------- DATE FILTER ---------------- */
    if (req.query.from || req.query.to) {
      listFilter.createdAt = {};
      if (req.query.from) {
        listFilter.createdAt.$gte = new Date(req.query.from);
      }
      if (req.query.to) {
        listFilter.createdAt.$lte = new Date(req.query.to + "T23:59:59");
      }
    }

    /* ---------------- MONTH + YEAR FILTER ---------------- */
    if (req.query.month && req.query.year) {
      const start = new Date(req.query.year, req.query.month - 1, 1);
      const end = new Date(req.query.year, req.query.month, 0, 23, 59, 59);
      listFilter.createdAt = { $gte: start, $lte: end };
    }

    /* ---------------- COLLECTED FILTER ---------------- */
    if (req.query.collected === "true") {
      listFilter["items.collected"] = true;
    }
    if (req.query.collected === "false") {
      listFilter["items.collected"] = false;
    }

    /* ---------------- PAGINATION ---------------- */
    const result = await paginate(
      Order,
      listFilter,
      req,
      [
        { path: "clientId", select: "name phone address" },
        { path: "deliveryPersonId", select: "name phone email" },
        { path: "assignedBy", select: "name role" },
      ]
    );

    /* ---------------- STATUS COUNTS ---------------- */
    const counts = await Order.aggregate([
      { $match: baseFilter },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const statusCounts = {
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      completed: 0,
      cancelled: 0,
    };

    counts.forEach((c) => {
      if (statusCounts[c._id] !== undefined) {
        statusCounts[c._id] = c.count; // ✅ direct mapping
      }
    });

    return res.json({
      role: user.role,
      statusCounts,
      ...result,
    });
  } catch (err) {
    console.error("GetOrders Error:", err);
    res.status(500).json({ message: "Failed to retrieve orders" });
  }
};

exports.updateOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { items, status, paymentDetails } = req.body;

    /* ================= FIND ORDER ================= */
    const existingOrder = await Order.findById(orderId);
    if (!existingOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    /* ================= ROLE CHECK ================= */
    if (req.user.role === "delivery-boy") {
      return res.status(403).json({ message: "Not allowed" });
    }

    /* ================= 🚫 COMPLETED ORDER LOCK ================= */
    if (existingOrder.status === "completed") {
      return res.status(400).json({
        message: "Completed orders cannot be modified",
      });
    }

    /* ============================================================
       🔹 STATUS-ONLY UPDATE (NON-PENDING ORDERS)
       ============================================================ */
    if (existingOrder.status !== "pending") {
      // Allow ONLY status change
      existingOrder.status = status || existingOrder.status;
      await existingOrder.save();

      return res.json({
        message: "Order status updated successfully",
        order: existingOrder,
      });
    }

    /* ============================================================
       🔹 FULL UPDATE (PENDING ORDERS ONLY)
       ============================================================ */

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "Order items are required for pending orders",
      });
    }

    /* ================= RESTORE OLD STOCK ================= */
    for (const oldItem of existingOrder.items) {
      await Product.findByIdAndUpdate(oldItem.productId, {
        $inc: { totalQuantity: oldItem.quantity },
      });
    }

    /* ================= DEDUCT NEW STOCK ================= */
    for (const newItem of items) {
      await Product.findByIdAndUpdate(newItem.productId, {
        $inc: { totalQuantity: -newItem.quantity },
      });
    }

    /* ================= RECALCULATE TOTAL ================= */
    let totalAmount = 0;

    const updatedItems = items.map((item) => {
      const price = Number(item.price || 0);
      const qty = Number(item.quantity || 0);
      const totalPrice = price * qty;
      totalAmount += totalPrice;

      return {
        ...item,
        price,
        quantity: qty,
        totalPrice,
      };
    });

const discount = Math.max(Number(paymentDetails?.discount || 0), 0);

/* ================= PAYABLE ================= */
const newPayable = Math.max(totalAmount - discount, 0);

/* ================= PAID ================= */
const manualPaid =
  existingOrder.paymentDetails.payments?.reduce(
    (s, p) => s + Number(p.amount || 0),
    0
  ) || 0;

// advance already stored from createOrder
const advanceUsed =
  existingOrder.paymentDetails.advanceUsed || 0;

const paidAmount = manualPaid + advanceUsed;
const balanceAmount = Math.max(newPayable - paidAmount, 0);

/* ================= STATUS ================= */
let paymentStatus = "unpaid";
if (balanceAmount === 0) paymentStatus = "paid";
else if (paidAmount > 0) paymentStatus = "partial";


const oldPayable =
  existingOrder.paymentDetails.totalAmount -
  existingOrder.paymentDetails.discount;

const difference = newPayable - oldPayable;

if (difference !== 0) {
  const client = await Client.findById(existingOrder.clientId);

  const previousBalance = await getLastLedgerBalance(
    client._id,
    client.openingBalanceType === "credit"
      ? -client.openingBalance
      : client.openingBalance
  );

  let newBalance = previousBalance + difference;

  await ClientLedger.create({
    clientId: client._id,
    type: "order_adjustment",
    referenceId: existingOrder._id,
    description:
      difference > 0
        ? `Order ${existingOrder.orderId} amount increased`
        : `Order ${existingOrder.orderId} amount reduced`,
    debit: difference > 0 ? difference : 0,
    credit: difference < 0 ? Math.abs(difference) : 0,
    balanceAfter: newBalance,
    createdBy: req.user._id,
  });

  client.balance = newBalance;
  await client.save();
}



    /* ================= UPDATE ORDER ================= */
    const updatedOrder = await Order.findByIdAndUpdate(
  orderId,
  {
    status: status || "pending",
    items: updatedItems,
   paymentDetails: {
  ...existingOrder.paymentDetails,
  totalAmount,
  discount,
  paidAmount,
  balanceAmount,
  paymentStatus,
},


  },
  { new: true }
);


    /* ================= SOCKET EVENTS ================= */
    const io = req.app.get("io");

    const populatedOrder = await Order.findById(updatedOrder._id)
      .populate("clientId", "name phone address")
      .populate("deliveryPersonId", "name phone email")
      .populate("assignedBy", "name role");

    // Admin
    if (populatedOrder.assignedBy) {
      io.to(`admin_${populatedOrder.assignedBy._id}`).emit(
        "order_updated",
        populatedOrder
      );
    }

    // Delivery boy
    if (populatedOrder.deliveryPersonId) {
      io.to(populatedOrder.deliveryPersonId._id.toString()).emit(
        "order_updated",
        populatedOrder
      );
    }

    // SuperAdmin
    io.to("superadmins").emit("order_updated", populatedOrder);

    return res.json({
      message: "Order updated successfully",
      order: updatedOrder,
    });
  } catch (err) {
    console.error("updateOrder error", err);
    return res.status(500).json({ message: "Server error" });
  }
};


// PUT /orders/:id/payment

exports.updateOrderPayment = async (req, res) => {
  try {
    const { payment, discount } = req.body;
    const orderId = req.params.id;

    /* ================= FIND ORDER ================= */
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    /* ================= ENSURE PAYMENT STRUCTURE ================= */
    if (!order.paymentDetails) {
      const total = order.items.reduce(
        (sum, i) =>
          sum + Number(i.totalPrice || i.price * i.quantity || 0),
        0
      );

      order.paymentDetails = {
        totalAmount: total,
        discount: 0,
        payments: [],
        paidAmount: 0,
        balanceAmount: total,
        paymentStatus: "unpaid",
      };
    }

    if (!Array.isArray(order.paymentDetails.payments)) {
      order.paymentDetails.payments = [];
    }

    /* ================= APPLY DISCOUNT ================= */
    if (discount !== undefined) {
      const discountValue = Number(discount) || 0;

      if (discountValue < 0) {
        return res.status(400).json({
          message: "Discount cannot be negative",
        });
      }

      if (discountValue > order.paymentDetails.totalAmount) {
        return res.status(400).json({
          message: "Discount cannot exceed total amount",
        });
      }

      order.paymentDetails.discount = discountValue;
    }

    let paymentAmount = 0;

    /* ================= ADD PAYMENT ================= */
    if (payment) {
      paymentAmount = Number(payment.amount);

      if (!payment.mode || !paymentAmount || paymentAmount <= 0) {
        return res.status(400).json({
          message: "Invalid payment data",
        });
      }

      const payable =
        order.paymentDetails.totalAmount -
        order.paymentDetails.discount;

      const alreadyPaid = order.paymentDetails.payments.reduce(
        (sum, p) => sum + Number(p.amount || 0),
        0
      );

      if (alreadyPaid + paymentAmount > payable) {
        return res.status(400).json({
          message: `Cannot collect more than ₹${payable - alreadyPaid}`,
        });
      }

      order.paymentDetails.payments.push({
        mode: payment.mode,
        amount: paymentAmount,
      });
    }

    /* ================= RE-CALCULATE TOTALS ================= */
    const manualPaid = order.paymentDetails.payments.reduce(
  (sum, p) => sum + Number(p.amount || 0),
  0
);

const advanceUsed = order.paymentDetails.advanceUsed || 0;

const payable =
  order.paymentDetails.totalAmount -
  order.paymentDetails.discount;

const paidAmount = manualPaid + advanceUsed;
const balanceAmount = Math.max(payable - paidAmount, 0);

let paymentStatus = "unpaid";
if (balanceAmount === 0) paymentStatus = "paid";
else if (paidAmount > 0) paymentStatus = "partial";

order.paymentDetails.manualPaidAmount = manualPaid;
order.paymentDetails.paidAmount = paidAmount;
order.paymentDetails.balanceAmount = balanceAmount;
order.paymentDetails.paymentStatus = paymentStatus;


   
    /* ================= SAVE ORDER ONCE ================= */
    await order.save();

   if (paymentAmount > 0) {
  const client = await Client.findById(order.clientId);
  if (!client) {
    return res.status(404).json({ message: "Client not found" });
  }

  const previousBalance = await getLastLedgerBalance(
    order.clientId,
    client.openingBalanceType === "credit"
      ? -client.openingBalance
      : client.openingBalance
  );

  const newBalance = previousBalance - paymentAmount;

  await ClientLedger.create({
    clientId: order.clientId,
    type: "payment",
    referenceId: order._id,
    description: `Payment received for Order ${order.orderId}`,
    debit: 0,
    credit: paymentAmount,
    balanceAfter: newBalance,
    createdBy: req.user._id,
  });

  client.balance = newBalance;
  await client.save();
}


    return res.json({
      message: "Payment updated successfully",
      order,
    });
  } catch (error) {
    console.error("updateOrderPayment error:", error);
    return res.status(500).json({
      message: "Payment update failed",
      error: error.message,
    });
  }
};





exports.collectOrder = async (req, res) => {
  try {
    const { id, itemId } = req.params;

    // 🔐 Only delivery boy allowed
    if (req.user.role !== "delivery-boy") {
      return res.status(403).json({
        message: "Only delivery boy can collect items",
      });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // 🚫 Must accept order first
    if (!order.acceptedByDeliveryBoy) {
      return res.status(400).json({
        message: "Please accept the order first",
      });
    }

    const item = order.items.id(itemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // 🚫 Prevent double collect
    if (item.collected) {
      return res.status(400).json({
        message: "Item already collected",
      });
    }

    // ✅ Collect item
    item.collected = true;
    await order.save();

    // 🔄 Populate for response + socket
    const updatedOrder = await Order.findById(id)
      .populate("clientId", "name phone address")
      .populate("deliveryPersonId", "name phone")
      .populate("assignedBy", "name role");

    const io = req.app.get("io");

    // 🔔 Admin notification
    if (updatedOrder.assignedBy?._id) {
      io.to(`admin_${updatedOrder.assignedBy._id}`).emit(
        "order_collected",
        updatedOrder
      );

      await createNotification({
        io,
        message: `An item was collected for ${updatedOrder.orderId}`,
        targetUser: updatedOrder.assignedBy._id,
        data: { orderId: updatedOrder._id },
      });
    }

    // 🔔 Delivery boy notification
    if (updatedOrder.deliveryPersonId?._id) {
      io.to(updatedOrder.deliveryPersonId._id.toString()).emit(
        "order_collected",
        updatedOrder
      );

      await createNotification({
        io,
        message: `Item collected for order ${updatedOrder.orderId}`,
        targetUser: updatedOrder.deliveryPersonId._id,
        data: { orderId: updatedOrder._id },
      });
    }

    // 🔔 SuperAdmins
    io.to("superadmins").emit("order_collected", updatedOrder);

    return res.json({
      message: "Item collected successfully",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("collectOrder error", error);
    res.status(500).json({
      message: "Failed to collect item",
      error: error.message,
    });
  }
};

// Get order by id
exports.getOrderById = async (req, res) => {
  try {
    const id = req.params.id;
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json({ order });
  } catch (error) {
    console.error("getOrderById Error:", error);
    res.status(500).json({ error: error.message });
  }
};
// PUT /orders/:id/accept
// PUT /orders/:id/accept
exports.acceptOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("assignedBy", "name role")
      .populate("deliveryPersonId", "name");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // 🔐 Only delivery boy can accept
    if (req.user.role !== "delivery-boy") {
      return res.status(403).json({
        message: "Only delivery boy can accept order",
      });
    }

    // 🚫 Already accepted
    if (order.acceptedByDeliveryBoy) {
      return res.status(400).json({
        message: "Order already accepted",
      });
    }

    // ✅ ACCEPT ORDER
    order.acceptedByDeliveryBoy = true;
    order.status = "processing";
    await order.save();

    const io = req.app.get("io");

    /* ================= 🔔 NOTIFICATIONS ================= */

    // 🔔 Notify Admin
    if (order.assignedBy?._id) {
      io.to(`admin_${order.assignedBy._id}`).emit(
        "order_accepted",
        order
      );

      await createNotification({
        io,
        message: `Order ${order.orderId} accepted by delivery boy`,
        targetUser: order.assignedBy._id,
        data: { orderId: order._id },
      });
    }

    // 🔔 Notify SuperAdmins
    io.to("superadmins").emit("order_accepted", order);

    await createNotification({
      io,
      message: `Order ${order.orderId} accepted`,
      targetRole: "superadmins",
      data: { orderId: order._id },
    });

    // 🔔 Optional: Notify Delivery Boy himself
    io.to(req.user._id.toString()).emit("order_accepted", order);

    return res.json({
      message: "Order accepted successfully",
      order,
    });
  } catch (error) {
    console.error("acceptOrder error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// Update order status (optional)
exports.updateOrderStatus = async (req, res) => {
  try {
    const id = req.params.id;
    const { status } = req.body;
    const user = req.user;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    /* ================= VALID STATUSES ================= */
    const allStatuses = [
      "pending",
      "processing",
      "shipped",
      "delivered",
      "completed",
      "cancelled",
    ];

    if (!allStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    /* ================= DELIVERY BOY RULES ================= */
    const deliveryBoyAllowed = ["shipped", "delivered", "completed"];

    if (user.role === "delivery-boy" && !deliveryBoyAllowed.includes(status)) {
      return res.status(403).json({
        message:
          "Delivery boy can only update status to shipped, delivered or completed",
      });
    }

    /* ================= FIND ORDER ================= */
    let filter = { _id: id };

    if (user.role === "delivery-boy") {
      filter.deliveryPersonId = user._id;
    }

    const order = await Order.findOne(filter);

    if (!order) {
      return res.status(404).json({
        message: "Order not found or unauthorized",
      });
    }

    const previousStatus = order.status;

    /* ================= 🚫 BLOCK CANCEL AFTER DELIVERY ================= */
    if (previousStatus === "delivered" && status === "cancelled") {
      return res.status(400).json({
        message: "Delivered order cannot be cancelled",
      });
    }

    /* ================= UPDATE STATUS ================= */
    order.status = status;
    const updatedOrder = await order.save();

    /* ================= 🔁 RESTORE STOCK ON CANCEL ================= */
    if (status === "cancelled" && previousStatus !== "cancelled") {
      for (const item of updatedOrder.items) {
        await Product.findByIdAndUpdate(
          item.productId,
          { $inc: { quantity: item.quantity } }, // restore stock
          { new: true }
        );
      }
    }

    /* ================= 💳 PAYMENT STATUS FIX ================= */
    // if (status === "completed") {
    //   const total = updatedOrder.paymentDetails?.totalAmount || 0;
    //   const paid = updatedOrder.paymentDetails?.paidAmount || 0;

    //   let paymentStatus = "unpaid";

    //   if (paid >= total && total > 0) {
    //     paymentStatus = "paid";
    //   } else if (paid > 0) {
    //     paymentStatus = "partial";
    //   }

    //   updatedOrder.paymentDetails.paymentStatus = paymentStatus;
    //   updatedOrder.paymentDetails.balanceAmount = Math.max(total - paid, 0);

    //   await updatedOrder.save();
    // }

    /* ================= SOCKET & NOTIFICATIONS ================= */
    const io = req.app.get("io");

    await updatedOrder.populate("assignedBy", "name role");

    // Notify assigning admin
    if (updatedOrder.assignedBy) {
      io.to(`admin_${updatedOrder.assignedBy._id}`).emit(
        "order_status_updated",
        updatedOrder
      );

      try {
        await createNotification({
          io,
          message: `Order ${updatedOrder.orderId} status changed to ${updatedOrder.status}`,
          targetUser: updatedOrder.assignedBy._id,
          data: { orderId: updatedOrder._id },
        });
      } catch (e) {
        console.error("notify admin failed", e);
      }
    }

    // Notify delivery boy
    if (updatedOrder.deliveryPersonId) {
      io.to(updatedOrder.deliveryPersonId.toString()).emit(
        "order_status_updated",
        updatedOrder
      );

      try {
        await createNotification({
          io,
          message: `Order ${updatedOrder.orderId} status changed to ${updatedOrder.status}`,
          targetUser: updatedOrder.deliveryPersonId,
          data: { orderId: updatedOrder._id },
        });
      } catch (e) {
        console.error("notify delivery boy failed", e);
      }
    }

    return res.json({
      message: "Status updated successfully",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("updateOrderStatus Error:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};



// Delete order
exports.deleteOrder = async (req, res) => {
  try {
    const id = req.params.id;

    // STEP 1: Find order first
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // STEP 2: Restore stock
    const io = req.app.get("io");
    for (let item of order.items) {
      const restoreQty = Number(item.quantity) || 0;

      if (restoreQty > 0) {
        const resRestore = await Product.findByIdAndUpdate(
          item.productId,
          { $inc: { totalQuantity: restoreQty } },
          { new: true }
        );
        console.log(`Stock restored on delete for product ${item.productId}: +${restoreQty}, newTotal: ${resRestore ? resRestore.totalQuantity : 'N/A'}`);
        try { io.emit('product_updated', { productId: item.productId, totalQuantity: resRestore ? resRestore.totalQuantity : null }); } catch (e) { console.error('Emit product_updated failed', e); }
      }
    }

    // STEP 3: Delete the order after stock is restored
    await Order.findByIdAndDelete(id);
    io.emit("order_deleted", { orderId: id });
    try { await createNotification({ io, message: `Order ${order.orderId} has been deleted`, targetRole: 'admins', data: { orderId: id } }); } catch(e){console.error('notify admins failed', e);}
    return res.json({ message: "Order deleted successfully" });


  } catch (error) {
    console.error("deleteOrder Error:", error);
    res.status(500).json({ error: error.message });
  }
};



exports.generateInvoice = async (req, res) => {
  try {
    const orderId = req.params.id;

    const order = await Order.findById(orderId)
      .populate("clientId", "name phone address")
      .populate("deliveryPersonId", "name phone");

    if (!order) return res.status(404).send("Order not found");

    // ---------------------------------------------------------
// FIX: Calculate total from items if paymentDetails is empty
// ---------------------------------------------------------
let calculatedTotal = order.items.reduce(
  (sum, item) => sum + Number(item.totalPrice || 0),
  0
);

const payment = {
  totalAmount: order.paymentDetails?.totalAmount || calculatedTotal,
  paidAmount: order.paymentDetails?.paidAmount || 0,
  balanceAmount:
    order.paymentDetails?.balanceAmount ??
    calculatedTotal - (order.paymentDetails?.paidAmount || 0),
    paymentStatus: order.paymentDetails?.paymentStatus || "cod",

};

    // Create PDF
    const doc = new PDFDocument({ margin: 40 });
    const path = require("path");

    // Register custom font that supports ₹ symbol
    const fontPath = path.join(__dirname, "../fonts/NotoSans_Condensed-Regular.ttf");
    doc.registerFont("Noto", fontPath);
    
    // Set this font globally for the entire document
    doc.font("Noto");
    
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename=Invoice-${order.orderId}.pdf`
    );

    doc.pipe(res);

    //-----------------------------------------
    // HEADER
    //-----------------------------------------
    doc.fontSize(26).text("INVOICE", { align: "center", underline: true });
    doc.moveDown(1);

    // Company INFO (left)
    doc.fontSize(12).text("Star Nutrition Supplements");
    doc.text("Address Line 1");
    doc.text("City, State");
    doc.text("Phone: 9999999999");

    // Invoice Info (right)
    doc.moveUp(4);
    doc.fontSize(12).text(`Invoice No: ${order.orderId}`, { align: "right" });
    doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, {
      align: "right",
    });
    doc.moveDown(3.5);

    //-----------------------------------------
    // CLIENT INFO
    //-----------------------------------------
    doc.fontSize(14).text("Bill To:", { underline: true });
    doc.fontSize(12).text(order.clientId?.name || "");
    doc.text(order.clientId?.phone || "");
    doc.text(order.clientId?.address || "");
    doc.moveDown(1);

   
    doc.moveTo(40, doc.y).lineTo(560, doc.y).stroke();
    doc.moveDown(0.5);
    
    const startY = doc.y;
    
    doc.fontSize(12).text("Product", 40, startY);
    doc.text("Location", 260, startY);
    doc.text("Quantity", 350, startY);
    doc.text("Price", 430, startY);
    doc.text("Total", 500, startY);
    
    doc.moveTo(40, startY + 25).lineTo(560, startY + 25).stroke();
    
    let y = startY + 35;
    
    
    //-----------------------------------------------------------
    // TABLE ROWS
    //-----------------------------------------------------------
    order.items.forEach((item) => {
    
      // Build full product name
      const fullName = `${item.productName} – ${item.quantityValue}${item.quantityUnit}`;
    
      doc.text(fullName, 40, y, { width: 200 });
    
      // FIXED warehouse location name
      doc.text(item.warehouseName || "N/A", 260, y);
    
      doc.text(String(item.quantity), 350, y);
    
      doc.text("₹" + item.price, 430, y);
      doc.text("₹" + item.totalPrice, 500, y);
      
      y += 20; 
    });
    
    doc.moveTo(40, y + 5).lineTo(560, y + 5).stroke();
    
    
    doc.moveTo(40, y + 5).lineTo(560, y + 5).stroke();
    doc.moveDown(2);
    doc.fontSize(18).text(
      `Grand Total: ₹${payment.totalAmount}`,
      360,    // x-position
      y + 20, // y-position
      { width: 200, align: "right" }
    ); 
    doc.moveDown(10);

    const thankY = y + 100;

doc.fontSize(20).text(
  "Thank you for your business!",
  40,
  thankY,
  { width: 520, align: "center" }
);

   
    doc.end();
  } catch (err) {
    console.error("Invoice Error:", err);

    if (!res.headersSent) {
      res.status(500).send("Failed to generate invoice");
    }
  }
};


// GET /api/orders/delivery-summary
exports.deliverySummary = async (req, res) => {
  const adminId = new mongoose.Types.ObjectId(req.user._id);

  const data = await Order.aggregate([
    {
      $match: { assignedBy: adminId }
    },
    {
      $group: {
        _id: "$deliveryPersonId",
        totalOrders: { $sum: 1 },
        pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
        processing: { $sum: { $cond: [{ $eq: ["$status", "processing"] }, 1, 0] }},
        shipped: { $sum: { $cond: [{ $eq: ["$status", "shipped"] }, 1, 0] }},      
        delivered: { $sum: { $cond: [{ $eq: ["$status", "delivered"] }, 1, 0] } },
        completed: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } }
      }
    },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "deliveryBoy"
      }
    },
    { $unwind: "$deliveryBoy" },
    {
      $project: {
        _id: 0,
        deliveryBoyId: "$deliveryBoy._id",
        deliveryBoyName: "$deliveryBoy.name",
        totalOrders: 1,
        pending: 1,
        processing: 1,
        shipped: 1,
        delivered: 1,
        completed: 1
      }
    }
  ]);

  res.json(data);
};

// GET /orders/all
exports.getAllOrders = async (req, res) => {
  try {
    const user = req.user;
    const filter = {};

    if (user.role === "delivery-boy") {
      filter.deliveryPersonId = new mongoose.Types.ObjectId(user._id);
    }

    if (user.role === "admin" || user.role === "superAdmin") {
      filter.assignedBy = new mongoose.Types.ObjectId(user._id);
    }

    if (req.query.status) {
      if (req.query.status === "shipped") {
        filter.status = { $in: ["processing", "shipped"] };
      } else {
        filter.status = req.query.status;
      }
    }

    const orders = await Order.find(filter)
      .populate("clientId", "name phone address")
      .populate("deliveryPersonId", "name phone email")
      .populate("assignedBy", "name role")
      .sort({ createdAt: -1 });

    res.json({ data: orders });
  } catch (err) {
    console.error("getAllOrders error:", err);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};
// GET /api/orders/agent/dashboard-summary
exports.agentDashboardSummary = async (req, res) => {
  try {
    if (req.user.role !== "delivery-boy") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const deliveryBoyId = new mongoose.Types.ObjectId(req.user._id);

    const counts = await Order.aggregate([
      {
        $match: {
          deleted: { $ne: true },
          deliveryPersonId: deliveryBoyId
        }
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    const statusCounts = {
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      completed: 0
    };

    counts.forEach(c => {
      if (statusCounts[c._id] !== undefined) {
        statusCounts[c._id] = c.count;
      }
    });

    res.json({ statusCounts });

  } catch (error) {
    console.error("agentDashboardSummary error:", error);
    res.status(500).json({ message: "Failed to load dashboard summary" });
  }
};
