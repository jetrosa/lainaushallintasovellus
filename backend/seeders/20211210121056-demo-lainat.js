'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('lainat', [{
      voimassa: 1,
      lainaus_pvm: "15.2.2021",
      arvioitu_palautus_pvm: "30.3.2021",
      lopullinen_palautus_pvm: null,
      lainaus_syy: "opetustilanne",
      sailytys_tiedot: "taskussa",
      avo_palautettu_tilavuus: 0.244,
      nayte_id: 1,
      lainaaja_id: 1,
      palauttajan_id: 1,
    },
    {
      voimassa: 0,
      lainaus_pvm: "15.2.2021",
      arvioitu_palautus_pvm: "30.3.2021",
      lopullinen_palautus_pvm: "16.2.2021",
      lainaus_syy: "opetustilanne",
      sailytys_tiedot: "turvakaappi",
      avo_palautettu_tilavuus: 1.5,
      nayte_id: 2,
      lainaaja_id: 2,
      palauttajan_id: 1,
    }]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('lainat', null, {});
  }
};
