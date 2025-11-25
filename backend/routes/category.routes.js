const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer");

const {addCategory, getCategory, deleteCategory, updateCategory} = require("../controller/category.controller");

router.post("/add-category", upload, addCategory);
router.get("/category", getCategory);
router.delete("/category/:id", deleteCategory);
router.put("/category/:id", upload, updateCategory);

module.exports = router;
