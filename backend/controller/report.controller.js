const Order = require("../models/orders.model");
const ExcelJS = require("exceljs");
const moment = require("moment");

exports.generateDailySalesReport = async (req, res) => {
  try {
    const { start, end } = req.query;

    const startDate = moment(start, "DD-MM-YYYY").startOf("day");
    const endDate = moment(end, "DD-MM-YYYY").endOf("day");

    const orders = await Order.find({
      createdAt: { $gte: startDate, $lte: endDate },
    })
      .populate("clientId")
      .populate("deliveryPersonId")
      .populate("assignedBy");

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Daily Sales Report");

    // HEADER
    sheet.addRow([
      "Date",
      "Order ID",
      "Admin Name",
      "Client Name",
      "Company Name",
      "Client Address",
      "Agent",
      "Product",
      "Qty",
      "Warehouse",
      "Status",
      "Amount",
    ]);

    sheet.getRow(1).eachCell((cell) => (cell.font = { bold: true }));

    // MAIN DATA
    orders.forEach((order) => {
      const orderAmount =
        order.paymentDetails?.totalAmount ||
        order.items.reduce(
          (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
          0
        );
    
      order.items.forEach((item, index) => {
        sheet.addRow([
          index === 0 ? moment(order.createdAt).format("DD-MM-YYYY") : "",
          index === 0 ? order.orderId : "",
          index === 0 ? order.assignedBy?.name || "N/A" : "",
          index === 0 ? order.clientId?.name || "N/A" : "",
          index === 0 ? order.clientId?.companyName || "N/A" : "",
          index === 0 ? order.clientId?.address || "N/A" : "",
          index === 0 ? order.deliveryPersonId?.name || "N/A" : "",
    
          `${item.productName} (${item.quantityValue}${item.quantityUnit})`,
          item.quantity,
          item.warehouseName || "N/A",
    
          index === 0 ? order.status : "",
          index === 0 ? orderAmount : "",
        ]);
      });
    
      // ❌ Removed this line:
      // sheet.addRow([]);
    });
    

    // Auto column width
    sheet.columns.forEach((col) => {
      let maxLength = 0;
      col.eachCell({ includeEmpty: true }, (cell) => {
        const columnLength = cell.value ? cell.value.toString().length : 10;
        if (columnLength > maxLength) maxLength = columnLength;
      });
      col.width = maxLength + 5;
    });

    // SEND FILE
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=DailySalesReport.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("Report Error:", err);
    res.status(500).json({ message: "Failed to generate report" });
  }
};
