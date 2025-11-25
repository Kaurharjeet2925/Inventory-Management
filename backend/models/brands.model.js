const mongoose = require("mongoose");

const brandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true
    },
    image: {
      type: String, // will store file URL or path
      default: ""
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Brand", brandSchema);
