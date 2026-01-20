const mongoose = require("mongoose");

const clientLedgerSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
    },

    type: {
      type: String,
      enum: ["opening", "order", "payment", "adjustment","order_adjustment"],
      required: true,
    },

    referenceId: {
      type: mongoose.Schema.Types.ObjectId, // orderId / paymentId
    },

    description: { type: String },

    debit: { type: Number, default: 0 },   // client owes
    credit: { type: Number, default: 0 },  // client advance

    balanceAfter: { type: Number, required: true }, // running balance

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ClientLedger", clientLedgerSchema);
