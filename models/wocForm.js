const mongoose = require("mongoose");

const wocFormSchema = new mongoose.Schema(
  {
    feedbackType: {
      type: String,
      enum: ["text", "video"],
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    role: {
      type: String,
      trim: true,
    },
    experience: {
      type: String,
      enum: ["flo-immersion", "flo-stream", "both", "consultation"],
      required: true,
    },
    story: {
      type: String,
      required: function () {
        return this.feedbackType === "text";
      },
    },
    transformationAreas: {
      type: [String], // e.g. ["Business Performance", "Emotional Mastery"]
      default: [],
    },
    videoFile: {
      type: String, // you can store file path or Cloudinary/S3 URL
      required: function () {
        return this.feedbackType === "video";
      },
    },
    videoSummary: {
      type: String,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    permissions: {
      allowShare: { type: Boolean, default: false },
      showName: { type: Boolean, default: false },
      keepUpdated: { type: Boolean, default: false },
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { collection: "WOC Form" }
);

module.exports = mongoose.model("WocForm", wocFormSchema);
