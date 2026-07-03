const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/db");

class User extends Model {}

User.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    passwordHash: { type: DataTypes.STRING, allowNull: false },
    role: {
      type: DataTypes.ENUM("RESIDENT", "ADMIN"),
      allowNull: false,
      defaultValue: "RESIDENT",
    },
    flatNumber: { type: DataTypes.STRING, allowNull: true },
  },
  { sequelize, modelName: "user", tableName: "users", timestamps: true }
);

module.exports = User;
