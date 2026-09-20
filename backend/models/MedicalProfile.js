const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const medicalProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"],
      default: "Unknown",
    },
    allergies: [{ type: String, trim: true }],
    conditions: [{ type: String, trim: true }],
    currentMedications: { type: String, trim: true, default: "" },
    emergencyContact: {
      name: { type: String, trim: true, default: "" },
      phone: { type: String, trim: true, default: "" },
      relation: { type: String, trim: true, default: "" },
    },
    notes: { type: String, trim: true, default: "" },
    documents: [
      {
        filename: String,
        originalName: String,
        path: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    qrToken: { type: String, unique: true, default: uuidv4 },
    qrActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MedicalProfile", medicalProfileSchema);
