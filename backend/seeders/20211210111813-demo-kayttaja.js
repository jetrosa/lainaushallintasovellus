'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('kayttajat', [{
      id: 1,
      etunimi: "Anto",
      sukunimi: "Admin",
      kieku_id: "admin",
      sahkoposti: "admin@admin.com",
      aktiivinen: 1,
      osasto_id: 1,
      oikeustaso: 1
    },
    {
      id: 2,
      etunimi: "Kalle",
      sukunimi: "Kaali",
      kieku_id: "892734",
      sahkoposti: "kallek@gmail.com",
      aktiivinen: 1,
      osasto_id: 1,
      oikeustaso: 4
    },
    {
      id: 3,
      etunimi: "Ulla",
      sukunimi: "Maija",
      kieku_id: "492756",
      sahkoposti: "ullamaija@gmail.com",
      aktiivinen: 0,
      osasto_id: 1,
      oikeustaso: 4
    }]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('kayttajat', null, {});
  }
};
