const router = require("express").Router();
const { 
  registerUser, 
  loginUser, 
  createUserBySuperAdmin,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getDeliveryPersons,
  getMyProfile,

} = require("../controller/user.controller");
const upload = require("../middleware/multer");
const { 
  registerValidation, 
  loginValidation 
} = require("../middleware/authValidation");

const auth = require("../middleware/auth");
const onlySuperAdmin = require("../middleware/onlySuperAdmin");
const allowAdminAndSuperAdmin = require("../middleware/allowAdminAndSuperAdmin");

//const { getProductsDashboard } = require("../controller/dashboard.controller");

// Specific routes FIRST (before /:id pattern)
router.post("/register", registerValidation, registerUser);
router.post("/login", loginValidation, loginUser);
//router.get("/dashboard", auth, getProductsDashboard);
router.get("/all", auth, onlySuperAdmin, getAllUsers);
router.get("/user/me", auth, getMyProfile);
router.get("/delivery-persons", auth, allowAdminAndSuperAdmin, getDeliveryPersons);
router.post(
  "/superadmin/create-user",
  auth,                   
  onlySuperAdmin,         
  upload.single("image"),
  createUserBySuperAdmin  
);


// Generic ID routes LAST (after specific routes)
router.get("/user/:id", auth, getUserById);


router.put(
  "/user/:id",
  auth,
  upload.single("image"),
  updateUser
);

router.delete("/user/:id", auth, onlySuperAdmin, deleteUser);

module.exports = router;
