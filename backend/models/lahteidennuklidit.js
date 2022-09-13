const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('lahteidennuklidit', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    referenssi_aktiivisuus: {
      type: DataTypes.DOUBLE,
      allowNull: false
    }
  }, {
    tableName: 'lahteidennuklidit',
    schema: 'public',
    timestamps: false
  });
};
