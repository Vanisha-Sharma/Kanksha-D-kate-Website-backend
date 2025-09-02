const express = require("express");
const router = express.Router();
const ContactForm = require("../models/contactForm");
const { generatePDF, emailAdmin } = require("../utils/helpers");

router.post("/", async (req, res) => {
  try {
    console.log("Payload received:", req.body); // debug log
    const { name, email, service, message } = req.body;

    if (!name || !email || !service || !message) {
      return res.status(400).json({ success: false, error: "All fields required" });
    }

    const saved = await ContactForm.create({ name, email, service, message });
    console.log("Saved contact:", saved);

    const pdfPath = await generatePDF({
      title: "Contact Form Submission",
      filenameBase: `contact_${saved._id}`,
      fields: [
        ["Name", saved.name],
        ["Email", saved.email],
        ["Service", saved.service],
        ["Message", saved.message],
        ["Submitted At", saved.createdAt?.toISOString()],
      ],
    });

    await emailAdmin({
      subject: `New Contact Form: ${saved.name}`,
      text: `A new contact form was submitted by ${saved.name} (${saved.email}).`,
      attachments: [{ filename: "contact-submission.pdf", path: pdfPath }],
    });

    res.status(201).json({ success: true, id: saved._id });
  } catch (err) {
    console.error("Contact route error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
