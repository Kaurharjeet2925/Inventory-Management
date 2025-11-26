const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix =
      Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${extension}`);
  },
});


// 🔥 For Product: Thumbnail + up to 4 images
const upload = multer({ storage }).fields([
  { name: "uploadImage", maxCount: 1 }, 
  { name: "thumbnail", maxCount: 1 },
  { name: "images", maxCount: 4 },
]);

module.exports = upload;
