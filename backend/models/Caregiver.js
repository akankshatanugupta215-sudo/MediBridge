const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const caregiverSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    relation: { type: String, trim: true, default: "" },
    accessToken: { type: String, unique: true, default: uuidv4 },
    accessLevel: {
      type: String,
      enum: ["basic", "full"],
      default: "basic",
    },
    status: { type: String, enum: ["active", "revoked"], default: "active" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Caregiver", caregiverSchema);
