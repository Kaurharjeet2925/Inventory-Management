const Order = require("../models/orders.model");
const Product = require("../models/product.model");
const paginate = require("../utils/pagination");
const PDFDocument = require("pdfkit");

const mongoose = require("mongoose")
const { createNotification } = require("./notification.controller");
// Helper to generate orderId like STN00001
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
      status = "pending" 
    } = req.body;
    const assignedBy = req.user._id; // Get current user ID

    console.log("Create Order Request:", req.body);

    if (!clientId) return res.status(400).json({ message: "Client is required" });
    if (!deliveryPersonId) return res.status(400).json({ message: "Delivery person is required" });
    if (!items || items.length === 0)
      return res.status(400).json({ message: "Order must contain at least 1 item" });

    // Get io instance early so it's available throughout function
    const io = req.app.get("io");

    for (let item of items) {
      const warehouseProduct = await Product.findById(item.warehouseId).populate("location");

      if (!warehouseProduct) {
        return res.status(404).json({
          message: `Warehouse stock not found for product: ${item.productName}`
        });
      }

      const available = warehouseProduct.totalQuantity || 0;
      const qty = Number(item.quantity);

      if (qty > available) {
        return res.status(400).json({
          message: `Not enough stock in ${warehouseProduct.location?.name}. Available: ${available}`
        });
      }
    }

  
  

    for (let item of items) {
      const resUpdate = await Product.findByIdAndUpdate(item.warehouseId, {
        $inc: { totalQuantity: -Number(item.quantity) }
      }, { new: true });

      // Debug logs: show product id, decremented amount and new total
      console.log(`Stock update for product ${item.warehouseId}: -${item.quantity}, newTotal: ${resUpdate ? resUpdate.totalQuantity : 'N/A'}`);

      // Emit product_updated so clients can refresh availability immediately
      try {
        io.emit('product_updated', { productId: item.warehouseId, totalQuantity: resUpdate ? resUpdate.totalQuantity : null });
      } catch (e) {
        console.error('Failed to emit product_updated', e);
      }
    }

    // Generate Order ID
    const orderId = await generateOrderId();

    let totalAmount = 0;
    const formattedItems = [];

    
    for (let item of items) {
      const warehouseProduct = await Product.findById(item.warehouseId).populate("location");

      const price = Number(item.price || 0);
      const qty = Number(item.quantity || 0);
      const totalPrice = qty * price;

      totalAmount += totalPrice;

      formattedItems.push({
        productId: item.productId,
        productName: item.productName,
        quantity: qty,
        quantityValue: item.quantityValue,
        quantityUnit:item.quantityUnit,
        unitType: item.unitType,
        price: price,
        totalPrice: totalPrice,

        warehouseId: item.warehouseId,
        warehouseName: warehouseProduct?.location?.name || "Unknown",
        warehouseAddress: warehouseProduct?.location?.address || "Unknown",
      });
    }


   const paid = Math.max(Number(paymentDetails?.paidAmount) || 0, 0);
const balance = Math.max(totalAmount - paid, 0);

