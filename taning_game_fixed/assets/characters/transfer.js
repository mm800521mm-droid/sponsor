/* Transfer AI policy; preserves the existing pointer-contact mechanic and AI-scaled heat. */
window.RIFT_CHARACTER_AI_POLICIES=window.RIFT_CHARACTER_AI_POLICIES||{};
window.RIFT_CHARACTER_AI_POLICIES.transfer=Object.freeze({
 getLevel:()=>Math.max(0,Math.min(20,Number((window.RIFT_CURRENT_AI_LEVELS||{}).transfer ?? ((((window.NIGHT_SETTINGS||{})[Number(window.RIFT_ACTIVE_NIGHT)||0]||{}).characters||{}).transfer))||0)),
 canAct:level=>level>0,
 pace:(seconds,level)=>seconds/(1+level*.075)
});