const express = require("express");
const router = express.Router();
const { viewEmergencyProfile } = require("../controllers/emergencyController");

// Public - no auth. Anyone scanning the QR code hits this.
router.get("/:token", viewEmergencyProfile);

module.exports = router;