const finalPaymentDetails = {
  totalAmount,
  paidAmount: paid,
  balanceAmount: balance,
  paymentStatus:
    paid === 0
      ? "cod"
      : paid >= totalAmount
      ? "paid"
      : "partial",
};

    // -----------------------------------------------------
    // Save Order
    // ⭐ -------------------------------------------------
    const newOrder = await Order.create({
      orderId,
      clientId,
      deliveryPersonId,
      assignedBy,
      paymentDetails: finalPaymentDetails,
      items: formattedItems,
      notes,
      status
    });

    // Fetch and populate order before emitting via socket
   const populatedOrder = await Order.findById(newOrder._id)
  .select("+paymentDetails") // ✅ ADD THIS
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
    if (user.role === "admin") {
      baseFilter.assignedBy = new mongoose.Types.ObjectId(user._id);
    }

    // 👑 SuperAdmin → NO FILTER (see all orders)

    /* ---------------- LIST FILTER ---------------- */
    const listFilter = { ...baseFilter };

    /* STATUS FILTER */
    if (req.query.status) {
      if (req.query.status === "shipped") {
        listFilter.status = { $in: ["processing", "shipped"] };
      } else {
        listFilter.status = req.query.status;
      }
    }

    /* ---------------- DATE FILTER (FROM–TO) ---------------- */
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
        { path: "assignedBy", select: "name role" }
      ]
    );

    /* ---------------- STATUS COUNTS (ROLE-BASED) ---------------- */
    const counts = await Order.aggregate([
      { $match: baseFilter },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    const statusCounts = { pending: 0, shipped: 0, delivered: 0, completed: 0 };

    counts.forEach(c => {
      if (c._id === "processing" || c._id === "shipped") {
        statusCounts.shipped += c.count;
      } else if (statusCounts[c._id] !== undefined) {
        statusCounts[c._id] = c.count;
      }
    });

    return res.json({
      role: user.role,
      statusCounts,
      ...result
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

    const existingOrder = await Order.findById(orderId);
    if (!existingOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    // 🔒 Only admin can edit full order
    if (req.user.role === "delivery-boy") {
      return res.status(403).json({ message: "Not allowed" });
    }

    // -------------------------------
    // ONLY PENDING ORDERS CAN CHANGE ITEMS
    // -------------------------------
    if (existingOrder.status !== "pending") {
      return res.status(400).json({
        message: "Only pending orders can be edited",
      });
    }

    // Restore old stock
    for (const oldItem of existingOrder.items) {
      await Product.findByIdAndUpdate(oldItem.productId, {
        $inc: { totalQuantity: oldItem.quantity },
      });
    }

    // Deduct new stock
    for (const newItem of items) {
      await Product.findByIdAndUpdate(newItem.productId, {
        $inc: { totalQuantity: -newItem.quantity },
      });
    }

    // Recalculate totals
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

    const paid = Number(paymentDetails?.paidAmount || 0);
    const balance = totalAmount - paid;

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      {
        status: status || "pending",
        items: updatedItems,
        paymentDetails: {
          totalAmount,
          paidAmount: paid,
          balanceAmount: balance < 0 ? 0 : balance,
       paymentStatus:
  (status === "completed" && paid === 0)
    ? "unpaid"
    : paid >= totalAmount
    ? "paid"
    : paid > 0
    ? "partial"
    : "cod",


        },
      },
      { new: true }
    );
    const io = req.app.get("io");

const populatedOrder = await Order.findById(updatedOrder._id)
  .populate("clientId", "name phone address")
  .populate("deliveryPersonId", "name phone email")
  .populate("assignedBy", "name role");

// Admin
if (populatedOrder.assignedBy) {
  io.to(`admin_${populatedOrder.assignedBy._id}`).emit("order_updated", populatedOrder);
}

// Delivery boy
if (populatedOrder.deliveryPersonId) {
  io.to(populatedOrder.deliveryPersonId._id.toString()).emit("order_updated", populatedOrder);
}

// SuperAdmin
io.to("superadmins").emit("order_updated", populatedOrder);

    return res.json({
      message: "Order updated successfully",
      order: updatedOrder,
    });
  } catch (err) {
    console.error("updateOrder error", err);
    res.status(500).json({ message: "Server error" });
  }
};


// PUT /orders/:id/payment
// PUT /api/orders/:id/payment
// PUT /api/orders/:id/payment
exports.updateOrderPayment = async (req, res) => {
  try {
    const { paidAmount } = req.body;
    const orderId = req.params.id;

    if (!paidAmount || Number(paidAmount) <= 0) {
      return res.status(400).json({ message: "Invalid payment amount" });
    }

    const order = await Order.findById(orderId)
      .populate("clientId", "name phone address")
      .populate("deliveryPersonId", "name phone")
      .populate("assignedBy", "name role");

    if (!order) return res.status(404).json({ message: "Order not found" });

    // ✅ Ensure paymentDetails exists
    if (!order.paymentDetails) {
      const calculatedTotal = order.items.reduce(
        (sum, item) => sum + Number(item.totalPrice || item.price * item.quantity || 0),
        0
      );

      order.paymentDetails = {
        totalAmount: calculatedTotal,
        paidAmount: 0,
        balanceAmount: calculatedTotal,
        paymentStatus: "unpaid",
      };
    }

    const totalAmount = Number(order.paymentDetails.totalAmount);
    const previousPaid = Number(order.paymentDetails.paidAmount || 0);
    const addedPaid = Number(paidAmount);

    const finalPaid = previousPaid + addedPaid;
    const balance = Math.max(totalAmount - finalPaid, 0);

  let paymentStatus = order.status === "completed" ? "unpaid" : "cod";

   if (finalPaid >= totalAmount) paymentStatus = "paid";
   else if (finalPaid > 0) paymentStatus = "partial";


    order.paymentDetails = {
      totalAmount,
      paidAmount: finalPaid,
      balanceAmount: balance,
      paymentStatus,
    };

    await order.save();

    const io = req.app.get("io");

    // 🔔 Notify admin
    if (order.assignedBy) {
      io.to(`admin_${order.assignedBy._id}`).emit("order_updated", order);
      try { await createNotification({ io, message: `Payment updated for ${order.orderId}`, targetUser: order.assignedBy._id, data: { orderId: order._id } }); } catch(e){console.error('notify admin failed', e);}
    }

    // 🔔 Notify delivery boy
    if (order.deliveryPersonId) {
      io.to(order.deliveryPersonId._id.toString()).emit("order_updated", order);
      try { await createNotification({ io, message: `Payment updated for ${order.orderId}`, targetUser: order.deliveryPersonId._id, data: { orderId: order._id } }); } catch(e){console.error('notify dp failed', e);}
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

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const item = order.items.id(itemId);
    if (!item) return res.status(404).json({ message: "Item not found" });

    item.collected = true;
    await order.save();

    const updatedOrder = await Order.findById(id)
      .populate("clientId", "name phone address")
      .populate("deliveryPersonId", "name phone")
      .populate("assignedBy", "name role");

    const io = req.app.get("io");

    // Admin
    if (updatedOrder.assignedBy?._id) {
      io.to(`admin_${updatedOrder.assignedBy._id}`)
        .emit("order_collected", updatedOrder);

      await createNotification({
        io,
        message: `An item was collected for ${updatedOrder.orderId}`,
        targetUser: updatedOrder.assignedBy._id,
        data: { orderId: updatedOrder._id },
      });
    }

    // Delivery boy
    if (updatedOrder.deliveryPersonId?._id) {
      io.to(updatedOrder.deliveryPersonId._id.toString())
        .emit("order_collected", updatedOrder);

      await createNotification({
        io,
        message: `Item collected for order ${updatedOrder.orderId}`,
        targetUser: updatedOrder.deliveryPersonId._id,
        data: { orderId: updatedOrder._id },
      });
    }

    // SuperAdmins
    io.to("superadmins").emit("order_collected", updatedOrder);

    res.json({
      message: "Item collected successfully",
      order: updatedOrder,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to collect item", error });
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

// Update order status (optional)
exports.updateOrderStatus = async (req, res) => {
  try {
    const id = req.params.id;
    const { status } = req.body;
    const user = req.user;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    // All valid statuses
    const allStatuses = ["pending", "shipped", "delivered", "completed", "cancelled"];

    if (!allStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    // 🚫 Delivery boy allowed statuses
    const deliveryBoyAllowed = ["shipped", "delivered", "completed"];

    // Delivery boy MUST NOT set anything outside these
    if (user.role === "delivery-boy" && !deliveryBoyAllowed.includes(status)) {
      return res.status(403).json({
        message: `Delivery boy can only update status to shipped, delivered or completed`,
      });
    }

    // Delivery boy can update only his orders
    let filter = { _id: id };

    if (user.role === "delivery-boy") {
      filter.deliveryPersonId = user._id;
    }

    const updatedOrder = await Order.findOneAndUpdate(
      filter,
      { status },
      { new: true }
    );
    // 🔥 PAYMENT STATUS FIX ON COMPLETION
if (status === "completed") {
  const total = updatedOrder.paymentDetails?.totalAmount || 0;
  const paid = updatedOrder.paymentDetails?.paidAmount || 0;

  let paymentStatus = "unpaid";

  if (paid >= total && total > 0) {
    paymentStatus = "paid";
  } else if (paid > 0) {
    paymentStatus = "partial";
  }

  updatedOrder.paymentDetails.paymentStatus = paymentStatus;
  updatedOrder.paymentDetails.balanceAmount = Math.max(total - paid, 0);

  await updatedOrder.save();
}

 
    if (!updatedOrder) {
      return res.status(404).json({
        message: "Order not found or unauthorized",
      });
    }
    const io = req.app.get("io");

    // First, populate the order to get assignedBy field
    await updatedOrder.populate("assignedBy", "name role");

    // Notify the specific admin who assigned this order
    if (updatedOrder.assignedBy) {
      io.to(`admin_${updatedOrder.assignedBy._id.toString()}`).emit("order_status_updated", updatedOrder);
      try { await createNotification({ io, message: `Order ${updatedOrder.orderId} status changed to ${updatedOrder.status}`, targetUser: updatedOrder.assignedBy._id, data: { orderId: updatedOrder._id } }); } catch(e){console.error('notify admin failed', e);}
    }

    // Notify delivery boy assigned to this order
    if (updatedOrder.deliveryPersonId) {
      io.to(updatedOrder.deliveryPersonId.toString())
        .emit("order_status_updated", updatedOrder);
      try { await createNotification({ io, message: `Order ${updatedOrder.orderId} status changed to ${updatedOrder.status}`, targetUser: updatedOrder.deliveryPersonId, data: { orderId: updatedOrder._id } }); } catch(e){console.error('notify dp failed', e);}
    }

    // // Optional global event
    // io.emit("order_status_updated_global", updatedOrder);


    return res.json({
      message: "Status updated successfully",
      order: updatedOrder,
    });
    
    // 🔥 Real-time event
 
    

  } catch (error) {
    console.error("updateOrderStatus Error:", error);
    return res.status(500).json({
      error: error.message,
      message: "Server error",
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
        shipped: { $sum: { $cond: [{ $in: ["$status", ["processing", "shipped"]] }, 1, 0] } },
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
