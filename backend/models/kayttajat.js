const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
  return sequelize.define('kayttajat', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    etunimi: {
      type: DataTypes.STRING(40),
      allowNull: false
    },
    sukunimi: {
      type: DataTypes.STRING(40),
      allowNull: false
    },
    sahkoposti: {
      type: DataTypes.STRING(80),
      allowNull: false
    },
    aktiivinen: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    kieku_id: {
      type: DataTypes.STRING(40),
      allowNull: false
    }
  }, {
    tableName: 'kayttajat',
    schema: 'public',
    timestamps: false
  });
};
