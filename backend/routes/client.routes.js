const express = require("express");
const router = express.Router();
const clientController = require("../controller/client.controller");
const auth = require("../middleware/auth");

// Get all clients
router.get("/", clientController.getAllClients);

// Get client by ID
router.get("/:id", clientController.getClientById);

// Search clients
router.get("/search/query", clientController.searchClients);

// Create new client (protected route)
router.post("/", auth, clientController.createClient);

// Update client (protected route)
router.put("/:id", auth, clientController.updateClient);

// Delete client (protected route)
router.delete("/:id", auth, clientController.deleteClient);

module.exports = router;
