const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require('cookie-parser');
const connectDB = require("./config/db");

// ROUTES
const Userrouter = require("./routes/user.routes");
const Brandrouter = require("./routes/brands.routes");
const Categoryrouter = require("./routes/category.routes");
const Productrouter = require("./routes/product.routes");
const Clientrouter = require("./routes/client.routes");
dotenv.config();
connectDB();

const app = express();

// CORS
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

// JSON PARSER
app.use(express.json());
app.use(cookieParser());

// Request logging middleware - logs every API call
app.use((req, res, next) => {
  const startTime = Date.now();
  const { method, originalUrl, ip } = req;
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const { statusCode } = res;
    const statusEmoji = statusCode >= 400 ? '❌' : '✅';
    console.log(`${statusEmoji} [${method}] ${originalUrl} - Status: ${statusCode} (${duration}ms)`);
  });
  
  next();
});

// 🔥 Serve uploaded images (VERY IMPORTANT)
app.use("/uploads", express.static("uploads"));


// ROUTES
app.use("/api", Userrouter);
app.use("/api", Brandrouter);
app.use("/api", Categoryrouter);
app.use("/api", Productrouter);
app.use("/api/clients", Clientrouter);

// TEST ROUTE
app.get("/", (req, res) => {
  res.send("✅ API is running...");
});

// SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
