const Category = require("../models/category.model");

// ADD Category
exports.addCategory = async (req, res) => {
  try {
	const { name } = req.body;
	const image = req.files?.uploadImage
	  ? req.files.uploadImage[0].filename
	  : "";

	if (!name)
	  return res.status(400).json({ message: "Category name is required" });

	const exists = await Category.findOne({ name });
	if (exists)
	  return res.status(400).json({ message: "Category already exists" });

	const category = await Category.create({ name, image });

	res.status(201).json({
	  message: "Category added successfully",
	  category
	});
  } catch (error) {
	res.status(500).json({ message: "Error adding category", error: error.message });
  }
};


// GET ALL Category
exports.getCategory = async (req, res) => {
  try {
	const categories = await Category.find().sort({ createdAt: -1 });
	res.json(categories);
  } catch (error) {
	res.status(500).json({ message: "Error fetching categories", error: error.message });
  }
};


// DELETE CATEGORY
exports.deleteCategory = async (req, res) => {
  try {
	const { id } = req.params;
	await Category.findByIdAndDelete(id);
	res.json({ message: "Category deleted successfully" });
  } catch (error) {
	res.status(500).json({ message: "Error deleting category", error: error.message });
  }
};


// UPDATE Category
exports.updateCategory = async (req, res) => {
  try {
	const { id } = req.params;
	const { name } = req.body;

	let image = req.files?.uploadImage
	  ? req.files.uploadImage[0].filename
	  : undefined;

	const updateData = { name };
	if (image) updateData.image = image;

	const updated = await Category.findByIdAndUpdate(id, updateData, { new: true });

	res.json({
	  message: "Category updated successfully",
	  category: updated
	});
  } catch (error) {
	res.status(500).json({ message: "Error updating category", error: error.message });
  }
};
