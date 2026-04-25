// server/routes/certificates.js
// ─────────────────────────────────────────────────────────────────────────────
// Certificate routes:
//   POST   /api/certificates/issue          → issue new certificate
//   GET    /api/certificates/verify/:id     → verify certificate
//   GET    /api/certificates/:id/qr         → get QR code
//   GET    /api/certificates/:id/download   → download PDF
//   GET    /api/certificates                → list all (admin only)
// ─────────────────────────────────────────────────────────────────────────────

const express   = require("express");
const QRCode    = require("qrcode");
const { v4: uuidv4 } = require("uuid");
const path      = require("path");
const fs        = require("fs");
const router    = express.Router();

const authMiddleware              = require("../middleware/auth");
const { generateCertificateHash } = require("../utils/hashGenerator");
const { generateCertificatePDF }  = require("../utils/pdfGenerator");

// Blockchain utility (gracefully handle missing contract)
let blockchainUtils = null;
try {
  blockchainUtils = require("../utils/blockchain");
} catch (_) {}

// Certificate model (gracefully handle missing DB)
let Certificate = null;
try {
  Certificate = require("../models/Certificate");
} catch (_) {}

// ─── In-memory fallback store (when MongoDB is unavailable) ───────────────────
const memoryStore = new Map();

// ─── Helper: save certificate ─────────────────────────────────────────────────
const saveCertificate = async (data) => {
  if (Certificate) {
    try {
      const cert = new Certificate(data);
      await cert.save();
      return cert;
    } catch (err) {
      console.warn("DB save failed, using in-memory store:", err.message);
    }
  }
  memoryStore.set(data.certId, data);
  return data;
};

// ─── Helper: find certificate by certId ──────────────────────────────────────
const findCertificate = async (certId) => {
  if (Certificate) {
    try {
      const cert = await Certificate.findOne({ certId });
      if (cert) return cert;
    } catch (_) {}
  }
  return memoryStore.get(certId) || null;
};

