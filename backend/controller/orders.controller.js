const Order = require("../models/orders.model");
const Product = require("../models/product.model");

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

    console.log("Create Order Request:", req.body);

    if (!clientId) return res.status(400).json({ message: "Client is required" });
    if (!deliveryPersonId) return res.status(400).json({ message: "Delivery person is required" });
    if (!items || items.length === 0)
      return res.status(400).json({ message: "Order must contain at least 1 item" });

    // -----------------------------------------------------
    // ⭐ Validate Warehouse-level Stock
    // -----------------------------------------------------
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

    // -----------------------------------------------------
    // ⭐ Deduct Warehouse Stock
    // -----------------------------------------------------
    for (let item of items) {
      await Product.findByIdAndUpdate(item.warehouseId, {
        $inc: { totalQuantity: -Number(item.quantity) }
      });
    }

    // Generate Order ID
    const orderId = await generateOrderId();

    let totalAmount = 0;
    const formattedItems = [];

    // -----------------------------------------------------
    // ⭐ Prepare items for the order
    // -----------------------------------------------------
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
        unitType: item.unitType,

        price: price,
        totalPrice: totalPrice,

        warehouseId: item.warehouseId,
        warehouseName: warehouseProduct?.location?.name || "Unknown",
        warehouseAddress: warehouseProduct?.location?.address || "Unknown",
      });
    }

    // -----------------------------------------------------
    // ⭐ Payment Calculations
    // -----------------------------------------------------
    const paid = Number(paymentDetails?.paidAmount || 0);
    const balance = totalAmount - paid;

    const finalPaymentDetails = {
      totalAmount,
      paidAmount: paid,
      balanceAmount: balance < 0 ? 0 : balance,
      paymentStatus:
        paid === 0 ? "unpaid" :
        paid >= totalAmount ? "paid" : "partial"
    };

    // -----------------------------------------------------
    // ⭐ Save Order
    // -----------------------------------------------------
    const newOrder = await Order.create({
      orderId,
      clientId,
      deliveryPersonId,
      paymentDetails: finalPaymentDetails,
      items: formattedItems,
      notes,
      status
    });

    // -----------------------------------------------------
    // ⭐ SOCKET EVENTS
    // -----------------------------------------------------
    const io = req.app.get("io");

    if (deliveryPersonId) {
      io.to(deliveryPersonId.toString()).emit("order_created", newOrder);
    }

    io.to("admins").emit("order_created", newOrder);
    io.emit("order_created_global", newOrder);

    return res.status(201).json({
      message: "Order created successfully",
      order: newOrder
    });

  } catch (error) {
    console.error("Create Order Error:", error);
    return res.status(500).json({ message: "Server error", error });
  }
};




