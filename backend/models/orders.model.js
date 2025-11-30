const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, unique: true }, 

    clientId: { type: mongoose.Schema.Types.ObjectId, ref: "Client", required: true },

    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        productName: String,
        totalQuantity: Number,           // how many units ordered
        quantityValue: Number,       // size of each unit (e.g., 20 pieces per packet)
        unitType: String,           // unit type (packet, piece, etc.)
      }
    ],

    notes: String,
    status: { type: String, default: "pending" }, 
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
