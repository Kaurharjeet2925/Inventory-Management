const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, unique: true }, 

    clientId: { type: mongoose.Schema.Types.ObjectId, ref: "Client", required: true },
    deliveryPersonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true
    },
    acceptedByDeliveryBoy: {
  type: Boolean,
  default: false,
},
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        productName: String,
        totalQuantity: Number,           // how many units ordered
        quantityValue: Number,       // size of each unit (e.g., 20 pieces per packet)
        quantityUnit: String,           // unit type (packet, piece, etc.)
        quantity: { type: Number, required: true }, // ⭐ ordered quantity
        warehouseName: String,
        warehouseAddress: String,
        collected: { type: Boolean, default: false },
        price: { type: Number, default: 0 },
        totalPrice: { type: Number, default: 0 },

      }

    ],
 paymentDetails: {
  totalAmount: { type: Number, required: true },
  discount: { type: Number, default: 0 },

  payments: [
    {
      mode: {
        type: String,
        enum: ["Cash", "UPI", "Card", "Bank"],
        required: true
      },
      amount: { type: Number, required: true },
      paidAt: { type: Date, default: Date.now }
    }
  ],

  manualPaidAmount: { type: Number, default: 0 }, // 👈 Cash/UPI etc
  advanceUsed: { type: Number, default: 0 },      // 👈 Ledger se use hua

  paidAmount: { type: Number, default: 0 },       // manual + advance
  balanceAmount: { type: Number, default: 0 },

  paymentStatus: {
    type: String,
    enum: ["unpaid", "partial", "paid"],
    default: "unpaid"
  }
},



    collected: { type: Boolean, default: false },
    notes: String,
    status: { type: String, default: "pending" }, 
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
