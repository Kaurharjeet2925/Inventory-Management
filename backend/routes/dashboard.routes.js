const router = require("express").Router();
const auth = require("../middleware/auth");
const { getPaymentStatusPie, getTopProducts, getDashboardSummary, getUserStatsForDashboard } = require("../controller/dashboard.controller");
router.get("/payment-summary", auth, getPaymentStatusPie);
router.get("/top-products", auth, getTopProducts);
router.get("/summary",  auth, getDashboardSummary);
router.get("/user-stats", auth, getUserStatsForDashboard);
module.exports = router;