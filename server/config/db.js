// server/config/db.js
// ─────────────────────────────────────────────────────────────────────────────
// MongoDB connection using Mongoose.
// Falls back gracefully if MONGO_URI is not set (runs without DB in memory).
// ─────────────────────────────────────────────────────────────────────────────

const mongoose = require("mongoose");

const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.warn("⚠️  MONGO_URI not set — running without persistent database");
    return;
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("✅ MongoDB connected:", mongoose.connection.host);
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    console.warn("⚠️  Continuing without MongoDB (data won't persist)");
  }
};

module.exports = connectDB;
