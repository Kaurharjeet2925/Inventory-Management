const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer");

const {addBrand, getBrands, deleteBrand, updateBrand} = require("../controller/brands.controller");

router.post("/add-brand",  upload.single("uploadImage"), addBrand);
router.get("/brands", getBrands);
router.delete("/brand/:id", deleteBrand);
router.put("/brand/:id", upload.single("uploadImage"), updateBrand);

module.exports = router;
