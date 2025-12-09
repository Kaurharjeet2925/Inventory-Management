const generateSalesReport = require("../utils/salesReports");

exports.downloadSalesReport = async (req, res) => {
  try {
    // Example data (replace with your DB query)
    const salesData = [
      {
        date: "01.12.2025",
        party: "Anurag Bhai",
        company: "Nexgen",
        pcs: 1,
        particulars: "Whey Protein 2kg",
        amount: 2700,
        cash: "",
        ac: "",
        discount: "",
        balance: 0,
        accountHolder: ""
      }
    ];

    const fileBuffer = await generateSalesReport(salesData);

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=daily_sale.xlsx");

    res.send(fileBuffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error generating report" });
  }
};
