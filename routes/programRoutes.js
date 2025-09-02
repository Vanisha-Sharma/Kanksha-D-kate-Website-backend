const express = require("express");
const router = express.Router();
const ProgramForm = require("../models/programForm");
const { generatePDF, emailAdmin } = require("../utils/helpers");

router.post("/", async (req, res) => {
  try {
    console.log("Program payload:", req.body);
    const payload = req.body;

    const requiredFields = ["fullName", "email", "confirmEmail", "country", "whatsappNumber", "service"];
    for (const field of requiredFields) {
      if (!payload[field]) {
        return res.status(400).json({ success: false, error: `${field} is required` });
      }
    }

    const saved = await ProgramForm.create(payload);

    const pdfPath = await generatePDF({
      title: "Program Application",
      filenameBase: `program_${saved._id}`,
      fields: [
        ["Full Name", saved.fullName],
        ["Email", saved.email],
        ["Confirm Email", saved.confirmEmail],
        ["Country (code)", saved.country],
        ["WhatsApp Number", saved.whatsappNumber],
        ["Preferred Experience", saved.service],
        ["Submitted At", saved.createdAt?.toISOString()],
      ],
    });

    await emailAdmin({
      subject: `New Program Form: ${saved.fullName}`,
      text: `A new program form was submitted by ${saved.fullName} (${saved.email}).`,
      attachments: [{ filename: "program-submission.pdf", path: pdfPath }],
    });

    res.status(201).json({ success: true, id: saved._id });
  } catch (err) {
    console.error("Program route error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
