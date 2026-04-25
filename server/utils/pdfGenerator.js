// server/utils/pdfGenerator.js
// ─────────────────────────────────────────────────────────────────────────────
// Generates a styled certificate PDF using PDFKit.
// Returns the output file path after writing to /server/pdfs/<certId>.pdf
// ─────────────────────────────────────────────────────────────────────────────

const PDFDocument = require("pdfkit");
const fs          = require("fs");
const path        = require("path");

/**
 * Generates a PDF certificate and saves it to the /server/pdfs directory.
 *
 * @param {Object} data
 * @param {string} data.certId      - Certificate ID
 * @param {string} data.studentName - Student's full name
 * @param {string} data.course      - Course name
 * @param {string} data.date        - Issue date
 * @param {string} data.hash        - SHA-256 hash of the certificate
 * @returns {Promise<string>}        Absolute path of the generated PDF
 */
const generateCertificatePDF = ({ certId, studentName, course, date, hash }) => {
  return new Promise((resolve, reject) => {
    // Ensure output directory exists
    const outputDir = path.join(__dirname, "../pdfs");
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, `${certId}.pdf`);
    const doc        = new PDFDocument({
      size:    "A4",
      layout:  "landscape",
      margins: { top: 60, bottom: 60, left: 72, right: 72 },
    });

    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    // ─── Background ──────────────────────────────────────────────────────────
    doc.rect(0, 0, doc.page.width, doc.page.height).fill("#0f0f1a");

    // ─── Decorative border ───────────────────────────────────────────────────
    doc
      .rect(20, 20, doc.page.width - 40, doc.page.height - 40)
      .lineWidth(3)
      .stroke("#6c63ff");

    doc
      .rect(28, 28, doc.page.width - 56, doc.page.height - 56)
      .lineWidth(1)
      .stroke("#a78bfa");

    // ─── Header ──────────────────────────────────────────────────────────────
    doc
      .fillColor("#6c63ff")
      .fontSize(11)
      .font("Helvetica-Bold")
      .text("⬡  BLOCKCHAIN VERIFIED CERTIFICATE  ⬡", 0, 55, { align: "center" });

    doc
      .fillColor("#ffffff")
      .fontSize(36)
      .font("Helvetica-Bold")
      .text("Certificate of Completion", 0, 90, { align: "center" });

    // ─── Divider ─────────────────────────────────────────────────────────────
    doc
      .moveTo(80, 145)
      .lineTo(doc.page.width - 80, 145)
      .lineWidth(1)
      .stroke("#6c63ff");

    // ─── Body text ───────────────────────────────────────────────────────────
    doc
      .fillColor("#a0a0bc")
      .fontSize(13)
      .font("Helvetica")
      .text("This is to certify that", 0, 165, { align: "center" });

    doc
      .fillColor("#ffffff")
      .fontSize(30)
      .font("Helvetica-Bold")
      .text(studentName, 0, 188, { align: "center" });

    doc
      .fillColor("#a0a0bc")
      .fontSize(13)
      .font("Helvetica")
      .text("has successfully completed the course", 0, 230, { align: "center" });

    doc
      .fillColor("#6c63ff")
      .fontSize(22)
      .font("Helvetica-Bold")
      .text(course, 0, 252, { align: "center" });

    doc
      .fillColor("#a0a0bc")
      .fontSize(12)
      .font("Helvetica")
      .text(`Date of Issue: ${date}`, 0, 295, { align: "center" });

    // ─── Divider ─────────────────────────────────────────────────────────────
    doc
      .moveTo(80, 325)
      .lineTo(doc.page.width - 80, 325)
      .lineWidth(1)
      .stroke("#6c63ff");

    // ─── Footer ──────────────────────────────────────────────────────────────
    doc
      .fillColor("#5a5a7a")
      .fontSize(8)
      .font("Helvetica")
      .text(`Certificate ID: ${certId}`, 0, 340, { align: "center" });

    doc
      .fillColor("#5a5a7a")
      .fontSize(7)
      .text(`SHA-256: ${hash}`, 0, 355, { align: "center" });

    doc
      .fillColor("#5a5a7a")
      .fontSize(8)
      .text(
        "Verify this certificate at: http://localhost:5173/verify",
        0,
        370,
        { align: "center" }
      );

    // ─── Finalize ─────────────────────────────────────────────────────────────
    doc.end();

    stream.on("finish", () => resolve(outputPath));
    stream.on("error",  reject);
  });
};

module.exports = { generateCertificatePDF };
