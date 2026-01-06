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
    updateOrder,
    generateInvoice,
    updateOrderPayment,
    getAllOrders,
    deliverySummary,
    agentDashboardSummary
} = require("../controller/orders.controller");

// Create order
router.post("/orders", auth, createOrder);

// List orders
router.get("/orders", auth, getOrders);
router.get("/all-order", auth, getAllOrders);
router.get("/delivery-summary", auth, deliverySummary);
router.put("/orders/:id/collect-item/:itemId", auth, collectOrder);
router.put("/orders/:id", auth, updateOrder);
router.put("/orders/:id/payment", auth, updateOrderPayment);
router.get("/agent-dashboard-summary", auth, agentDashboardSummary);

// Get single order
router.get("/orders/:id", auth, getOrderById);
router.get("/invoice/:id", generateInvoice);

// Update status
router.put("/orders/:id/status", auth, updateOrderStatus);


// Delete order
router.delete("/orders/:id", auth, deleteOrder);

module.exports = router;
