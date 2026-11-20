/* Flux AI policy; level 0 is fully dormant. */
window.RIFT_CHARACTER_AI_POLICIES=window.RIFT_CHARACTER_AI_POLICIES||{};
window.RIFT_CHARACTER_AI_POLICIES.flux=Object.freeze({
 getLevel:()=>Math.max(0,Math.min(20,Number((window.RIFT_CURRENT_AI_LEVELS||{}).flux ?? ((((window.NIGHT_SETTINGS||{})[Number(window.RIFT_ACTIVE_NIGHT)||0]||{}).characters||{}).flux))||0)),
 canAct:level=>level>0&&(typeof window.riftCanCharacterMove==='function'?window.riftCanCharacterMove(level):Math.random()*100<level*5),
 pace:(seconds,level,night)=>seconds/(1+Math.max(0,night-1)*.12+level*.075)
});