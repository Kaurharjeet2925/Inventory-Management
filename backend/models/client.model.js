const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    companyName: { type: String, trim: true },
email: {
  type: String,
  lowercase: true,
  trim: true,
  default: null,
},
    phone: { type: String, required: true },
    address: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    zipCode: { type: String, trim: true },
    country: { type: String, trim: true },
    notes: { type: String },

    openingBalance: { type: Number, default: 0},
    openingBalanceType: {
      type: String,
      enum: ["debit", "credit"],
      default: "debit",
    },

    balance: { type: Number, default: 0 }, // ⭐ real running balance

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
  },
  { timestamps: true }
);
module.exports = mongoose.model("Client", clientSchema);