const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('nuklidit', {
    nuklidi: {
      type: DataTypes.STRING(20),
      allowNull: false,
      primaryKey: true
    },
    puoliintumisaika: {
      type: DataTypes.DOUBLE,
      allowNull: false
    }
  }, {
    tableName: 'nuklidit',
    schema: 'public',
    timestamps: false
  });
};
