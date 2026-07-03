const path = require("path");
const fs = require("fs");
const { Sequelize } = require("sequelize");
require("dotenv").config();

const storagePath = process.env.DB_STORAGE || "./data/database.sqlite";
const resolvedPath = path.resolve(process.cwd(), storagePath);
fs.mkdirSync(path.dirname(resolvedPath), { recursive: true });

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: resolvedPath,
  logging: false,
});

module.exports = sequelize;
