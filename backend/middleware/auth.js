const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const auth = async (req, res, next) => {
  const authHeader = req.headers['authorization'] || req.header && req.header('Authorization');
  if (!authHeader) {
    return res.status(403).json({ message: "Unauthorized, JWT token is required" });
  }

  const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ message: "Server misconfiguration: missing JWT secret." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Fetch the user from DB (excluding password)
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Unauthorized, JWT token wrong or expired" });
  }
};

module.exports = auth;
