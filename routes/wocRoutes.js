const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const WocForm = require("../models/wocForm");
const { appendToExcel, emailAdmin } = require("../utils/helpers");

// Multer setup
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, path.join(__dirname, "../uploads")),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const safe = file.originalname.replace(/\s+/g, "_").replace(/[^\w.-]/g, "");
    cb(null, `${Date.now()}_${safe}${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 100 * 1024 * 1024 } }); // 100MB

router.post("/", upload.single("videoFile"), async (req, res) => {
  try {
    const body = req.body;

    // Transform arrays if string
    if (typeof body.transformationAreas === "string") {
      try {
        body.transformationAreas = JSON.parse(body.transformationAreas);
      } catch {
        body.transformationAreas = body.transformationAreas
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      }
    }

    const payload = {
      ...body,
      videoFile: req.file ? `/uploads/${req.file.filename}` : body.videoFile || undefined,
      permissions: body.permissions
        ? typeof body.permissions === "string"
          ? JSON.parse(body.permissions)
          : body.permissions
        : undefined,
      rating: body.rating ? Number(body.rating) : undefined,
    };

    const saved = await WocForm.create(payload);

    const areas = Array.isArray(saved.transformationAreas) && saved.transformationAreas.length
      ? saved.transformationAreas.join(", ")
      : undefined;

    // Append to single Excel sheet
    const excelPath = await appendToExcel({
      data: {
        Type: saved.feedbackType,
        Name: saved.name,
        Email: saved.email,
        Role: saved.role,
        Experience: saved.experience,
        Rating: saved.rating,
        Story: saved.story,
        TransformationAreas: areas,
        VideoFile: saved.videoFile,
        VideoSummary: saved.videoSummary,
        Permissions: saved.permissions ? JSON.stringify(saved.permissions) : undefined,
        SubmittedAt: saved.createdAt,
      },
      filename: "woc-submissions.xlsx",
    });

    const attachments = [{ filename: "woc-submissions.xlsx", path: excelPath }];
    if (req.file) attachments.push({ filename: req.file.originalname, path: req.file.path });

    // Email admin
    await emailAdmin({
      subject: `New WOC (${saved.feedbackType}) from ${saved.name}`,
      text: `A new WOC testimonial was submitted by ${saved.name}.`,
      attachments,
    });

    res.status(201).json({ success: true, id: saved._id });
  } catch (err) {
    console.error("WOC route error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
