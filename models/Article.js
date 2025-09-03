const mongoose = require("mongoose");

const articleConnection = mongoose.createConnection(process.env.MONGO_ARTICLES_URI);
articleConnection.on("connected", () => {
  console.log("✅ Articles MongoDB connected");
});

const articleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    imageUrl: { type: String },
    author: { type: String, required: true },
    createdAt: { type: Date, required: true }, // admin-entered
  },
  { timestamps: true }
);

module.exports = articleConnection.model("Article", articleSchema);
