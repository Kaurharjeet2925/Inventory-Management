const router = require("express").Router();
const { generateDailySalesReport } = require("../controller/report.controller");

router.get("/daily-sales", generateDailySalesReport);

module.exports = router;
