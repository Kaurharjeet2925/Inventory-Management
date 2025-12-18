const router = require("express").Router();
const { getPaymentStatusPie, getTopProducts, getDashboardSummary } = require("../controller/dashboard.controller");
router.get("/payment-summary", getPaymentStatusPie);
router.get("/top-products", getTopProducts);
router.get("/summary", getDashboardSummary);
module.exports = router;