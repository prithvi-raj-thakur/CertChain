// server/middleware/auth.js
// ─────────────────────────────────────────────────────────────────────────────
// JWT authentication middleware.
// Verifies Bearer token from Authorization header and attaches admin info
// to req.admin for downstream route handlers.
// ─────────────────────────────────────────────────────────────────────────────

const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  // Expect "Bearer <token>"
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Access denied: no token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

module.exports = authMiddleware;
