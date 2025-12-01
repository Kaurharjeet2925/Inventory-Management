const express = require("express");
const router = express.Router();
const { createOrder, getOrders, getOrderById, updateOrderStatus, deleteOrder } = require("../controller/orders.controller");

// Create order
router.post("/orders", createOrder);
// List orders
router.get("/orders", getOrders);
// Get single order
router.get("/orders/:id", getOrderById);
// Update status
router.put("/orders/:id/status", updateOrderStatus);
// Delete order
router.delete("/orders/:id", deleteOrder);

module.exports = router;
