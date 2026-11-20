/* Noka AI policy; AI=0 disables drain, movement and attack. */
window.RIFT_CHARACTER_AI_POLICIES=window.RIFT_CHARACTER_AI_POLICIES||{};
window.RIFT_CHARACTER_AI_POLICIES.noka=Object.freeze({
 getLevel:()=>Math.max(0,Math.min(20,Number((window.RIFT_CURRENT_AI_LEVELS||{}).noka ?? ((((window.NIGHT_SETTINGS||{})[Number((window.RIFT_NIGHT_STATE||{}).night)||0]||{}).characters||{}).noka))||0)),
 canAct:level=>level>0&&(typeof window.riftCanCharacterMove==='function'?window.riftCanCharacterMove(level):Math.random()*100<level*5),
 pace:(seconds,level,night)=>seconds/(1+Math.max(0,night-1)*.12+level*.075)
});