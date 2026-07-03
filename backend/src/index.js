require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const sequelize = require("./config/db");
require("./models"); // registers associations

const authRoutes = require("./routes/auth.routes");
const complaintRoutes = require("./routes/complaint.routes");
const noticeRoutes = require("./routes/notice.routes");
const dashboardRoutes = require("./routes/dashboard.routes");

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || "*" }));
app.use(express.json());
app.use("/uploads", express.static(path.resolve(__dirname, "../uploads")));

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/notices", noticeRoutes);
app.use("/api/dashboard", dashboardRoutes);

// TEMPORARY - remove after use
app.get("/api/run-seed-9f3k2x", async (req, res) => {
  try {
    const bcrypt = require("bcryptjs");
    const { User } = require("./models");

    const email = process.env.ADMIN_EMAIL || "admin@society.com";
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.json({ message: `Admin already exists: ${email}` });
    }

    const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD || "Admin@123", 10);
    await User.create({
      name: process.env.ADMIN_NAME || "Society Admin",
      email,
      passwordHash,
      role: "ADMIN",
    });

    res.json({ message: `Admin created: ${email}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Centralized error handler (e.g. multer file-type/size errors)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Internal server error" });
});

const PORT = process.env.PORT || 5000;

sequelize
  .sync() // creates tables if they don't exist; fine for SQLite + this assignment's scope
  .then(() => {
    app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("Failed to connect to database:", err);
    process.exit(1);
  });

module.exports = app;