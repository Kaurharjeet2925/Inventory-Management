const Brand = require("../models/brands.model");

// ADD BRAND
exports.addBrand = async (req, res) => {
  try {
    console.log("[addBrand] Request body:", req.body);
    console.log("[addBrand] File:", req.file);
    
    const { name } = req.body;
    const image = req.file ? req.file.filename : "";

    if (!name) {
      console.log("[addBrand] Brand name is missing");
      return res.status(400).json({ message: "Brand name is required" });
    }

    const exists = await Brand.findOne({ name });
    if (exists) {
      console.log("[addBrand] Brand already exists:", name);
      return res.status(400).json({ message: "Brand already exists" });
    }

    const brand = await Brand.create({ name, image });

    res.status(201).json({
      message: "Brand added successfully",
      brand
    });
  } catch (error) {
    console.error("[addBrand] Error:", error);
    res.status(500).json({ message: "Error adding brand", error: error.message });
  }
};


// GET ALL BRANDS
exports.getBrands = async (req, res) => {
  try {
    console.log("[getBrands] Fetching all brands...");
    const brands = await Brand.find().sort({ createdAt: -1 });
    console.log("[getBrands] Found", brands.length, "brands");
    res.json(brands);
  } catch (error) {
    console.error("[getBrands] Error:", error);
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

    let image = req.file ? req.file.filename : undefined;

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
