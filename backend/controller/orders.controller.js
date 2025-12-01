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

    // 3️⃣ Generate orderId and create the order
    const orderId = await generateOrderId();
    const newOrder = await Order.create({
      orderId,
      clientId,
      clientName,
      items,
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
    const orders = await Order.find().populate("clientId", "name").sort({ createdAt: -1 });
    
    // Auto-assign orderId to orders that don't have one
    let counter = 1;
    for (let order of orders) {
      if (!order.orderId) {
        order.orderId = `STN${String(counter).padStart(5, '0')}`;
        await order.save();
        counter++;
      } else {
        const match = order.orderId.match(/\d+$/);
        if (match) {
          const num = parseInt(match[0]);
          if (num >= counter) {
            counter = num + 1;
          }
        }
      }
      
      // Extract clientName from populated clientId if missing
      if (!order.clientName && order.clientId && order.clientId.name) {
        order.clientName = order.clientId.name;
        await order.save();
      }
    }
    
    // Re-fetch and transform response to include clientName as string
    const updatedOrders = await Order.find().populate("clientId", "name").sort({ createdAt: -1 });
    
    // Transform: extract clientName from clientId object
    const transformedOrders = updatedOrders.map(order => ({
      ...order.toObject(),
      clientName: order.clientName || (order.clientId?.name || "Unknown")
    }));
    
    res.json({ orders: transformedOrders });
  } catch (error) {
    console.error("getOrders Error:", error);
    res.status(500).json({ error: error.message });
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
    const order = await Order.findByIdAndDelete(id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    
    // Restore stock for all items in deleted order
    for (let item of order.items) {
      await Product.findByIdAndUpdate(item.productId, { $inc: { totalQuantity: item.quantity } });
    }
    
    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    console.error("deleteOrder Error:", error);
    res.status(500).json({ error: error.message });
  }
};
