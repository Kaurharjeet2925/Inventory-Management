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
    const { clientId, clientName, items, notes, status = "pending" } = req.body;
    console.log("Create Order Request:", req.body);
    if (!clientId) {
      return res.status(400).json({ message: "Client is required" });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Order must contain at least 1 item" });
    }

    // 1️⃣ Validate stock for each product and normalize item fields
    for (let item of items) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.productId}` });
      }

      // normalize quantity and ensure positive number
      item.quantity = Number(item.quantity || 0);
      if (!item.quantity || item.quantity <= 0) {
        return res.status(400).json({ message: `Invalid quantity for product ${product.name}` });
      }

      // if client didn't provide productName, unitType, or quantityValue, fill from product
      if (!item.productName) item.productName = product.name;
      if (!item.unitType) item.unitType = product.quantityUnit || null;
      if (!item.quantityValue) item.quantityValue = product.quantityValue || null;

      const available = product.totalQuantity || 0;
      if (item.quantity > available) {
        return res.status(400).json({ message: `Not enough stock for ${product.name}. Available: ${available}` });
      }
    }

    // 2️⃣ Deduct stock (perform updates)
    for (let item of items) {
      await Product.findByIdAndUpdate(item.productId, { $inc: { totalQuantity: -item.quantity } });
    }

    
const orderId = await generateOrderId();

const formattedItems = items.map(item => ({
  productId: item.productId,
  productName: item.productName,
  quantityValue: item.quantityValue,
  unitType: item.unitType,
  quantity: Number(item.quantity) // ⭐ MUST INCLUDE
}));

const newOrder = await Order.create({
  orderId,
  clientId,
  clientName,
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

    let filter = {};

    // Delivery boy should only get their own orders
    if (user.role === "delivery-boy") {
      filter.deliveryPersonId = user._id;
    }

    const orders = await Order.find(filter)
      .populate("clientId", "name phone")
      .populate("deliveryPersonId", "name phone")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve orders", error: error.message });
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
    if (!status) return res.status(400).json({ message: "Status is required" });

    const order = await Order.findByIdAndUpdate(id, { status }, { new: true });
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json({ message: "Order updated", order });
  } catch (error) {
    console.error("updateOrderStatus Error:", error);
    res.status(500).json({ error: error.message });
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
