const Brand = require("../models/brands.model");

// ADD BRAND
exports.addBrand = async (req, res) => {
  try {
    const { name } = req.body;
    const image = req.files?.uploadImage
      ? req.files.uploadImage[0].filename
      : "";

    if (!name)
      return res.status(400).json({ message: "Brand name is required" });

    const exists = await Brand.findOne({ name });
    if (exists)
      return res.status(400).json({ message: "Brand already exists" });

    const brand = await Brand.create({ name, image });

    res.status(201).json({
      message: "Brand added successfully",
      brand
    });
  } catch (error) {
    res.status(500).json({ message: "Error adding brand", error: error.message });
  }
};


// GET ALL BRANDS
exports.getBrands = async (req, res) => {
  try {
    const brands = await Brand.find().sort({ createdAt: -1 });
    res.json(brands);
  } catch (error) {
    res.status(500).json({ message: "Error fetching brands", error: error.message });
  }
};


// DELETE BRAND
exports.deleteBrand = async (req, res) => {
  try {
    const { id } = req.params;
    await Brand.findByIdAndDelete(id);
    res.json({ message: "Brand deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting brand", error: error.message });
  }
};


// UPDATE BRAND
exports.updateBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    let image = req.files?.uploadImage
      ? req.files.uploadImage[0].filename
      : undefined;

    const updateData = { name };
    if (image) updateData.image = image;

    const updated = await Brand.findByIdAndUpdate(id, updateData, { new: true });

    res.json({
      message: "Brand updated successfully",
      brand: updated
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating brand", error: error.message });
  }
};
