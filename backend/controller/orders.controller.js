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
      clientName, 
      deliveryPersonId,     // ✅ required field 
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

    // validate stock...
    for (let item of items) {
      const product = await Product.findById(item.productId);
      if (!product) return res.status(404).json({ message: `Product not found: ${item.productId}` });

      item.quantity = Number(item.quantity);
      if (item.quantity <= 0) return res.status(400).json({ message: `Invalid quantity for ${product.name}` });

      if (!item.productName) item.productName = product.name;
      if (!item.unitType) item.unitType = product.quantityUnit;
      if (!item.quantityValue) item.quantityValue = product.quantityValue;

      const available = product.totalQuantity || 0;
      if (item.quantity > available)
        return res.status(400).json({ message: `Not enough stock for ${product.name}. Available: ${available}` });
    }

    // deduct stock...
    for (let item of items) {
      await Product.findByIdAndUpdate(item.productId, { $inc: { totalQuantity: -item.quantity } });
    }

    const orderId = await generateOrderId();

    const formattedItems = [];

for (let item of items) {
  const product = await Product.findById(item.productId).populate("location");

  formattedItems.push({
    productId: item.productId,
    productName: product.name,
    quantityValue: product.quantityValue,
    unitType: product.quantityUnit,
    quantity: Number(item.quantity),
    warehouseName: product.location?.name || "Not Assigned",
    warehouseAddress: product.location?.address || "Not Available"
  });
}


    const newOrder = await Order.create({
      orderId,
      clientId,
      clientName,
      deliveryPersonId,    //  ✅ FIXED
      paymentDetails,      //  optional but recommended
      items: formattedItems,
      notes,
      status
    });

    res.status(201).json({
      message: "Order created successfully",
      order: newOrder
    });

  } catch (error) {
    console.error("Create Order Error:", error);
    res.status(500).json({ message: "Server error", error });
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

    return res.json({
      message: "Status updated successfully",
      order: updatedOrder,
    });

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

    return res.json({ message: "Order deleted successfully" });

  } catch (error) {
    console.error("deleteOrder Error:", error);
    res.status(500).json({ error: error.message });
  }
};
