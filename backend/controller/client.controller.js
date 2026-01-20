const Client = require("../models/client.model");
const Order  = require("../models/orders.model.js")

const ClientLedger = require("../models/clientLedger.model");
const mongoose = require("mongoose")
// Get all clients

const {getLastLedgerBalance} = require("../utils/getLastLedgerBalance.js")
exports.getAllClients = async (req, res) => {
  try {
   const clients = await Client.aggregate([
  {
    $lookup: {
      from: "orders",
      localField: "_id",
      foreignField: "clientId",
      as: "orders",
    },
  },
  {
    $addFields: {
      totalOrders: { $size: "$orders" },
    },
  },
  {
    $project: {
      orders: 0, // remove orders array
    },
  },
  { $sort: { createdAt: -1 } },
]);


    res.json({
      message: "Clients retrieved successfully",
      clients,
      total: clients.length,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching clients", error: error.message });
  }
};

// Get client by ID
exports.getClientById = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id).populate("createdBy", "name email");

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    res.json({
      message: "Client retrieved successfully",
      client,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching client", error: error.message });
  }
};

// Create new client
exports.createClient = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      companyName,
      address,
      city,
      state,
      zipCode,
      country,
      notes,
      openingBalance = 0,
      openingBalanceType = "debit",
    } = req.body;

    if (!name || !email || !phone) {
      return res
        .status(400)
        .json({ message: "Name, email, and phone are required" });
    }

    const existingClient = await Client.findOne({ email });
    if (existingClient) {
      return res
        .status(400)
        .json({ message: "Client with this email already exists" });
    }

    // ✅ NORMALIZE opening balance
    const absOpeningBalance = Math.abs(Number(openingBalance) || 0);

    // ✅ SIGNED running balance
    const balance =
      openingBalanceType === "credit"
        ? -absOpeningBalance
        : absOpeningBalance;

    const newClient = await Client.create({
      name,
      email,
      phone,
      companyName,
      address,
      city,
      state,
      zipCode,
      country,
      notes,
      openingBalance: absOpeningBalance,      // ALWAYS positive
      openingBalanceType,                     // debit / credit
      balance,                                // signed
      createdBy: req.user?._id,
    });

    // 🔹 Opening ledger entry
    if (absOpeningBalance !== 0) {
      await ClientLedger.create({
        clientId: newClient._id,
        type: "opening",
        description: "Opening Balance",
        debit: openingBalanceType === "debit" ? absOpeningBalance : 0,
        credit: openingBalanceType === "credit" ? absOpeningBalance : 0,
        balanceAfter: balance,
        createdBy: req.user?._id,
      });
    }

    const populatedClient = await newClient.populate(
      "createdBy",
      "name email"
    );

    res.status(201).json({
      message: "Client created successfully",
      client: populatedClient,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error creating client",
      error: error.message,
    });
  }
};



// Update client
exports.updateClient = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      companyName,
      address,
      city,
      state,
      zipCode,
      country,
      notes,
      openingBalance,
      openingBalanceType,
    } = req.body;

    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    /* ================= NORMALIZE OPENING ================= */
    const absOpening = Math.abs(Number(openingBalance) || 0);
    const signedOpening =
      openingBalanceType === "credit" ? -absOpening : absOpening;

    const oldOpening =
      client.openingBalanceType === "credit"
        ? -client.openingBalance
        : client.openingBalance;

    /* ================= UPDATE BASIC INFO ================= */
    client.name = name;
    client.email = email;
    client.phone = phone;
    client.companyName = companyName;
    client.address = address;
    client.city = city;
    client.state = state;
    client.zipCode = zipCode;
    client.country = country;
    client.notes = notes;
    client.openingBalance = absOpening;
    client.openingBalanceType = openingBalanceType;

    /* ================= OPENING BALANCE CHANGED ================= */
    if (signedOpening !== oldOpening) {
      const difference = signedOpening - oldOpening;

      // get last ledger balance
      const lastLedger = await ClientLedger.findOne({
        clientId: client._id,
      }).sort({ createdAt: -1 });

      const previousBalance = lastLedger
        ? lastLedger.balanceAfter
        : oldOpening;

      const newBalance = previousBalance + difference;

      client.balance = newBalance;

      await ClientLedger.create({
        clientId: client._id,
        type: "adjustment",
        description: "Opening balance updated",
        debit: difference > 0 ? difference : 0,
        credit: difference < 0 ? Math.abs(difference) : 0,
        balanceAfter: newBalance,
        createdBy: req.user?._id,
      });
    }

    await client.save();

    res.json({
      message: "Client updated successfully",
      client,
    });
  } catch (error) {
    console.error("updateClient error:", error);
    res.status(500).json({
      message: "Error updating client",
      error: error.message,
    });
  }
};




// Delete client
exports.deleteClient = async (req, res) => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id);

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    res.json({
      message: "Client deleted successfully",
      client,
    });
  } catch (error) {
    res.status(500).json({ message: "Error deleting client", error: error.message });
  }
};

