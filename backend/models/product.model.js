const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    brand: { type: mongoose.Schema.Types.ObjectId, ref: "Brand" },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    quantityValue: { type: Number, default: 0 },
    quantityUnit: { type: String },
    totalQuantity: { type: Number, default: 1 },
    mrp: { type: Number },
    price: { type: Number },
    description: { type: String },
    rating: { type: Number, default: 0 },
//     location: {
//   type: String,
//   enum: ["WAREHOUSE-A", "WAREHOUSE-B", "WAREHOUSE-C", "WAREHOUSE-D"],
//   default: "WAREHOUSE-A"
// }
location: { type: mongoose.Schema.Types.ObjectId, ref: "Location" },


    thumbnail: { type: String }, 
    images: [String],            
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
