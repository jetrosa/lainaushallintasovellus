'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('nuklidit', [{
      nuklidi: "ht1",
      puoliintumisaika: 0.254,
    },
    {
      nuklidi: "ht2",
      puoliintumisaika: 1.254,
    },
    {
      nuklidi: "54g",
      puoliintumisaika: 0.754,
    },
    {
      nuklidi: "are123",
      puoliintumisaika: 0.00,
    }]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('nuklidit', null, {});
  }
};
