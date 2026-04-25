// server/utils/hashGenerator.js
// ─────────────────────────────────────────────────────────────────────────────
// Generates a deterministic SHA-256 hash from certificate data.
// The same input always produces the same hash, enabling tamper detection.
// ─────────────────────────────────────────────────────────────────────────────

const crypto = require("crypto");

/**
 * Generates a SHA-256 hash from certificate fields.
 * Data is sorted by key so field order doesn't affect the hash.
 *
 * @param {Object} data - Certificate data object
 * @param {string} data.certId       - Unique certificate ID
 * @param {string} data.studentName  - Student's full name
 * @param {string} data.course       - Course name
 * @param {string} data.date         - Issue date (ISO string)
 * @returns {string} Hex-encoded SHA-256 hash (64 chars, no 0x prefix)
 */
const generateCertificateHash = ({ certId, studentName, course, date }) => {
  // Normalize: sort keys, lowercase strings, trim whitespace
  const normalized = JSON.stringify({
    certId:      certId.trim(),
    course:      course.trim().toLowerCase(),
    date:        date.trim(),
    studentName: studentName.trim().toLowerCase(),
  });

  return crypto.createHash("sha256").update(normalized).digest("hex");
};

module.exports = { generateCertificateHash };
