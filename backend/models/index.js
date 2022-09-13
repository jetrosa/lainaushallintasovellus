/**
 * Sequelizen konfigurointi ja tietokantamallinnus (ORM).
 */

'use strict';
const initModels = require("./init-models");
const Sequelize = require('sequelize');
//config-muuttujat valitaan NODE_ENV -muuttujan arvon mukaan
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.js')[env];

const sequelize = new Sequelize(config.database, config.username, config.password, config);

initModels(sequelize);
module.exports.sequelize = sequelize;
