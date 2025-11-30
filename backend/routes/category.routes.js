const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer");

const {addCategory, getCategory, deleteCategory, updateCategory} = require("../controller/category.controller");

router.post("/add-category", upload.single("uploadImage"), addCategory);
router.get("/category", getCategory);
router.delete("/category/:id", deleteCategory);
router.put("/category/:id", upload.single("uploadImage"), updateCategory);

module.exports = router;
