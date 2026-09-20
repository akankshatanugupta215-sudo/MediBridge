const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/auth");
const upload = require("../middleware/upload");
const {
  getProfile,
  updateProfile,
  toggleQr,
  regenerateQr,
  uploadDocument,
} = require("../controllers/profileController");

router.use(requireAuth);

router.get("/", getProfile);
router.put("/", updateProfile);
router.post("/qr/toggle", toggleQr);
router.post("/qr/regenerate", regenerateQr);
router.post("/documents", upload.single("document"), uploadDocument);

module.exports = router;
