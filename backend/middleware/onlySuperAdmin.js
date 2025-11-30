module.exports = (req, res, next) => {
  console.log("onlySuperAdmin check - req.user:", req.user ? { id: req.user._id, role: req.user.role } : "NOT FOUND");
  
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized: user not found in request" });
  }

  if (req.user.role !== "superAdmin") {
    return res.status(403).json({ message: `Access denied: Only superAdmin can create admin or delivery-boy. Your role is: ${req.user.role}` });
  }

  next();
};
