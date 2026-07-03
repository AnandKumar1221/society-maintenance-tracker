// Creates the initial admin account from .env values. Safe to re-run.
require("dotenv").config();
const bcrypt = require("bcryptjs");
const sequelize = require("../config/db");
const { User } = require("../models");

async function seed() {
  await sequelize.sync();

  const email = process.env.ADMIN_EMAIL || "admin@society.com";
  const existing = await User.findOne({ where: { email } });
  if (existing) {
    console.log(`Admin already exists: ${email}`);
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD || "Admin@123", 10);
  await User.create({
    name: process.env.ADMIN_NAME || "Society Admin",
    email,
    passwordHash,
    role: "ADMIN",
  });

  console.log(`Admin created: ${email} / ${process.env.ADMIN_PASSWORD || "Admin@123"}`);
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
