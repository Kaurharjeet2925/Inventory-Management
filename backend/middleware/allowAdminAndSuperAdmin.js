module.exports = (req, res, next) => {
    console.log("Role check - req.user:", req.user ? { id: req.user._id, role: req.user.role } : "NOT FOUND");
  
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized: user missing" });
    }
  
    // ALLOW THESE ROLES
    const allowed = ["superAdmin", "admin"];
  
    if (!allowed.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied: Only admin or superAdmin allowed. Your role: ${req.user.role}`
      });
    }
  
    next();
  };
  