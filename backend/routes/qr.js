const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/auth");
const { getQrImage } = require("../controllers/qrController");

router.get("/", requireAuth, getQrImage);

module.exports = router;
