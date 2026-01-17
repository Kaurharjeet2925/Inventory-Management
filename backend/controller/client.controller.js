const Client = require("../models/client.model");
const ClientLedger = require("../models/clientLedger.model");
const mongoose = require("mongoose")
// Get all clients

const {getLastLedgerBalance} = require("../utils/getLastLedgerBalance.js")
exports.getAllClients = async (req, res) => {
  try {
    const clients = await Client.find()
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

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
      return res.status(400).json({
        message: "Invalid amount",
      });
    }

    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({
        message: "Client not found",
      });
    }

    const previousBalance = await getLastLedgerBalance(
  clientId,
  client.openingBalanceType === "credit"
    ? -client.openingBalance
    : client.openingBalance
);

const newBalance = previousBalance - paymentAmount; // allow negative

    client.balance = newBalance;
    await client.save();

    // 🔹 Ledger entry (system decides CREDIT)
    await ClientLedger.create({
      clientId,
      type: "adjustment",
      description: note || "Payment received",
      debit: 0,
      credit: paymentAmount,
      balanceAfter: newBalance,
      createdBy: req.user?._id || null,
    });

    return res.json({
      message: "Payment adjusted successfully",
      previousBalance,
      newBalance,
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

