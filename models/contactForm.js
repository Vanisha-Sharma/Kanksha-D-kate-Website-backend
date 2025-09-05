const mongoose = require("mongoose");

const contactFormSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    service: {
      type: String,
      enum: [
        "flo-immersion",
        "flo-stream",
        "services for businesses, institutions and communities",
        "not-sure",
      ],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { collection: "Contact Form" }
);

module.exports = mongoose.model("ContactForm", contactFormSchema);