// ─── Helper: list all certificates ───────────────────────────────────────────
const listCertificates = async () => {
  if (Certificate) {
    try {
      return await Certificate.find().sort({ createdAt: -1 });
    } catch (_) {}
  }
  return Array.from(memoryStore.values()).reverse();
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/certificates/issue
// Protected: requires admin JWT
// Body: { studentName, course, date }
// ─────────────────────────────────────────────────────────────────────────────
router.post("/issue", authMiddleware, async (req, res) => {
  try {
    const { studentName, course, date } = req.body;

    // Validate input
    if (!studentName || !course || !date) {
      return res.status(400).json({
        error: "studentName, course, and date are all required",
      });
    }

    // Generate unique certificate ID
    const certId = uuidv4();

    // Generate SHA-256 hash of certificate data
    const hash = generateCertificateHash({ certId, studentName, course, date });

    let txHash = null;

    // ── Issue on blockchain (if configured) ──────────────────────────────────
    if (blockchainUtils && process.env.CONTRACT_ADDRESS && process.env.PRIVATE_KEY) {
      try {
        txHash = await blockchainUtils.issueCertificate(
          certId,
          hash,
          studentName,
          course
        );
        console.log(`⛓  Certificate stored on blockchain. TX: ${txHash}`);
      } catch (blockchainErr) {
        console.warn(
          "⚠️  Blockchain transaction failed (running in off-chain mode):",
          blockchainErr.message
        );
        // Continue without blockchain — cert is still saved in DB
      }
    } else {
      console.warn(
        "⚠️  Blockchain not configured — certificate saved off-chain only"
      );
    }

    // ── Generate PDF ─────────────────────────────────────────────────────────
    let pdfPath = null;
    try {
      pdfPath = await generateCertificatePDF({ certId, studentName, course, date, hash });
    } catch (pdfErr) {
      console.warn("PDF generation failed:", pdfErr.message);
    }

    // ── Persist certificate data ──────────────────────────────────────────────
    const certData = {
      certId,
      studentName,
      course,
      date,
      hash,
      txHash,
      issuedBy: req.admin?.username || "admin",
      pdfPath:  pdfPath ? path.basename(pdfPath) : null,
    };

    const saved = await saveCertificate(certData);

    res.status(201).json({
      message:     "Certificate issued successfully",
      certId,
      hash,
      txHash,
      studentName,
      course,
      date,
      downloadUrl: pdfPath ? `/pdfs/${certId}.pdf` : null,
    });
  } catch (err) {
    console.error("Issue error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/certificates/verify/:id
// Public route — verifies certificate against blockchain + DB
// ─────────────────────────────────────────────────────────────────────────────
router.get("/verify/:id", async (req, res) => {
  try {
    const { id: certId } = req.params;

    // ── Fetch from DB / memory store ─────────────────────────────────────────
    const certRecord = await findCertificate(certId);

    if (!certRecord) {
      return res.status(404).json({
        valid:   false,
        message: "Certificate not found in database",
      });
    }

    let blockchainStatus = { checked: false };

    // ── Verify against blockchain (if configured) ────────────────────────────
    if (
      blockchainUtils &&
      process.env.CONTRACT_ADDRESS &&
      process.env.INFURA_URL
    ) {
      try {
        const chainData = await blockchainUtils.verifyCertificateOnChain(certId);

        if (!chainData.exists) {
          return res.json({
            valid:           false,
            message:         "Certificate hash not found on blockchain",
            blockchainData:  chainData,
          });
        }

        // Compare hashes (stored hash vs blockchain hash, strip 0x prefix)
        const storedHash = certRecord.hash.replace(/^0x/, "").toLowerCase();
        const chainHash  = chainData.hash.replace(/^0x/, "").toLowerCase();
        const hashMatch  = storedHash === chainHash;

        return res.json({
          valid:   hashMatch,
          message: hashMatch
            ? "✅ Certificate is valid and verified on blockchain"
            : "❌ Certificate hash mismatch — possible tampering detected",
          certificate: {
            certId:      certRecord.certId,
            studentName: certRecord.studentName,
            course:      certRecord.course,
            date:        certRecord.date,
            issuedAt:    chainData.issuedAt,
            txHash:      certRecord.txHash,
            hash:        certRecord.hash,
          },
          blockchainData: chainData,
        });
      } catch (blockchainErr) {
        console.warn("Blockchain verify failed:", blockchainErr.message);
        blockchainStatus = { checked: false, error: blockchainErr.message };
      }
    }

    // ── Off-chain verification fallback ──────────────────────────────────────
    res.json({
      valid:   true,
      message: "✅ Certificate found in database (blockchain verification skipped — contract not configured)",
      certificate: {
        certId:      certRecord.certId,
        studentName: certRecord.studentName,
        course:      certRecord.course,
        date:        certRecord.date,
        hash:        certRecord.hash,
        txHash:      certRecord.txHash,
      },
      blockchainStatus,
    });
  } catch (err) {
    console.error("Verify error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/certificates/:id/qr
// Returns a QR code PNG data URL for the certificate verification page
// ─────────────────────────────────────────────────────────────────────────────
router.get("/:id/qr", async (req, res) => {
  try {
    const { id: certId } = req.params;
    const verifyUrl = `http://localhost:5173/result/${certId}`;
    const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
      width:           300,
      margin:          2,
      color: { dark:  "#6c63ff", light: "#0f0f1a" },
    });

    res.json({ qrCode: qrDataUrl, verifyUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/certificates/:id/download
// Streams the PDF certificate file
// ─────────────────────────────────────────────────────────────────────────────
router.get("/:id/download", async (req, res) => {
  try {
    const { id: certId } = req.params;
    const pdfPath = path.join(__dirname, "../pdfs", `${certId}.pdf`);

    if (!fs.existsSync(pdfPath)) {
      return res.status(404).json({ error: "PDF not found for this certificate" });
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="certificate-${certId}.pdf"`
    );
    fs.createReadStream(pdfPath).pipe(res);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/certificates
// Lists all issued certificates (admin only)
// ─────────────────────────────────────────────────────────────────────────────
router.get("/", authMiddleware, async (req, res) => {
  try {
    const certs = await listCertificates();
    res.json({ certificates: certs, count: certs.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
