const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const auth = async (req, res, next) => {
  // Read token from cookie first (if using httpOnly cookie), then Authorization header
  const cookieToken = req.cookies && req.cookies.token;
  const authHeader = req.headers['authorization'] || (req.header && req.header('Authorization'));
  const headerToken = authHeader && (authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader);
  const token = cookieToken || headerToken;

  if (!token) {
    console.warn(`[auth] Missing token for ${req.method} ${req.originalUrl} from ${req.ip}`);
    return res.status(403).json({ message: "Unauthorized, JWT token is required" });
  }

  if (!process.env.JWT_SECRET) {
    console.error("[auth] Server misconfiguration: missing JWT secret.");
    return res.status(500).json({ message: "Server misconfiguration: missing JWT secret." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch the user from DB (excluding password)
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      console.warn(`[auth] User not found for token id=${decoded.id}`);
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.warn(`[auth] Token verification failed: ${err.message}`);
    return res.status(403).json({ message: "Unauthorized, JWT token wrong or expired" });
  }
};

module.exports = auth;
