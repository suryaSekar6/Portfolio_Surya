const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const app = express();

// ============================
// ✅ CORS CONFIG (Production Safe)
// ============================
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://your-netlify-site.netlify.app", // 🔥 CHANGE THIS
    ],
    credentials: true,
  })
);

app.use(express.json());

// ============================
// ✅ Uploads Folder Setup
// ============================
const uploadPath = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

app.use("/uploads", express.static(uploadPath));

// ============================
// ✅ MongoDB Connection (Improved)
// ============================
const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI not defined in environment variables");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ MongoDB Connection Failed:", error.message);
    process.exit(1);
  }
};

connectDB();

// ============================
// ✅ Routes
// ============================
app.use("/api/students", require("./Routes/studentRoutes"));

app.get("/", (req, res) => {
  res.status(200).json({ message: "API Running Successfully 🚀" });
});

// ============================
// ✅ Global Error Handler
// ============================
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Internal Server Error",
    error: err.message,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);