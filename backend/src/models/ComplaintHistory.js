const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/db");

// Append-only audit trail: one row per status change (including creation).
class ComplaintHistory extends Model {}

ComplaintHistory.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    status: {
      type: DataTypes.ENUM("OPEN", "IN_PROGRESS", "RESOLVED"),
      allowNull: false,
    },
    note: { type: DataTypes.TEXT, allowNull: true },
  },
  {
    sequelize,
    modelName: "complaintHistory",
    tableName: "complaint_history",
    timestamps: true,
    updatedAt: false, // history rows are immutable
  }
);

module.exports = ComplaintHistory;
