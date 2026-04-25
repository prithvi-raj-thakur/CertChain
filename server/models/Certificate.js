// server/models/Certificate.js
// ─────────────────────────────────────────────────────────────────────────────
// Mongoose model for off-chain certificate metadata.
// The source of truth for existence/validity is the blockchain,
// but this DB record stores human-readable data and PDF references.
// ─────────────────────────────────────────────────────────────────────────────

const mongoose = require("mongoose");

const CertificateSchema = new mongoose.Schema(
  {
    // Unique certificate identifier (UUID v4, also stored as bytes32 on-chain)
    certId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // Student information
    studentName: { type: String, required: true, trim: true },
    course:      { type: String, required: true, trim: true },
    date:        { type: String, required: true }, // ISO date string

    // SHA-256 hash of the certificate content (also stored on-chain)
    hash: { type: String, required: true },

    // Ethereum transaction hash from the issuance tx
    txHash: { type: String, default: null },

    // Which admin issued this certificate
    issuedBy: { type: String, default: "admin" },

    // Path to generated PDF (relative to /server/pdfs)
    pdfPath: { type: String, default: null },
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  }
);

module.exports = mongoose.model("Certificate", CertificateSchema);
