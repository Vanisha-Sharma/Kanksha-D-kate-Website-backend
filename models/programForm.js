const mongoose = require("mongoose");

const programFormSchema = new mongoose.Schema(
  {
    fullName: {
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
    confirmEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    country: {
      type: String,
      required: true,
    },
    whatsappNumber: {
      type: String,
      required: true,
    },
    service: {
      type: String,
      enum: [
        "signature-immersion",
        "flo-stream",
        "organizational",
        "clarity call on whatsapp",
      ],
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { collection: "Programs Form" } // forces MongoDB collection name
);

module.exports = mongoose.model("ProgramForm", programFormSchema);
