const Product = require("../models/product.models")

// ADD PRODUCT
exports.addProduct = async (req, res) => {
  try {
    const {
      name,
      category,
      brand,
      quantity,
      unit,
      mrp,
      price,
      description,
      location,
      rating
    } = req.body;

    // Thumbnail (single)
    const thumbnail = req.files?.thumbnail
      ? req.files.thumbnail[0].filename
      : null;

    // Product images (multiple)
    const images = req.files?.images
      ? req.files.images.map((img) => img.filename)
      : [];

    // Validation
    if (!name || !category || !brand) {
      return res.status(400).json({ message: "Name, brand, category required" });
    }

    const product = await Product.create({
      name,
      category,
      brand,
      quantity,
      unit,
      mrp,
      price,
      description,
      location,
      rating,
      thumbnail,
      images,
    });

    res.status(201).json({
      message: "Product added successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET ALL PRODUCTS
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("brand", "name")
      .populate("category", "name");

    // Transform frontend-friendly names
    const updated = products.map((p) => ({
      ...p._doc,
      brandName: p.brand?.name || "",
      categoryName: p.category?.name || "",
    }));

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// UPDATE PRODUCT
exports.updateProduct = async (req, res) => {
  try {
    const id = req.params.id;

    let updateData = { ...req.body };

    // Update thumbnail only if new is uploaded
    if (req.files?.thumbnail) {
      updateData.thumbnail = req.files.thumbnail[0].filename;
    }

    // Update images only if new images uploaded
    if (req.files?.images) {
      updateData.images = req.files.images.map((img) => img.filename);
    }

    const product = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    res.json({ message: "Product updated successfully", product });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE PRODUCT
exports.deleteProduct = async (req, res) => {
  try {
    const id = req.params.id;

    await Product.findByIdAndDelete(id);

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