// Get all orders
exports.getOrders = async (req, res) => {
  try {
    const user = req.user;
    const filter = {};

    // Delivery boy should only get their own orders
    if (user && user.role === "delivery-boy") {
      filter.deliveryPersonId = user._id;
    }

    // Admin and Super Admin can see all orders (no filter applied)

    const orders = await Order.find(filter)
      .populate("clientId", "name phone address")
      .populate("deliveryPersonId", "name phone")
      .sort({ createdAt: -1 });

      res.json({
        orders,
        role: user.role    // ✅ send role to frontend
      });
  } catch (error) {
    console.error("GetOrders Error:", error);
    res.status(500).json({ message: "Failed to retrieve orders", error: error.message });
  }
};
exports.updateOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { items, status, paymentDetails } = req.body;

    const existingOrder = await Order.findById(orderId);
    if (!existingOrder) return res.status(404).json({ message: "Order not found" });

    // Get io
    const io = req.app.get("io");

    // If order is pending -> allow editing items & payment and adjust stock
    if (existingOrder.status === "pending") {
      // Restore old quantities (undo old reservation)
      for (let oldItem of existingOrder.items) {
        if (oldItem.productId) {
          await Product.findByIdAndUpdate(oldItem.productId, {
            $inc: { totalQuantity: Number(oldItem.quantity || 0) }
          });
        }
      }

      // Validate new items stock (optional: add validation here if needed)
      // Deduct new quantities
      for (let newItem of items) {
        if (newItem.productId) {
          await Product.findByIdAndUpdate(newItem.productId, {
            $inc: { totalQuantity: -Number(newItem.quantity || 0) }
          });
        }
      }

      // Build updated items + calculate totalAmount
      let totalAmount = 0;
      const updatedItems = items.map((item) => {
        const price = Number(item.price || 0);
        const qty = Number(item.quantity || 0);
        const totalPrice = qty * price;
        totalAmount += totalPrice;

        return {
          productId: item.productId,
          productName: item.productName || "",
          quantity: qty,
          quantityValue: item.quantityValue,
          unitType: item.unitType,
          price,
          totalPrice,
          warehouseName: item.warehouseName || "",
          warehouseAddress: item.warehouseAddress || "",
          warehouseId: item.warehouseId || "",
        };
      });

      // Recalculate payment details from items (backend source of truth)
      const paid = Number(paymentDetails?.paidAmount || 0);
      const balance = totalAmount - paid;
      const updatedPaymentDetails = {
        totalAmount,
        paidAmount: paid,
        balanceAmount: balance < 0 ? 0 : balance,
        paymentStatus:
          paid === 0 ? "unpaid" :
            paid >= totalAmount ? "paid" : "partial",
      };

      // Update order (items + payment + status)
      const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        {
          status: status || existingOrder.status,
          items: updatedItems,
          paymentDetails: updatedPaymentDetails,
        },
        { new: true }
      );

      // Notify sockets
      io.to("admins").emit("order_updated", updatedOrder);
      if (updatedOrder.deliveryPersonId) {
        io.to(updatedOrder.deliveryPersonId.toString()).emit("order_updated", updatedOrder);
      }

      return res.json({ message: "Order updated successfully", order: updatedOrder });
    }

    // -------------------------
    // existingOrder is NOT pending
    // -------------------------
    // In this case: DO NOT change items/payment (enforced).
    // Only allow changing status (if provided).
    // We will update only the status field.
    if (typeof status === "undefined" || status === existingOrder.status) {
      return res.status(403).json({
        message: `Order items can only be modified when order is 'pending'. Current status: ${existingOrder.status}`
      });
    }

    // Validate status transition? (optional)
    // Update only status
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );

    // Notify sockets about status change
    io.to("admins").emit("order_status_updated", updatedOrder);
    if (updatedOrder.deliveryPersonId) {
      io.to(updatedOrder.deliveryPersonId.toString()).emit("order_status_updated", updatedOrder);
    }
    io.emit("order_status_updated_global", updatedOrder);

    return res.json({ message: "Order status updated successfully", order: updatedOrder });

  } catch (error) {
    console.error("Update Order Error:", error);
    return res.status(500).json({ message: "Server error", error: error.message || error });
  }
};




exports.collectOrder = async (req, res) => {
  try {
    const { id, itemId } = req.params;

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Find the item inside order.items
    const item = order.items.id(itemId);
    if (!item) return res.status(404).json({ message: "Item not found" });

    // Mark only this item as collected
    item.collected = true;

    await order.save();
    const io = req.app.get("io");
    io.emit("order_collected", order);
    res.json({
      message: "Item collected successfully",
      order,
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
 
    if (!updatedOrder) {
      return res.status(404).json({
        message: "Order not found or unauthorized",
      });
    }
    const io = req.app.get("io");

    // Notify admin panel
    io.to("admins").emit("order_status_updated", updatedOrder);

    // Notify delivery boy assigned to this order
    io.to(updatedOrder.deliveryPersonId.toString())
      .emit("order_status_updated", updatedOrder);

    // Optional global event
    io.emit("order_status_updated_global", updatedOrder);


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
    for (let item of order.items) {
      const restoreQty = Number(item.quantity) || 0;

      if (restoreQty > 0) {
        await Product.findByIdAndUpdate(
          item.productId,
          { $inc: { totalQuantity: restoreQty } }
        );
      }
    }

    // STEP 3: Delete the order after stock is restored
    await Order.findByIdAndDelete(id);
    const io = req.app.get("io");
    io.emit("order_deleted", { orderId: id });
    return res.json({ message: "Order deleted successfully" });


  } catch (error) {
    console.error("deleteOrder Error:", error);
    res.status(500).json({ error: error.message });
  }
};