// Search clients
exports.searchClients = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const clients = await Client.find({
      $or: [
        { name: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
        { phone: { $regex: q, $options: "i" } },
        { city: { $regex: q, $options: "i" } },
      ],
    })
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.json({
      message: "Search completed successfully",
      clients,
      total: clients.length,
    });
  } catch (error) {
    res.status(500).json({ message: "Error searching clients", error: error.message });
  }
};
exports.adjustClientPayment = async (req, res) => {
  try {
    const { amount, note } = req.body;
    const clientId = req.params.id;

    const paymentAmount = Number(amount);
    if (!paymentAmount || paymentAmount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    // 🔹 Get last balance
    let runningBalance = await getLastLedgerBalance(
      clientId,
      client.openingBalanceType === "credit"
        ? -client.openingBalance
        : client.openingBalance
    );

    // ================= PAYMENT RECEIVED =================
    runningBalance -= paymentAmount;

    await ClientLedger.create({
      clientId,
      type: "payment",
      description: note || "Payment received",
      debit: 0,
      credit: paymentAmount,
      balanceAfter: runningBalance,
      createdBy: req.user?._id || null,
    });

    // ================= APPLY TO ORDERS =================
    let remainingAmount = paymentAmount;

    const orders = await Order.find({
      clientId,
      "paymentDetails.balanceAmount": { $gt: 0 },
    }).sort({ createdAt: 1 });

    for (const order of orders) {
      if (remainingAmount <= 0) break;

      const balance = order.paymentDetails.balanceAmount;
      const adjust = Math.min(balance, remainingAmount);

      // update order
      order.paymentDetails.paidAmount += adjust;
      order.paymentDetails.balanceAmount -= adjust;
      order.paymentDetails.paymentStatus =
        order.paymentDetails.balanceAmount === 0 ? "paid" : "partial";

      await order.save();

      // 🔥 THIS IS THE MAIN FIX
      runningBalance += adjust; // debit reduces credit

      // await ClientLedger.create({
      //   clientId,
      //   type: "order_adjustment",
      //   referenceId: order._id,
      //   description: `Adjusted against Order ${order.orderId}`,
      //   debit: adjust,
      //   credit: 0,
      //   balanceAfter: runningBalance,
      //   createdBy: req.user?._id,
      // });

      remainingAmount -= adjust;
    }

    // save final client balance
    client.balance = runningBalance;
    await client.save();

    return res.json({
      message: "Payment adjusted successfully",
      finalBalance: runningBalance,
    });
  } catch (error) {
    console.error("adjustClientPayment error:", error);
    return res.status(500).json({
      message: "Adjustment failed",
      error: error.message,
    });
  }
};

exports.getClientLedger = async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ IMPORTANT: validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid client id",
      });
    }

    const clientId = new mongoose.Types.ObjectId(id);

    const ledger = await ClientLedger.find({ clientId })
      .sort({ createdAt: 1 });

    let openingBalance = 0;
    let totalDebit = 0;
    let totalCredit = 0;
    let currentBalance = 0;

    ledger.forEach((row, index) => {
      totalDebit += row.debit;
      totalCredit += row.credit;

      if (row.type === "opening") {
        openingBalance = row.balanceAfter;
      }

      if (index === ledger.length - 1) {
        currentBalance = row.balanceAfter;
      }
    });

    return res.json({
      openingBalance,
      totalDebit,
      totalCredit,
      currentBalance,
      ledger,
    });
  } catch (error) {
    console.error("getClientLedger error:", error);
    return res.status(500).json({
      message: "Failed to fetch client ledger",
    });
  }
};
const ExcelJS = require("exceljs");

exports.exportClientReport = async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;

    const match = {};
    if (fromDate && toDate) {
      match.createdAt = {
        $gte: new Date(fromDate),
        $lte: new Date(toDate + "T23:59:59"),
      };
    }

    const orders = await Order.find(match)
      .populate("clientId")
      .lean();

    const clientMap = {};

    orders.forEach((o) => {
      const c = o.clientId;
      if (!c) return;

      if (!clientMap[c._id]) {
        clientMap[c._id] = {
          client: c,
          totalOrders: 0,
          totalAmount: 0,
          totalDiscount: 0,
          totalPaid: 0,
          totalPending: 0,
        };
      }

      clientMap[c._id].totalOrders += 1;
      clientMap[c._id].totalAmount += o.paymentDetails.totalAmount || 0;
      clientMap[c._id].totalDiscount += o.paymentDetails.discount || 0;
      clientMap[c._id].totalPaid += o.paymentDetails.paidAmount || 0;
      clientMap[c._id].totalPending += o.paymentDetails.balanceAmount || 0;
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Client Report");

    sheet.columns = [
      { header: "Client Name", key: "name", width: 20 },
      { header: "Company", key: "company", width: 22 },
      { header: "Phone", key: "phone", width: 15 },
      { header: "Email", key: "email", width: 25 },
      { header: "Total Orders", key: "orders", width: 14 },
      { header: "Total Order Amount", key: "totalAmount", width: 18 },
      { header: "Total Discount", key: "discount", width: 15 },
      { header: "Net Sales", key: "netSales", width: 15 },
      { header: "Total Paid", key: "paid", width: 15 },
      { header: "Total Pending", key: "pending", width: 15 },
      { header: "Opening Balance", key: "opening", width: 18 },
      { header: "Closing Balance", key: "closing", width: 18 },
      { header: "Balance Type", key: "balanceType", width: 14 },
      { header: "From Date", key: "fromDate", width: 14 },
      { header: "To Date", key: "toDate", width: 14 },
    ];

    Object.values(clientMap).forEach(({ client, ...data }) => {
      sheet.addRow({
        name: client.name,
        company: client.companyName || "",
        phone: client.phone,
        email: client.email,
        orders: data.totalOrders,
        totalAmount: data.totalAmount,
        discount: data.totalDiscount,
        netSales: data.totalAmount - data.totalDiscount,
        paid: data.totalPaid,
        pending: data.totalPending,
        opening: client.openingBalance || 0,
        closing: client.balance || 0,
        balanceType: client.balance > 0 ? "Debit" : client.balance < 0 ? "Credit" : "Zero",
        fromDate,
        toDate,
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=client-report.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to generate report" });
  }
};


