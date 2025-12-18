// server.js
const express = require("express");
const { verify } = require("jsonwebtoken");
const User = require("./models/user.model");
const mongoose = require("mongoose");

const http = require("http");
const { Server } = require("socket.io");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const ProductRoutes = require("./routes/product.routes");
const CategoryRoutes = require("./routes/category.routes");
const BrandRoutes = require("./routes/brands.routes");
const OrderRoutes = require("./routes/orders.routes");
const ClientRoutes = require("./routes/client.routes");
const LocationRoutes = require("./routes/location.routes");
const ReportRoutes = require("./routes/report.routes");
const DashboardRoutes = require("./routes/dashboard.routes");
const UserRoutes = require("./routes/user.routes");

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


app.use("/api", BrandRoutes);
app.use("/api", CategoryRoutes);
app.use("/api", DashboardRoutes);
app.use("/api", ProductRoutes);
app.use("/api", OrderRoutes);
app.use("/api/clients", ClientRoutes);
app.use("/api", LocationRoutes);
app.use("/api", ReportRoutes);
app.use("/api", UserRoutes);


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

  // Auto join room by user id (delivery boy and admin)
  socket.join(socket.user._id.toString());
  console.log(`➡️ Joined room: ${socket.user._id}`);

  // Admin rooms
  if (socket.user.role === "admin" || socket.user.role === "superAdmin") {
    socket.join("admins");
    socket.join(`admin_${socket.user._id.toString()}`);
    console.log(`👑 Joined admins room and admin_${socket.user._id.toString()}`);
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
