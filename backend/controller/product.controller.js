const Product = require("../models/product.model");
 
/* ================= HELPERS ================= */
const normalizeNumber = (v) => {
  if (v === "" || v === undefined || v === null) return 0;
  const n = Number(v);
  return Number.isNaN(n) ? 0 : n;
};

/* ================= ADD PRODUCT ================= */
exports.addProduct = async (req, res) => {
  try {
    const {
      name,
      brand,
      category,
      quantityValue,
      quantityUnit,
      mrp,
      price,
      description,
      rating,
    } = req.body;

    let warehouses = req.body.warehouses;

    /* ✅ FIX: parse warehouses correctly */
    if (typeof warehouses === "string") {
      warehouses = JSON.parse(warehouses);
    }

    if (!Array.isArray(warehouses) || warehouses.length === 0) {
      return res.status(400).json({
        message: "At least one warehouse is required",
      });
    }

    /* ✅ SANITIZE WAREHOUSES */
    const cleanedWarehouses = warehouses
      .filter(w => w.locationId && w.quantity >= 0)
      .map(w => ({
        location: w.locationId,
        quantity: normalizeNumber(w.quantity),
      }));

    /* ================= FILES ================= */
    const thumbnail = req.files?.thumbnail?.[0]?.filename || null;

    const images = req.files?.images
      ? req.files.images.map(f => f.filename)
      : [];

    const product = await Product.create({
      name,
      brand,
      category,
      quantityValue: normalizeNumber(quantityValue),
      quantityUnit: quantityUnit || null,
      mrp: normalizeNumber(mrp),
      price: normalizeNumber(price),
      description,
      rating: normalizeNumber(rating),
      warehouses: cleanedWarehouses,
      thumbnail,
      images,
    });

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
    const products = await Product.find()
      .populate("brand", "name")
      .populate("category", "name")
      .populate("warehouses.location", "name address")
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// UPDATE PRODUCT
const fs = require("fs");
const path = require("path");

exports.updateProduct = async (req, res) => {
  try {
    const id = req.params.id;
    let updateData = { ...req.body };

    /* ---------------- NORMALIZE NUMBERS ---------------- */
    const numericFields = [
      "mrp",
      "price",
      "quantityValue",
      "totalQuantity",
      "rating",
    ];

    numericFields.forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(updateData, field)) {
        updateData[field] = normalizeNumber(updateData[field]);
      }
    });

    /* ---------------- NORMALIZE UNIT ---------------- */
    if (Object.prototype.hasOwnProperty.call(updateData, "quantityUnit")) {
      updateData.quantityUnit =
        updateData.quantityUnit === "" || updateData.quantityUnit === "null"
          ? null
          : updateData.quantityUnit;
    }

    /* ---------------- WAREHOUSES ---------------- */
    if (updateData.warehouses && typeof updateData.warehouses === "string") {
      updateData.warehouses = JSON.parse(updateData.warehouses);
    }

    if (Array.isArray(updateData.warehouses)) {
      updateData.warehouses = updateData.warehouses.map((w) => ({
        location: w.locationId || w.location,
        quantity: normalizeNumber(w.quantity) || 0,
      }));

      // ✅ auto-calc totalQuantity from warehouses
      updateData.totalQuantity = updateData.warehouses.reduce(
        (sum, w) => sum + (w.quantity || 0),
        0
      );
    }

    /* ---------------- UPDATE ---------------- */
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate("brand", "name")
      .populate("category", "name")
      .populate("warehouses.location", "name address");

    res.json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Update Product Error:", error);
    res.status(500).json({ error: error.message });
  }
};
exports.transferStock = async (req, res) => {
  const { fromLocationId, toLocationId, quantity } = req.body;
  const product = await Product.findById(req.params.productId);

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  if (fromLocationId === toLocationId) {
    return res.status(400).json({ message: "Same source & destination" });
  }

  const fromWarehouse = product.warehouses.find(
    w => w.locationId.toString() === fromLocationId
  );

  if (!fromWarehouse || fromWarehouse.quantity < quantity) {
    return res.status(400).json({ message: "Insufficient stock" });
  }

  // deduct from source
  fromWarehouse.quantity -= quantity;

  // add to destination
  const toWarehouse = product.warehouses.find(
    w => w.locationId.toString() === toLocationId
  );

  if (toWarehouse) {
    toWarehouse.quantity += quantity;
  } else {
    product.warehouses.push({
      locationId: toLocationId,
      quantity
    });
  }

  await product.save();

  res.json({ message: "Stock transferred successfully" });
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
