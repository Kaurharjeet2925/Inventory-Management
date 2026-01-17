const ClientLedger = require("../models/clientLedger.model");

/**
 * Returns last balance from ledger.
 * If no ledger exists, returns fallbackBalance
 */
const getLastLedgerBalance = async (clientId, fallbackBalance = 0) => {
  const lastEntry = await ClientLedger.findOne({ clientId })
    .sort({ createdAt: -1 })
    .select("balanceAfter");

  return lastEntry ? lastEntry.balanceAfter : fallbackBalance;
};

module.exports = {
  getLastLedgerBalance,
};
