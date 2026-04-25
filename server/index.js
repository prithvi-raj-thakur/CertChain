// server/index.js
// ─────────────────────────────────────────────────────────────────────────────
// Express application entry point.
// Loads env vars, connects DB, mounts routes, starts HTTP server.
// ─────────────────────────────────────────────────────────────────────────────

require("dotenv").config({ path: "../.env" });
const express = require("express");
const cors    = require("cors");
const path    = require("path");

const connectDB    = require("./config/db");
const authRoutes   = require("./routes/auth");
const certRoutes   = require("./routes/certificates");

const app  = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: "http://localhost:5173", // Vite dev server
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Static files (generated PDFs) ───────────────────────────────────────────
app.use("/pdfs", express.static(path.join(__dirname, "pdfs")));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/auth",         authRoutes);
app.use("/api/certificates", certRoutes);

// ─── Health check ─────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─── 404 handler ─────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ─── Global error handler ─────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error("❌ Server Error:", err.message);
  res.status(err.status || 500).json({ error: err.message || "Internal server error" });
});

// ─── Bootstrap ────────────────────────────────────────────────────────────────
const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    console.log(`📋 API Health: http://localhost:${PORT}/api/health\n`);
  });
};

start();
