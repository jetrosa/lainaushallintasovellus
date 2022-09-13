import { Ability, AbilityBuilder } from "@casl/ability"
import React, { useContext } from "react";
import { Context } from './AuthContext';

function DefineAbilities () {
    const { can, rules } = new AbilityBuilder(Ability);
    const [state] = useContext(Context);
  
    if (state.user.auth_level === 1) {
        can('manage', 'all');
        can('modify', 'all');
        can('loan', 'all');
        can('read','all');
    }
    if (state.user.auth_level === 2) {
        can('modify', 'all');
        can('loan', 'all');
        can('read','all');
    }
    if (state.user.auth_level === 3) {
        can('loan', 'all');
        can('read','all');
    }
    if (state.user.auth_level === 4) {
        can('read','all');
    }
  
    return new Ability(rules);  
}

function CheckAbility (permission, range) {
  const ability = DefineAbilities();
  return ability.can(permission, range);
}

export {CheckAbility};