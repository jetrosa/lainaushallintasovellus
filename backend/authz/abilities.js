const { AbilityBuilder, Ability } = require("@casl/ability");

function defineRulesFor(user) {
  const { can, rules } = new AbilityBuilder(Ability);

  // If no user, no rules
  if (!user) return new Ability(rules);


  switch (user.oikeustaso) {
    case 1: //admin
      can("manage", "all");
      can("modify", "all");
      can("loan", "all");
      can("read", "all");
      break;
    case 2: //muokkaaja
      can("modify", "all");
      can("loan", "all");
      can("read", "all");
      break;
    case 3: //lainaaja
      can("loan", "all");
      can("read", "all");
      break;
    case 4: //katselija
      can("read", "all");
      break;
    default:
      // anonymous users can't do anything
      can();
      break;
  }

  return new Ability(rules);
}

module.exports = {
  defineRulesFor,
};