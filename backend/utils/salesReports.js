const ExcelJS = require("exceljs");

const generateSalesReport = async (data) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Daily Sale Report");

  // -------------------------
  // TITLE
  // -------------------------
  sheet.mergeCells("A1:K1");  
  const title = sheet.getCell("A1");
  title.value = "Daily Sale Details";
  title.font = { size: 16, bold: true };
  title.alignment = { horizontal: "center" };

  sheet.addRow([]); // Blank Row

  // -------------------------
  // HEADER ROW
  // -------------------------
  const headerRow = sheet.addRow([
    "Date",
    "Order ID",
    "Order (Product + Qty + Unit)", 
    "Client Name",
    "Client Address",
    "Warehouse",
    "Warehouse Address",
    "Amount",
    "Company",
    "Cash",
    "Balance"
  ]);

  headerRow.eachCell((cell) => {
    cell.font = { bold: true };
    cell.alignment = { horizontal: "center" };
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  });

  // -------------------------
  // DATA ROWS
  // -------------------------
  data.forEach(item => {
    sheet.addRow([
      item.date,
      item.orderId,
      `${item.productName} (${item.quantityValue} ${item.unit})`,
      item.clientName,
      item.clientAddress,
      item.warehouseName,
      item.warehouseAddress,
      item.amount,
      item.company,
      item.cash,
      item.balance,
    ]);
  });

  // Auto column width
  sheet.columns.forEach(col => col.width = 25);

  return workbook.xlsx.writeBuffer();
};

module.exports = generateSalesReport;
