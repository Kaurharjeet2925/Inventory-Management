const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const bodyParser = require("body-parser");
const connectDB = require("./config/db");
const Userrouter = require("./routes/user.router");

dotenv.config();
connectDB();

const app = express();

// CORS configuration
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,              
  })
);

app.use(express.json());

// Routes
app.use("/api", Userrouter);

app.get("/", (req, res) => {
  res.send("✅ API is running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
