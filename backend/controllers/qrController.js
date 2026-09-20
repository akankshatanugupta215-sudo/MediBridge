const QRCode = require("qrcode");
const MedicalProfile = require("../models/MedicalProfile");

async function getQrImage(req, res) {
  try {
    const profile = await MedicalProfile.findOne({ user: req.session.userId });
    if (!profile) return res.status(404).json({ message: "Profile not found." });

    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const emergencyUrl = `${clientUrl}/emergency/${profile.qrToken}`;

    const dataUrl = await QRCode.toDataURL(emergencyUrl, {
      width: 320,
      margin: 2,
      color: { dark: "#0f172a", light: "#ffffff" },
    });

    res.json({ qrImage: dataUrl, emergencyUrl, qrActive: profile.qrActive });
  } catch (err) {
    res.status(500).json({ message: "Failed to generate QR code.", error: err.message });
  }
}

module.exports = { getQrImage };
