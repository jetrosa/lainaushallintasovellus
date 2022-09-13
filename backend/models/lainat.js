const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('lainat', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    voimassa: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    lainaus_pvm: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    arvioitu_palautus_pvm: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    lopullinen_palautus_pvm: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    lainaus_syy: {
      type: DataTypes.STRING(1000),
      allowNull: false
    },
    sailytys_tiedot: {
      type: DataTypes.STRING(1000),
      allowNull: false
    },
    avo_palautettu_tilavuus: {
      type: DataTypes.DOUBLE,
      allowNull: true
    }
  }, {
    tableName: 'lainat',
    schema: 'public',
    timestamps: false
  });
};
