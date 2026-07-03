const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/db");

class Notice extends Model {}

Notice.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    title: { type: DataTypes.STRING, allowNull: false },
    body: { type: DataTypes.TEXT, allowNull: false },
    important: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  },
  { sequelize, modelName: "notice", tableName: "notices", timestamps: true }
);

module.exports = Notice;
