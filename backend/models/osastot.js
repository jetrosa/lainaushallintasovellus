const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
  return sequelize.define('osastot', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    nimi: {
      type: DataTypes.STRING(80),
      allowNull: true
    },
    nimi_lyhenne: {
      type: DataTypes.STRING(10),
      allowNull: false,
      unique: true
    }
  }, {
    tableName: 'osastot',
    schema: 'public',
    timestamps: false
  });
};
