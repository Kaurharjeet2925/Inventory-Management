const Product = require("../models/product.model");
 
// helper to normalize numeric-like inputs
const normalizeNumber = (v) => {
  if (v === "" || v === undefined || v === null) return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
};
// ADD PRODUCT
exports.addProduct = async (req, res) => {
  try {
    console.log("[addProduct] === START ===");
    console.log("[addProduct] req.body:", req.body);
    console.log("[addProduct] req.files keys:", req.files ? Object.keys(req.files) : "NO FILES OBJECT");
    
    if (req.files) {
      console.log("[addProduct] File details:", {
        thumbnail: req.files.thumbnail ? req.files.thumbnail.map(f => ({ filename: f.filename, fieldname: f.fieldname })) : null,
        images: req.files.images ? req.files.images.map(f => ({ filename: f.filename, fieldname: f.fieldname })) : null,
      });
    }
    
    const {
      name,
      category,
      brand,
      quantityValue,
      quantityUnit,
      totalQuantity,
      mrp,
      price,
      description,
      location,
      rating,
    } = req.body;

    // validation (required fields)
    if (!name || !brand || !category) {
      return res.status(400).json({ message: "Name, brand, and category are required" });
    }

    // normalize numeric and optional fields — accept empty strings and convert to null
    const qValue = normalizeNumber(quantityValue);
    const tq = normalizeNumber(totalQuantity);
    const m = normalizeNumber(mrp);
    const p = normalizeNumber(price);
    const r = normalizeNumber(rating);
    const qUnit = quantityUnit === "" || quantityUnit === undefined ? null : quantityUnit;

    // Thumbnail (single)
    const thumbnail = req.files?.thumbnail
      ? req.files.thumbnail[0].filename
      : null;

    // Upload image (single)
    const uploadImage = req.files?.uploadImage
      ? req.files.uploadImage[0].filename
      : null;

    // Product images (multiple)
    const images = req.files?.images
      ? req.files.images.map((img) => img.filename)
      : [];

    console.log("[addProduct] Extracted - thumbnail:", thumbnail, "images:", images);

    const productData = {
      name,
      category,
      brand,
      quantityValue: qValue,
      quantityUnit: qUnit,
      totalQuantity: tq,
      mrp: m,
      price: p,
      description,
      location,
      rating: r,
      thumbnail,
      images,
    };

    const product = await Product.create(productData);

    console.log("[addProduct] Product created:", { id: product._id, thumbnail: product.thumbnail, images: product.images });
    console.log("[addProduct] === END ===");

    res.status(201).json({
      message: "Product added successfully",
      product,
    });
  } catch (error) {
    console.error("[addProduct] Error:", error);
    res.status(500).json({ error: error.message });
  }
};

// GET ALL PRODUCTS
exports.getProducts = async (req, res) => {
  try {
    console.log("[getProducts] Fetching all products...");
    const products = await Product.find()
      .populate("brand", "name")
      .populate("category", "name")
      .sort({ createdAt: -1 });
    console.log("[getProducts] Found", products.length, "products");
    res.json(products);
  } catch (error) {
    console.error("[getProducts] Error:", error);
    res.status(500).json({ error: error.message });
  }
};

// UPDATE PRODUCT
exports.updateProduct = async (req, res) => {
  try {
    const id = req.params.id;

    let updateData = { ...req.body };

    // Thumbnail update
    if (req.files?.thumbnail) {
      updateData.thumbnail = req.files.thumbnail[0].filename;
    }

    // Images update (replace all)
    if (req.files?.images) {
      updateData.images = req.files.images.map((img) => img.filename);
    }

    // Convert numeric fields properly when provided (leave absent fields untouched)
    const numericFields = ["mrp", "price", "quantityValue", "totalQuantity", "rating"];
    numericFields.forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(updateData, field)) {
        updateData[field] = normalizeNumber(updateData[field]);
      }
    });

    if (Object.prototype.hasOwnProperty.call(updateData, "quantityUnit")) {
      updateData.quantityUnit = updateData.quantityUnit === "" ? null : updateData.quantityUnit;
    }


    const product = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
    })
      .populate("brand", "name")
      .populate("category", "name");

    res.json({ message: "Product updated successfully", product });
  } catch (error) {
    console.error("Update Product Error:", error);
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
    console.error("Delete Product Error:", error);
    res.status(500).json({ error: error.message });
  }
};
