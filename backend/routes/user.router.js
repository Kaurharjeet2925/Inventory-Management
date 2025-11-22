const router = require("express").Router();
const { registerUser, loginUser } = require("../controller/user.controller");
const { registerValidation, loginValidation } = require("../middleware/authValidation");
const auth = require("../middleware/auth");
const { getProductsDashboard } = require("../controller/dashboard.controller");
 
router.post("/register", registerValidation, registerUser);
router.post("/login", loginValidation, loginUser);
router.get("/dashboard", auth, getProductsDashboard);
module.exports = router;