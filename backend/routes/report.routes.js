const router = require("express").Router();
const { generateDailySalesReport, generateInventoryReport } = require("../controller/report.controller");
const auth = require("../middleware/auth");
router.get("/daily-sales",auth, generateDailySalesReport);
router.get("/inventory-report",auth, generateInventoryReport);
module.exports = router;
