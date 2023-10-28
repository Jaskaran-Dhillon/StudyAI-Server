const { DataTypes } = require("sequelize");
const sequelize = require("../util/database");

const User = sequelize.define("User", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
    unique: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  firstName: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  lastName: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  }
});

module.exports = User;