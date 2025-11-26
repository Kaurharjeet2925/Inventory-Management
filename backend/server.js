const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

// ROUTES
const Userrouter = require("./routes/user.routes");
const Brandrouter = require("./routes/brands.routes");
const Categoryrouter = require("./routes/category.routes");
const Productrouter = require("./routes/product.routes");
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

// 🔥 Serve uploaded images (VERY IMPORTANT)
app.use("/uploads", express.static("uploads"));


// ROUTES
app.use("/api", Userrouter);
app.use("/api", Brandrouter);
app.use("/api", Categoryrouter);
app.use("/api", Productrouter);

// TEST ROUTE
app.get("/", (req, res) => {
  res.send("✅ API is running...");
});

// SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
