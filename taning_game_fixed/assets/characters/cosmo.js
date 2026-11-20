/* Cosmo companion AI policy; the companion does not create an independent attack. */
window.RIFT_CHARACTER_AI_POLICIES=window.RIFT_CHARACTER_AI_POLICIES||{};
window.RIFT_CHARACTER_AI_POLICIES.cosmo=Object.freeze({
 getLevel:()=>Math.max(0,Math.min(20,Number((window.RIFT_CURRENT_AI_LEVELS||{}).cosmo ?? ((((window.NIGHT_SETTINGS||{})[Number((window.RIFT_NIGHT_STATE||{}).night)||0]||{}).characters||{}).cosmo))||0)),
 canAct:()=>false,
 pace:(seconds)=>seconds
});