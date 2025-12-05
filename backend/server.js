// server.js
const express = require("express");
const { verify } = require("jsonwebtoken");
const User = require("./models/user.model");

const http = require("http");
const { Server } = require("socket.io");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");

// Load environment & DB
dotenv.config();
connectDB();

const app = express();

// ------------------------
// Middleware
// ------------------------
app.use(cors({ 
  origin: "http://localhost:3000",
  credentials: true 
}));

app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static("uploads"));

// Logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(
      `🔹 [${req.method}] ${req.originalUrl} - Status: ${res.statusCode} (${duration}ms)`
    );
  });
  next();
});

// ------------------------
// ROUTES
// ------------------------
app.use("/api", require("./routes/brands.routes"));
app.use("/api", require("./routes/category.routes"));
app.use("/api", require("./routes/product.routes"));
app.use("/api", require("./routes/orders.routes"));
app.use("/api/clients", require("./routes/client.routes"));
app.use("/api", require("./routes/location.routes"));
app.use("/api", require("./routes/user.routes"));

// ------------------------
// SOCKET.IO SETUP
// ------------------------
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }
});

// Make io available in controllers
app.set("io", io);

// ------------------------
// SOCKET AUTH (JWT)
// ------------------------
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;

    if (!token) {
      console.log("❌ Socket failed: No token");
      return next(new Error("No token"));
    }

    const decoded = verify(token, process.env.JWT_SECRET);

    // Fetch user
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      console.log("❌ Socket failed: User not found");
      return next(new Error("Invalid token user"));
    }

    socket.user = user;
    next();
  } catch (err) {
    console.log("❌ Socket auth error:", err.message);
    next(new Error("Unauthorized socket"));
  }
});

// ------------------------
// SOCKET CONNECTION
// ------------------------
io.on("connection", (socket) => {
  console.log("⚡ Socket connected:", socket.id, "User:", socket.user?.name);

  // Auto join room by user id (delivery boy)
  socket.join(socket.user._id.toString());
  console.log(`➡️ Joined room: ${socket.user._id}`);

  // Admin rooms
  if (socket.user.role === "admin" || socket.user.role === "superAdmin") {
    socket.join("admins");
    console.log(`👑 Joined admins room`);
  }

  socket.on("disconnect", () => {
    console.log("🔌 Socket disconnected:", socket.id);
  });
});

// ------------------------
// START SERVER
// ------------------------
const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
