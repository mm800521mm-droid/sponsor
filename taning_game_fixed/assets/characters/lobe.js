/* Lobe AI policy; AI shortens the existing flash response window, minimum 3 seconds. */
window.RIFT_CHARACTER_AI_POLICIES=window.RIFT_CHARACTER_AI_POLICIES||{};
window.RIFT_CHARACTER_AI_POLICIES.lobe=Object.freeze({
 getLevel:()=>Math.max(0,Math.min(20,Number((window.RIFT_CURRENT_AI_LEVELS||{}).lobe ?? ((((window.NIGHT_SETTINGS||{})[Number((window.RIFT_NIGHT_STATE||{}).night)||0]||{}).characters||{}).lobe))||0)),
 canAct:level=>level>0&&(typeof window.riftCanCharacterMove==='function'?window.riftCanCharacterMove(level):Math.random()*100<level*5),
 pace:(seconds,level,night)=>seconds/(1+Math.max(0,night-1)*.12+level*.075),
 responseSeconds:level=>Math.max(3,8-Math.max(0,Math.min(20,level))*.25)
});