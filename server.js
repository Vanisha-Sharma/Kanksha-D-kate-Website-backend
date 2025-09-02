require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");

// Create app
const app = express();

// Middleware to parse JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS: allow your frontend origin
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || "http://localhost:3000",
  credentials: true
}));

// Serve static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Ensure necessary folders exist
const ensureDir = (dir) => { 
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); 
};
ensureDir(path.join(__dirname, "uploads"));
ensureDir(path.join(__dirname, "pdfs"));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

// Routes
app.use("/api/contactform", require("./routes/contactRoutes"));
app.use("/api/programform", require("./routes/programRoutes"));
app.use("/api/wocform", require("./routes/wocRoutes"));

// Root route for testing
app.get("/", (req, res) => res.send("API is running!"));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 API running at http://localhost:${PORT}`));
