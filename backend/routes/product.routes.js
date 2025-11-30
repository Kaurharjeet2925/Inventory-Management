const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer");
const {
  addProduct,deleteProduct,updateProduct,getProducts} = require("../controller/product.controller");

// Add Product
router.post("/product/add",  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "images", maxCount: 4 }
  ]), addProduct);
router.get("/products", getProducts);
router.delete("/product/:id", deleteProduct);
router.put("/product/:id",  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "images", maxCount: 4 }
  ]), updateProduct);

module.exports = router;