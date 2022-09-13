const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
  return sequelize.define('oikeustasot', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    nimi: {
      type: DataTypes.STRING(40),
      allowNull: true
    }
  }, {
    tableName: 'oikeustasot',
    schema: 'public',
    timestamps: false
  });
};
