const MedicalProfile = require("../models/MedicalProfile");
const User = require("../models/User");

// Public: anyone who scans the QR code can view limited critical info only.
async function viewEmergencyProfile(req, res) {
  try {
    const profile = await MedicalProfile.findOne({ qrToken: req.params.token });
    if (!profile || !profile.qrActive) {
      return res.status(404).json({ message: "Emergency profile not available." });
    }

    const owner = await User.findById(profile.user);
    if (!owner) return res.status(404).json({ message: "Emergency profile not available." });

    res.json({
      patientName: owner.name,
      bloodGroup: profile.bloodGroup,
      allergies: profile.allergies,
      conditions: profile.conditions,
      emergencyContact: profile.emergencyContact,
      updatedAt: profile.updatedAt,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to load emergency profile.", error: err.message });
  }
}

module.exports = { viewEmergencyProfile };
