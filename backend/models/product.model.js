const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      required: true,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    quantityValue: { type: Number },
    quantityUnit: { type: String },

    /* ✅ MULTI WAREHOUSE STOCK */
    warehouses: [
      {
        location: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Location",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],

    /* ✅ DERIVED FIELD */
    totalQuantity: {
      type: Number,
      default: 0,
    },

    mrp: { type: Number },
    price: { type: Number },
    description: { type: String },
    rating: { type: Number, default: 0 },

    thumbnail: { type: String },
    images: [String],
  },
  { timestamps: true }
);

/* ✅ AUTO CALCULATE TOTAL STOCK */
productSchema.pre("save", function (next) {
  this.totalQuantity = this.warehouses.reduce(
    (sum, w) => sum + Number(w.quantity || 0),
    0
  );
  next();
});

module.exports = mongoose.model("Product", productSchema);
