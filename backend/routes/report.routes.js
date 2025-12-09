const express = require("express");
const router = express.Router();
const { downloadSalesReport } = require("../controllers/report.controller");

router.get("/sales-report", downloadSalesReport);

module.exports = router;
