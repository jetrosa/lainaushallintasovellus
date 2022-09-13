//HUOM!!! TODO: viite_lahde_sertifikaatti, viite_lahteen_lupaanvientiasiakirjaan, viite_lahteen_luvastapoistoasiakirjaan

const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
  return sequelize.define('sateilylahteet', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    kutsumanimi: {
      type: DataTypes.STRING(80),
      allowNull: true
    },
    viite_valmistaja: {
      type: DataTypes.STRING(80),
      allowNull: false
    },
    viite_stuk: {
      type: DataTypes.STRING(80),
      allowNull: false
    },
    viite_lahde_sertifikaatti: {
      type: DataTypes.STRING(60),
      allowNull: true
    },
    lisatty_pvm: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    parasta_ennen_pvm: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    hankintatapa: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    lisatiedot: {
      type: DataTypes.STRING(2000),
      allowNull: true
    },
    poistettu_pvm: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    sailytyspaikka: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    sailytyspaikka_tarkenne: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    poisto_syy: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    poisto_tapa: {
      type: DataTypes.STRING(80),
      allowNull: true
    },
    umpi_luokituskoodi: {
      type: DataTypes.STRING(40),
      allowNull: true
    },
    umpi_erityismuotoisuus: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    umpi_erityismuotoisuus_pvm: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    umpi_erityismuotoisuus_todistus: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    avo_referenssi_tilavuus: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    avo_nykyinen_tilavuus: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    viite_lahteen_lupaanvientiasiakirjaan: {
      type: DataTypes.STRING(60),
      allowNull: true
    },
    viite_lahteen_luvastapoistoasiakirjaan: {
      type: DataTypes.STRING(60),
      allowNull: true
    },
    tyyppi: {
      type: DataTypes.STRING(24),
      allowNull: false
    },
    referenssi_pvm: {
      type: DataTypes.DATE,
      allowNull: false
    },
    avo_koostumus: {
      type: DataTypes.STRING(24),
      allowNull: true
    }
  }, {
    tableName: 'sateilylahteet',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "sateilylahteet_viite_stuk_key",
        unique: true,
        fields: [
          { name: "viite_stuk" }
        ]
      }
    ]
  });
};
