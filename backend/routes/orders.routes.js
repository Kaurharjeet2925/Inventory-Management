const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");   // ✅ import auth
const { 
  createOrder, 
  getOrders, 
  getOrderById, 
  updateOrderStatus, 
  deleteOrder ,
    collectOrder,
    updateOrder
} = require("../controller/orders.controller");

// Create order
router.post("/orders", auth, createOrder);

// List orders
router.get("/orders", auth, getOrders);
router.put("/orders/:id/collect-item/:itemId", auth, collectOrder);
router.put("/orders/:id", auth, updateOrder);
// Get single order
router.get("/orders/:id", auth, getOrderById);

// Update status
router.put("/orders/:id/status", auth, updateOrderStatus);

// Delete order
router.delete("/orders/:id", auth, deleteOrder);

module.exports = router;
