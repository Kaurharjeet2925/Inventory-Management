const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer");
const auth = require("../middleware/auth");
const onlySuperAdmin = require("../middleware/onlySuperAdmin");	
const { getCompanySettings, saveCompanySettings, changePassword } = require("../controller/companySettings.controller");

router.get("/settings/company", getCompanySettings);
router.post("/settings/company", auth, upload.single("logo"), saveCompanySettings);
router.post(
  "/change-password",
  auth,
  onlySuperAdmin,
  changePassword
);
module.exports = router;
