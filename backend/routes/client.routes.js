const express = require("express");
const router = express.Router();
const clientController = require("../controller/client.controller");
const auth = require("../middleware/auth");

// Get all clients
router.get("/clients", clientController.getAllClients);

// Get client by ID
router.get("/clients/:id", clientController.getClientById);
router.get("/clients/:id/client-ledger", clientController.getClientLedger);
// router.get("/clients/:id/client-ledger",clientController.c)
// Search clients
router.get("/clients/search/query", clientController.searchClients);

// Create new client (protected route)
router.post("/clients", auth, clientController.createClient);
router.post("/clients/:id/adjust-payment",clientController.adjustClientPayment)
// Update client (protected route)
router.put("/clients/:id", auth, clientController.updateClient);

// Delete client (protected route)
router.delete("/clients/:id", auth, clientController.deleteClient);

module.exports = router;
