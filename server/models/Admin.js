// server/models/Admin.js
// ─────────────────────────────────────────────────────────────────────────────
// Mongoose model for admin accounts.
// Passwords are stored as bcrypt hashes — never plain text.
// ─────────────────────────────────────────────────────────────────────────────

const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");

const AdminSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    // Bcrypt-hashed password
    password: { type: String, required: true },
  },
  { timestamps: true }
);

// ─── Pre-save hook: hash password before storing ──────────────────────────────
AdminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ─── Instance method: compare plain password with stored hash ─────────────────
AdminSchema.methods.comparePassword = async function (plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};

module.exports = mongoose.model("Admin", AdminSchema);
