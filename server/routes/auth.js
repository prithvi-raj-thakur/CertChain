// server/routes/auth.js
// ─────────────────────────────────────────────────────────────────────────────
// Authentication routes for admin login.
// POST /api/auth/login  → returns JWT
// POST /api/auth/seed   → seeds the default admin (dev only)
// ─────────────────────────────────────────────────────────────────────────────

const express = require("express");
const jwt     = require("jsonwebtoken");
const bcrypt  = require("bcryptjs");
const router  = express.Router();

// ─── In-memory admin fallback (when MongoDB is not available) ─────────────────
// In production, always use MongoDB.
const IN_MEMORY_ADMIN = {
  username: process.env.ADMIN_USERNAME || "admin",
  // bcrypt hash of "admin123" — pre-computed so no DB is needed
  password: "$2a$10$7QzQY0gW2gW2gW2gW2gW2OYnQvVv8/YnQvVv8/YnQvVv8/YnQvVv8/", // placeholder
};

let Admin;
try {
  Admin = require("../models/Admin");
} catch (_) {
  Admin = null;
}

/**
 * POST /api/auth/login
 * Body: { username, password }
 * Returns: { token, username }
 */
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }

    const jwtSecret = process.env.JWT_SECRET || "fallback_secret_change_me";
    const adminUser  = process.env.ADMIN_USERNAME || "admin";
    const adminPass  = process.env.ADMIN_PASSWORD || "admin123";

    // ── Try DB first, fallback to env vars ───────────────────────────────────
    let isValid = false;

    if (Admin) {
      try {
        const adminDoc = await Admin.findOne({ username: username.toLowerCase() });
        if (adminDoc) {
          isValid = await adminDoc.comparePassword(password);
        } else {
          // Fall back to env credentials
          isValid =
            username === adminUser &&
            password === adminPass;
        }
      } catch (_) {
        // DB unavailable — use env credentials
        isValid = username === adminUser && password === adminPass;
      }
    } else {
      // No DB model available — use env credentials
      isValid = username === adminUser && password === adminPass;
    }

    if (!isValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Issue JWT (expires in 8 hours)
    const token = jwt.sign(
      { username, role: "admin" },
      jwtSecret,
      { expiresIn: "8h" }
    );

    res.json({ token, username, role: "admin" });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /api/auth/seed
 * Seeds the default admin account to MongoDB (development helper).
 * Only works when MONGO_URI is set.
 */
router.post("/seed", async (req, res) => {
  if (!Admin) {
    return res.json({ message: "DB not available — using env credentials" });
  }

  try {
    const username = process.env.ADMIN_USERNAME || "admin";
    const password = process.env.ADMIN_PASSWORD || "admin123";

    const existing = await Admin.findOne({ username });
    if (existing) {
      return res.json({ message: "Admin already exists" });
    }

    const admin = new Admin({ username, password });
    await admin.save();
    res.json({ message: "Admin seeded successfully" });
  } catch (err) {
    console.error("Seed error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
