const express = require("express");
const router = express.Router();
const { viewCaregiverAccess } = require("../controllers/caregiverController");

// Public - no auth. Caregiver opens their unique shared link.
router.get("/:token", viewCaregiverAccess);

module.exports = router;
