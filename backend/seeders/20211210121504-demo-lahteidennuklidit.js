'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('lahteidennuklidit', [{
      referenssi_aktiivisuus: 0.55,
      nuklidi: "ht1",
      nayte_id: 1,
    },
    {
      referenssi_aktiivisuus: 3.55,
      nuklidi: "ht2",
      nayte_id: 2,
    },
    {
      referenssi_aktiivisuus: 2.55,
      nuklidi: "54g",
      nayte_id: 3,
    }]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('lahteidennuklidit', null, {});
  }
};
