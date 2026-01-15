const Client = require("../models/client.model");
const ClientLedger = require("../models/clientLedger.model");
// Get all clients
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

    // 🔒 NORMALIZE BALANCE (THIS IS THE FIX)
    let normalizedOpeningBalance = Number(openingBalance) || 0;

    if (openingBalanceType === "credit") {
      normalizedOpeningBalance = -Math.abs(normalizedOpeningBalance);
    } else {
      normalizedOpeningBalance = Math.abs(normalizedOpeningBalance);
    }

    const client = await Client.findByIdAndUpdate(
      req.params.id,
      {
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
        openingBalance: normalizedOpeningBalance,
      },
      { new: true, runValidators: true }
    ).populate("createdBy", "name email");

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    res.json({
      message: "Client updated successfully",
      client,
    });
  } catch (error) {
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
