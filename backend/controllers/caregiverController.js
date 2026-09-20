const Caregiver = require("../models/Caregiver");
const MedicalProfile = require("../models/MedicalProfile");
const Medicine = require("../models/Medicine");
const User = require("../models/User");

async function listCaregivers(req, res) {
  try {
    const caregivers = await Caregiver.find({ owner: req.session.userId }).sort({ createdAt: -1 });
    res.json({ caregivers });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch caregivers.", error: err.message });
  }
}

async function addCaregiver(req, res) {
  try {
    const { name, email, phone, relation, accessLevel } = req.body;
    if (!name) return res.status(400).json({ message: "Caregiver name is required." });

    const caregiver = await Caregiver.create({
      owner: req.session.userId,
      name,
      email,
      phone,
      relation,
      accessLevel: accessLevel || "basic",
    });
    res.status(201).json({ caregiver });
  } catch (err) {
    res.status(500).json({ message: "Failed to add caregiver.", error: err.message });
  }
}

async function updateCaregiver(req, res) {
  try {
    const caregiver = await Caregiver.findOneAndUpdate(
      { _id: req.params.id, owner: req.session.userId },
      { $set: req.body },
      { new: true }
    );
    if (!caregiver) return res.status(404).json({ message: "Caregiver not found." });
    res.json({ caregiver });
  } catch (err) {
    res.status(500).json({ message: "Failed to update caregiver.", error: err.message });
  }
}

async function revokeCaregiver(req, res) {
  try {
    const caregiver = await Caregiver.findOneAndUpdate(
      { _id: req.params.id, owner: req.session.userId },
      { $set: { status: "revoked" } },
      { new: true }
    );
    if (!caregiver) return res.status(404).json({ message: "Caregiver not found." });
    res.json({ caregiver });
  } catch (err) {
    res.status(500).json({ message: "Failed to revoke caregiver access.", error: err.message });
  }
}

async function deleteCaregiver(req, res) {
  try {
    const caregiver = await Caregiver.findOneAndDelete({ _id: req.params.id, owner: req.session.userId });
    if (!caregiver) return res.status(404).json({ message: "Caregiver not found." });
    res.json({ message: "Caregiver removed." });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete caregiver.", error: err.message });
  }
}

// Public: caregiver views owner's info via their unique access token (no login required)
async function viewCaregiverAccess(req, res) {
  try {
    const caregiver = await Caregiver.findOne({ accessToken: req.params.token, status: "active" });
    if (!caregiver) return res.status(404).json({ message: "Invalid or revoked access link." });

    const owner = await User.findById(caregiver.owner);
    const profile = await MedicalProfile.findOne({ user: caregiver.owner });
    if (!owner || !profile) return res.status(404).json({ message: "Patient record not found." });

    const base = {
      patientName: owner.name,
      bloodGroup: profile.bloodGroup,
      allergies: profile.allergies,
      conditions: profile.conditions,
      emergencyContact: profile.emergencyContact,
      caregiverAccessLevel: caregiver.accessLevel,
    };

    if (caregiver.accessLevel === "full") {
      const medicines = await Medicine.find({ user: caregiver.owner, status: "active" }).sort({ createdAt: -1 });
      base.currentMedications = profile.currentMedications;
      base.medicines = medicines;
      base.notes = profile.notes;
    }

    res.json(base);
  } catch (err) {
    res.status(500).json({ message: "Failed to load caregiver access.", error: err.message });
  }
}

module.exports = {
  listCaregivers,
  addCaregiver,
  updateCaregiver,
  revokeCaregiver,
  deleteCaregiver,
  viewCaregiverAccess,
};
