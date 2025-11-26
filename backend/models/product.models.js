const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    brand: { type: mongoose.Schema.Types.ObjectId, ref: "Brand" },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },

    quantity: { type: Number, default: 0 },
    unit: { type: String },
    mrp: { type: Number },
    price: { type: Number },

    description: { type: String },
    rating: { type: Number, default: 0 },

    location: {
  type: String,
  enum: ["WAREHOUSE-A", "WAREHOUSE-B", "WAREHOUSE-C", "WAREHOUSE-D"],
  default: "WAREHOUSE-A"
}
,

    thumbnail: { type: String }, 
    images: [String],            
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
