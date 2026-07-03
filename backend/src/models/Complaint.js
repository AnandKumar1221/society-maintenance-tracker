const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/db");

class Complaint extends Model {}

Complaint.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    category: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    photoUrl: { type: DataTypes.STRING, allowNull: true },
    priority: {
      type: DataTypes.ENUM("LOW", "MEDIUM", "HIGH"),
      allowNull: false,
      defaultValue: "MEDIUM",
    },
    status: {
      type: DataTypes.ENUM("OPEN", "IN_PROGRESS", "RESOLVED"),
      allowNull: false,
      defaultValue: "OPEN",
    },
    resolvedAt: { type: DataTypes.DATE, allowNull: true },
  },
  { sequelize, modelName: "complaint", tableName: "complaints", timestamps: true }
);

module.exports = Complaint;
