'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('lahdemuokkaukset', [{
      kommentti: "muokattu virheellista tietoa",
      muokkaus_pvm: "25/2/2021",
      muokkaaja_id: 1,
      muokattu_nayte_id: 1,
    },
    {
      kommentti: "muokattu jotain muuta",
      muokkaus_pvm: "25/2/1994",
      muokkaaja_id: 1,
      muokattu_nayte_id: 1,
    },
    {
      kommentti: "muokattu nimi",
      muokkaus_pvm: "25/4/2021",
      muokkaaja_id: 1,
      muokattu_nayte_id: 1,
    }]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('lahdemuokkaukset', null, {});

  }
};
