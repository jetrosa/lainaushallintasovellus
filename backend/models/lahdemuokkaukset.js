const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('lahdemuokkaukset', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    kommentti: {
      type: DataTypes.STRING(1000),
      allowNull: true
    },
    loki: {
      type: DataTypes.STRING(3000),
      allowNull: true
    },
    muokkaus_pvm: {
      type: DataTypes.DATEONLY,
      allowNull: false
    }
  }, {

    tableName: 'lahdemuokkaukset',
    schema: 'public',
    timestamps: false
  });
};
