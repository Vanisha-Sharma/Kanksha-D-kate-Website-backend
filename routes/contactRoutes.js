const express = require("express");
const router = express.Router();
const ContactForm = require("../models/contactForm");
const { appendToExcel, emailAdmin } = require("../utils/helpers");

router.post("/", async (req, res) => {
  try {
    console.log("Payload received:", req.body);
    const { name, email, service, message } = req.body;

    if (!name || !email || !service || !message) {
      return res.status(400).json({ success: false, error: "All fields required" });
    }

    const saved = await ContactForm.create({ name, email, service, message });
    console.log("Saved contact:", saved);

    // Append to single Excel sheet
    const excelPath = await appendToExcel({
      data: {
        Name: saved.name,
        Email: saved.email,
        Service: saved.service,
        Message: saved.message,
        SubmittedAt: saved.createdAt,
      },
      filename: "contact-submissions.xlsx",
    });

    // Email admin
    await emailAdmin({
      subject: `New Contact Form: ${saved.name}`,
      text: `A new contact form was submitted by ${saved.name} (${saved.email}).`,
      attachments: [{ filename: "contact-submissions.xlsx", path: excelPath }],
    });

    res.status(201).json({ success: true, id: saved._id });
  } catch (err) {
    console.error("Contact route error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
