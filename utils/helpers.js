const fs = require("fs");
const path = require("path");
const ExcelJS = require("exceljs");
const nodemailer = require("nodemailer");

// Nodemailer setup
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Ensure directory exists
function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

/**
 * Append data to an existing Excel file, or create a new one if not present
 * @param {Object} params
 * @param {Object} params.data - Key-value pairs of the form submission
 * @param {string} params.filename - Excel filename (e.g., "contact.xlsx")
 * @returns {Promise<string>} - path to the Excel file
 */
async function appendToExcel({ data, filename }) {
  ensureDir(path.join(__dirname, "../excels"));
  const filePath = path.join(__dirname, "../excels", filename);

  const workbook = new ExcelJS.Workbook();

  // If file exists, load it; else create new sheet
  if (fs.existsSync(filePath)) {
    await workbook.xlsx.readFile(filePath);
  }

  let sheet = workbook.getWorksheet("Form Submissions");
  if (!sheet) sheet = workbook.addWorksheet("Form Submissions");

  // Add headers if sheet is empty
  if (sheet.rowCount === 0) {
    sheet.addRow(Object.keys(data));
  }

  // Add the new row
  sheet.addRow(Object.values(data));

  // Auto-fit column widths
  sheet.columns.forEach((column) => {
    let maxLength = 10; // minimum width
    column.eachCell({ includeEmpty: true }, (cell) => {
      const cellLength = cell.value ? cell.value.toString().length : 0;
      if (cellLength > maxLength) maxLength = cellLength;
    });
    column.width = maxLength + 5;
  });

  await workbook.xlsx.writeFile(filePath);
  return filePath;
}

// Email the admin
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

module.exports = { appendToExcel, emailAdmin };
