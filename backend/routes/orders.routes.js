const express = require("express");
const router = express.Router();
const { createOrder, getOrders, getOrderById, updateOrderStatus } = require("../controller/orders.controller");

// Create order
router.post("/orders", createOrder);
// List orders
router.get("/orders", getOrders);
// Get single order
router.get("/orders/:id", getOrderById);
// Update status
router.put("/orders/:id/status", updateOrderStatus);

module.exports = router;
