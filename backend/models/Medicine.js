const mongoose = require("mongoose");

const medicineSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    dosage: { type: String, trim: true, default: "" },
    frequency: { type: String, trim: true, default: "" },
    startDate: { type: Date },
    endDate: { type: Date },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    notes: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Medicine", medicineSchema);
