require("dotenv").config();

const express = require("express");
const path = require("path");
const cors = require("cors");
const morgan = require("morgan");
const session = require("express-session");
const MongoStore = require("connect-mongo");

const connectDB = require("./config/db");

const authRoutes = require("./routes/auth");
const profileRoutes = require("./routes/profile");
const medicineRoutes = require("./routes/medicines");
const caregiverRoutes = require("./routes/caregivers");
const qrRoutes = require("./routes/qr");
const emergencyRoutes = require("./routes/emergency");
const caregiverAccessRoutes = require("./routes/caregiverAccess");
const dashboardRoutes = require("./routes/dashboard");

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/medibridge";
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(
  session({
    name: "medibridge.sid",
    secret: process.env.SESSION_SECRET || "medibridge_secret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: MONGO_URI, collectionName: "sessions" }),
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    },
  })
);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "MediBridge API" });
});

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/medicines", medicineRoutes);
app.use("/api/caregivers", caregiverRoutes);
app.use("/api/qr", qrRoutes);
app.use("/api/emergency", emergencyRoutes);
app.use("/api/caregiver-access", caregiverAccessRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found." });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || "Something went wrong." });
});

async function startServer() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`MediBridge API running on http://localhost:${PORT}`);
  });
}

startServer();
