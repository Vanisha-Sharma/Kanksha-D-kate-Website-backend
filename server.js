require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: process.env.ALLOWED_ORIGIN || "http://localhost:3000",
    credentials: true,
  })
);

// Serve static folders
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/excels", express.static(path.join(__dirname, "excels")));

// Ensure necessary folders exist
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};
ensureDir(path.join(__dirname, "uploads"));
ensureDir(path.join(__dirname, "excels"));

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

// Routes
app.use("/api/contactform", require("./routes/contactRoutes"));
app.use("/api/programform", require("./routes/programRoutes"));
app.use("/api/wocform", require("./routes/wocRoutes"));

app.use("/api/articles", require("./routes/articles"));
app.use("/api/auth", require("./routes/auth")); // optional

app.get("/", (_req, res) => res.send("API is running!"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 API running at http://localhost:${PORT}`));
