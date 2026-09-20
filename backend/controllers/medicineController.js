const Medicine = require("../models/Medicine");

async function listMedicines(req, res) {
  try {
    const medicines = await Medicine.find({ user: req.session.userId }).sort({ createdAt: -1 });
    res.json({ medicines });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch medicines.", error: err.message });
  }
}

async function createMedicine(req, res) {
  try {
    const { name, dosage, frequency, startDate, endDate, status, notes } = req.body;
    if (!name) return res.status(400).json({ message: "Medicine name is required." });

    const medicine = await Medicine.create({
      user: req.session.userId,
      name,
      dosage,
      frequency,
      startDate,
      endDate,
      status: status || "active",
      notes,
    });
    res.status(201).json({ medicine });
  } catch (err) {
    res.status(500).json({ message: "Failed to add medicine.", error: err.message });
  }
}

async function updateMedicine(req, res) {
  try {
    const medicine = await Medicine.findOneAndUpdate(
      { _id: req.params.id, user: req.session.userId },
      { $set: req.body },
      { new: true }
    );
    if (!medicine) return res.status(404).json({ message: "Medicine not found." });
    res.json({ medicine });
  } catch (err) {
    res.status(500).json({ message: "Failed to update medicine.", error: err.message });
  }
}

async function deleteMedicine(req, res) {
  try {
    const medicine = await Medicine.findOneAndDelete({ _id: req.params.id, user: req.session.userId });
    if (!medicine) return res.status(404).json({ message: "Medicine not found." });
    res.json({ message: "Medicine removed." });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete medicine.", error: err.message });
  }
}

module.exports = { listMedicines, createMedicine, updateMedicine, deleteMedicine };
