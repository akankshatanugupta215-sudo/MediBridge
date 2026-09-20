const MedicalProfile = require("../models/MedicalProfile");
const Medicine = require("../models/Medicine");
const Caregiver = require("../models/Caregiver");

async function getStats(req, res) {
  try {
    const userId = req.session.userId;

    const [profile, activeMedicines, caregiversActive] = await Promise.all([
      MedicalProfile.findOne({ user: userId }),
      Medicine.countDocuments({ user: userId, status: "active" }),
      Caregiver.countDocuments({ owner: userId, status: "active" }),
    ]);

    res.json({
      stats: {
        activeMedicines,
        knownAllergies: profile ? profile.allergies.length : 0,
        medicalConditions: profile ? profile.conditions.length : 0,
        emergencyContactSet: !!(profile && profile.emergencyContact && profile.emergencyContact.phone),
        qrActive: !!(profile && profile.qrActive),
        caregiversActive,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to load dashboard stats.", error: err.message });
  }
}

module.exports = { getStats };
