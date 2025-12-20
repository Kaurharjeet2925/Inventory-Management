const router = require("express").Router();
const { getPaymentStatusPie, getTopProducts, getDashboardSummary, getUserStatsForDashboard } = require("../controller/dashboard.controller");
router.get("/payment-summary", getPaymentStatusPie);
router.get("/top-products", getTopProducts);
router.get("/summary", getDashboardSummary);
router.get("/user-stats", getUserStatsForDashboard);
module.exports = router;