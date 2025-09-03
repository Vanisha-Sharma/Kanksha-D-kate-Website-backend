const express = require("express");
const multer = require("multer");
const fs = require("fs");
const cloudinary = require("../utils/cloudinary");
const Article = require("../models/Article");
const { verifyAdmin } = require("../middleware/auth");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// GET all articles
router.get("/", async (req, res) => {
  try {
    const articles = await Article.find().sort({ createdAt: -1 });
    res.status(200).json(articles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single article
router.get("/:id", async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ message: "Article not found" });
    res.status(200).json(article);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE article (Admin only)
router.post("/", verifyAdmin, upload.single("image"), async (req, res) => {
  try {
    const { title, content, author, createdAt } = req.body;

    if (!title || !content || !author)
      return res.status(400).json({ message: "Title, content, and author are required" });

    const createdAtDate = createdAt ? new Date(createdAt) : new Date();
    if (isNaN(createdAtDate.getTime()))
      return res.status(400).json({ message: "Invalid createdAt date" });

    let imageUrl = null;
    if (req.file) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path, { folder: "articles" });
        imageUrl = result.secure_url;
      } catch (err) {
        console.error("Cloudinary upload error:", err);
        return res.status(500).json({ message: "Image upload failed" });
      } finally {
        fs.unlinkSync(req.file.path); // cleanup
      }
    }

    const article = new Article({ title, content, author, createdAt: createdAtDate, imageUrl });
    await article.save();
    res.status(201).json(article);
  } catch (err) {
    console.error("Error creating article:", err);
    res.status(500).json({ error: err.message });
  }
});

// UPDATE article (Admin only)
router.put("/:id", verifyAdmin, upload.single("image"), async (req, res) => {
  try {
    const { title, content, author, createdAt } = req.body;

    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ message: "Article not found" });

    if (!title || !content || !author)
      return res.status(400).json({ message: "Title, content, and author are required" });

    const createdAtDate = createdAt ? new Date(createdAt) : article.createdAt;
    if (isNaN(createdAtDate.getTime()))
      return res.status(400).json({ message: "Invalid createdAt date" });

    let imageUrl = article.imageUrl;
    if (req.file) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path, { folder: "articles" });
        imageUrl = result.secure_url;
      } catch (err) {
        console.error("Cloudinary upload error:", err);
        return res.status(500).json({ message: "Image upload failed" });
      } finally {
        fs.unlinkSync(req.file.path); // cleanup
      }
    }

    article.title = title;
    article.content = content;
    article.author = author;
    article.createdAt = createdAtDate;
    article.imageUrl = imageUrl;

    await article.save();
    res.status(200).json(article);
  } catch (err) {
    console.error("Error updating article:", err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE article (Admin only)
router.delete("/:id", verifyAdmin, async (req, res) => {
  try {
    const article = await Article.findByIdAndDelete(req.params.id);
    if (!article) return res.status(404).json({ message: "Article not found" });
    res.status(200).json({ message: "✅ Article deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
