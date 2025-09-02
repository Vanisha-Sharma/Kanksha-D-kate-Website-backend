const express = require("express");
const router = express.Router();
const ProgramForm = require("../models/programForm");
const { appendToExcel, emailAdmin } = require("../utils/helpers");

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

    // Append to single Excel sheet
    const excelPath = await appendToExcel({
      data: {
        FullName: saved.fullName,
        Email: saved.email,
        ConfirmEmail: saved.confirmEmail,
        Country: saved.country,
        WhatsAppNumber: saved.whatsappNumber,
        PreferredExperience: saved.service,
        SubmittedAt: saved.createdAt,
      },
      filename: "program-submissions.xlsx",
    });

    // Email admin
    await emailAdmin({
      subject: `New Program Form: ${saved.fullName}`,
      text: `A new program form was submitted by ${saved.fullName} (${saved.email}).`,
      attachments: [{ filename: "program-submissions.xlsx", path: excelPath }],
    });

    res.status(201).json({ success: true, id: saved._id });
  } catch (err) {
    console.error("Program route error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
