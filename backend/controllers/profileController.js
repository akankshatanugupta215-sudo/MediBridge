const MedicalProfile = require("../models/MedicalProfile");

async function getProfile(req, res) {
  try {
    let profile = await MedicalProfile.findOne({ user: req.session.userId });
    if (!profile) {
      profile = await MedicalProfile.create({ user: req.session.userId });
    }
    res.json({ profile });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch profile.", error: err.message });
  }
}

async function updateProfile(req, res) {
  try {
    const { bloodGroup, allergies, conditions, currentMedications, emergencyContact, notes } = req.body;

    const update = {};
    if (bloodGroup !== undefined) update.bloodGroup = bloodGroup;
    if (allergies !== undefined) {
      update.allergies = Array.isArray(allergies)
        ? allergies
        : String(allergies).split(",").map((s) => s.trim()).filter(Boolean);
    }
    if (conditions !== undefined) {
      update.conditions = Array.isArray(conditions)
        ? conditions
        : String(conditions).split(",").map((s) => s.trim()).filter(Boolean);
    }
    if (currentMedications !== undefined) update.currentMedications = currentMedications;
    if (emergencyContact !== undefined) update.emergencyContact = emergencyContact;
    if (notes !== undefined) update.notes = notes;

    const profile = await MedicalProfile.findOneAndUpdate(
      { user: req.session.userId },
      { $set: update },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json({ profile });
  } catch (err) {
    res.status(500).json({ message: "Failed to update profile.", error: err.message });
  }
}

async function toggleQr(req, res) {
  try {
    const profile = await MedicalProfile.findOne({ user: req.session.userId });
    if (!profile) return res.status(404).json({ message: "Profile not found." });
    profile.qrActive = !profile.qrActive;
    await profile.save();
    res.json({ profile });
  } catch (err) {
    res.status(500).json({ message: "Failed to update QR status.", error: err.message });
  }
}

async function regenerateQr(req, res) {
  try {
    const { v4: uuidv4 } = require("uuid");
    const profile = await MedicalProfile.findOneAndUpdate(
      { user: req.session.userId },
      { $set: { qrToken: uuidv4(), qrActive: true } },
      { new: true }
    );
    if (!profile) return res.status(404).json({ message: "Profile not found." });
    res.json({ profile });
  } catch (err) {
    res.status(500).json({ message: "Failed to regenerate QR code.", error: err.message });
  }
}

async function uploadDocument(req, res) {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded." });
    const profile = await MedicalProfile.findOneAndUpdate(
      { user: req.session.userId },
      {
        $push: {
          documents: {
            filename: req.file.filename,
            originalName: req.file.originalname,
            path: `/uploads/${req.file.filename}`,
          },
        },
      },
      { new: true, upsert: true }
    );
    res.status(201).json({ profile });
  } catch (err) {
    res.status(500).json({ message: "Failed to upload document.", error: err.message });
  }
}

module.exports = { getProfile, updateProfile, toggleQr, regenerateQr, uploadDocument };
