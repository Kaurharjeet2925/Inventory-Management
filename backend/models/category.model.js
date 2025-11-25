const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
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

module.exports = mongoose.model("Category", categorySchema);
