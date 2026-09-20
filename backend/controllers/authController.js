const User = require("../models/User");
const MedicalProfile = require("../models/MedicalProfile");

async function register(req, res) {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required." });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    const user = await User.create({ name, email, password, phone });
    await MedicalProfile.create({ user: user._id });

    req.session.userId = user._id.toString();
    res.status(201).json({ user: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ message: "Registration failed.", error: err.message });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const match = await user.comparePassword(password);
    if (!match) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    let profile = await MedicalProfile.findOne({ user: user._id });
    if (!profile) {
      profile = await MedicalProfile.create({ user: user._id });
    }

    req.session.userId = user._id.toString();
    res.json({ user: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ message: "Login failed.", error: err.message });
  }
}

function logout(req, res) {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ message: "Logout failed." });
    res.clearCookie("medibridge.sid");
    res.json({ message: "Logged out." });
  });
}

async function me(req, res) {
  try {
    const user = await User.findById(req.session.userId);
    if (!user) return res.status(401).json({ message: "Not authenticated." });
    res.json({ user: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch profile.", error: err.message });
  }
}

module.exports = { register, login, logout, me };
