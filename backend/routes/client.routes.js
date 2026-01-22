const express = require("express");
const router = express.Router();
const clientController = require("../controller/client.controller");
const auth = require("../middleware/auth");

// 🔐 Protect ALL routes below this line
router.use(auth);

// Get all clients
router.get("/clients", clientController.getAllClients);

// Get client by ID
router.get("/clients/:id", clientController.getClientById);

// Client ledger
router.get("/clients/:id/client-ledger", clientController.getClientLedger);

// Search clients
router.get("/clients/search/query", clientController.searchClients);

// Export report
router.get(
  "/reports/client-ledger/:clientId",
  clientController.exportClientReport
);

// Create client
router.post("/clients", clientController.createClient);

// Adjust payment ✅ FIXED
router.post(
  "/clients/:id/adjust-payment",
  clientController.adjustClientPayment
);

// Update client
router.put("/clients/:id", clientController.updateClient);

// Delete client
router.delete("/clients/:id", clientController.deleteClient);

module.exports = router;
