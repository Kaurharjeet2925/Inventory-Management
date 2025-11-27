const Client = require("../models/client.model");

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
    const { name, email, phone, address, city, state, zipCode, country, notes } = req.body;

    // Validate required fields
    if (!name || !email || !phone) {
      return res.status(400).json({ message: "Name, email, and phone are required" });
    }

    // Check if email already exists
    const existingClient = await Client.findOne({ email });
    if (existingClient) {
      return res.status(400).json({ message: "Client with this email already exists" });
    }

    const newClient = await Client.create({
      name,
      email,
      phone,
      address,
      city,
      state,
      zipCode,
      country,
      notes,
      createdBy: req.user?._id,
    });

    const populatedClient = await newClient.populate("createdBy", "name email");

    res.status(201).json({
      message: "Client created successfully",
      client: populatedClient,
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating client", error: error.message });
  }
};

// Update client
exports.updateClient = async (req, res) => {
  try {
    const { name, email, phone, address, city, state, zipCode, country, notes } = req.body;

    const client = await Client.findByIdAndUpdate(
      req.params.id,
      { name, email, phone, address, city, state, zipCode, country, notes },
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
    res.status(500).json({ message: "Error updating client", error: error.message });
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
