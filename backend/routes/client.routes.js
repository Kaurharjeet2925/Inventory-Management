const express = require("express");
const router = express.Router();
const clientController = require("../controller/client.controller");
const auth = require("../middleware/auth");


// Get all clients
router.get("/clients", auth, clientController.getAllClients);

// Get client by ID
router.get("/clients/:id",auth, clientController.getClientById);

// Client ledger
router.get("/clients/:id/client-ledger", auth, clientController.getClientLedger);

// Search clients
router.get("/clients/search/query", auth, clientController.searchClients);

// Export report
router.get(
  "/reports/client-ledger/:clientId", auth,
  clientController.exportClientReport
);
// Download client ledger excel
router.get(
  "/clients/:id/client-ledger-excel",
  auth,
  clientController.downloadClientLedgerExcel
);

// Create client
router.post("/clients", auth, clientController.createClient);

// Adjust payment ✅ FIXED
router.post(
  "/clients/:id/adjust-payment",
  auth,
  clientController.adjustClientPayment
);

// Update client
router.put("/clients/:id", auth, clientController.updateClient);

// Delete client
router.delete("/clients/:id", auth, clientController.deleteClient);

module.exports = router;
