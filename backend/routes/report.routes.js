const router = require("express").Router();
const { generateDailySalesReport, generateInventoryReport, getSalesTrend} = require("../controller/report.controller");
const auth = require("../middleware/auth");
router.get("/daily-sales",auth, generateDailySalesReport);
router.get("/inventory-report",auth, generateInventoryReport);
router.get("/sales-trend",auth, getSalesTrend);
module.exports = router;
