const DataTypes = require("sequelize").DataTypes;
const _kayttajat = require("./kayttajat");
const _lahdemuokkaukset = require("./lahdemuokkaukset");
const _lahteidennuklidit = require("./lahteidennuklidit");
const _lainat = require("./lainat");
const _nuklidit = require("./nuklidit");
const _oikeustasot = require("./oikeustasot");
const _osastot = require("./osastot");
const _sateilylahteet = require("./sateilylahteet");

function initModels(sequelize) {
  const kayttajat = _kayttajat(sequelize, DataTypes);
  const lahdemuokkaukset = _lahdemuokkaukset(sequelize, DataTypes);
  const lahteidennuklidit = _lahteidennuklidit(sequelize, DataTypes);
  const lainat = _lainat(sequelize, DataTypes);
  const nuklidit = _nuklidit(sequelize, DataTypes);
  const oikeustasot = _oikeustasot(sequelize, DataTypes);
  const osastot = _osastot(sequelize, DataTypes);
  const sateilylahteet = _sateilylahteet(sequelize, DataTypes);

  kayttajat.belongsTo(osastot, {  as: "osasto", foreignKey: "osasto_id"});
  osastot.hasMany(kayttajat, {  foreignKey: "osasto_id"});
  kayttajat.belongsTo(oikeustasot, {  foreignKey: "oikeustaso"});
  oikeustasot.hasMany(kayttajat, {  foreignKey: "oikeustaso"});

  lahdemuokkaukset.belongsTo(sateilylahteet, {  foreignKey: "muokattu_nayte_id"});
  sateilylahteet.hasMany(lahdemuokkaukset, {  foreignKey: "muokattu_nayte_id"});
  lahdemuokkaukset.belongsTo(kayttajat, {  as: "muokkaaja", foreignKey: "muokkaaja_id"});
  kayttajat.hasMany(lahdemuokkaukset, {  foreignKey: "muokkaaja_id"});

  lahteidennuklidit.belongsTo(sateilylahteet, {  foreignKey: "nayte_id"});
  sateilylahteet.hasMany(lahteidennuklidit, {  foreignKey: "nayte_id"});
  lahteidennuklidit.belongsTo(nuklidit, {  foreignKey: "nuklidi"});
  nuklidit.hasMany(lahteidennuklidit, {  foreignKey: "nuklidi"});

  lainat.belongsTo(kayttajat, {  as: "lainaaja", foreignKey: "lainaaja_id"});
  kayttajat.hasMany(lainat, {  foreignKey: "lainaaja_id"});
  lainat.belongsTo(sateilylahteet, { foreignKey: "nayte_id"});
  sateilylahteet.hasMany(lainat, {  foreignKey: "nayte_id"});
  lainat.belongsTo(kayttajat, {  as: "palauttaja", foreignKey: "palauttajan_id"});
  kayttajat.hasMany(lainat, {  foreignKey: "palauttajan_id"});

  sateilylahteet.belongsTo(kayttajat, {  as: "lisaaja", foreignKey: "lisaajan_id"});
  kayttajat.hasMany(sateilylahteet, {  foreignKey: "lisaajan_id"});
  sateilylahteet.belongsTo(kayttajat, {  as: "poistaja", foreignKey: "poistajan_id"});
  kayttajat.hasMany(sateilylahteet, {  foreignKey: "poistajan_id"});
  sateilylahteet.belongsTo(kayttajat, {  as: "vastuuhenkilo", foreignKey: "vastuuhenkilo_id"});
  kayttajat.hasMany(sateilylahteet, {  foreignKey: "vastuuhenkilo_id"});
  sateilylahteet.belongsTo(osastot, {  as: "vastuuosasto", foreignKey: "vastuuosasto_id"});
  osastot.hasMany(sateilylahteet, {  foreignKey: "vastuuosasto_id"});

  return {
    kayttajat,
    lahdemuokkaukset,
    lahteidennuklidit,
    lainat,
    nuklidit,
    oikeustasot,
    osastot,
    sateilylahteet,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
