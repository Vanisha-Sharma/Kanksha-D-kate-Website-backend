const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

async function generatePDF({ title, fields, filenameBase }) {
  ensureDir(path.join(__dirname, "../pdfs"));
  const filePath = path.join(__dirname, "../pdfs", `${filenameBase}.pdf`);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    doc.fontSize(20).text(title, { align: "center" });
    doc.moveDown();

    fields.forEach(([label, value]) => {
      if (!value) return;
      doc.fontSize(12).text(`${label}:`);
      doc.font("Helvetica").text(String(value), { indent: 16 });
      doc.moveDown(0.6);
    });

    doc.end();
    stream.on("finish", () => resolve(filePath));
    stream.on("error", reject);
  });
}

async function emailAdmin({ subject, text, attachments = [] }) {
  try {
    return transporter.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.ADMIN_EMAIL,
      subject,
      text,
      attachments,
    });
  } catch (err) {
    console.error("Email sending failed:", err.message);
  }
}

module.exports = { generatePDF, emailAdmin };
