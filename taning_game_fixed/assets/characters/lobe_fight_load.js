/* Lobe attack behavior: CAM10 flash window; missed response rolls the clock back one hour. */
window.RIFT_CHARACTER_ATTACKS=window.RIFT_CHARACTER_ATTACKS||{};
window.RIFT_CHARACTER_ATTACKS.lobe=Object.freeze({
 id:'lobe',homeCam:10,interval:17,route:[10],trigger:'cam10-flash-window',
 defense:'flash-on-cam10',responseBaseSeconds:8,responsePerAI:.25,
 minimumResponseSeconds:3,timeoutEffect:Object.freeze({type:'time-rollback',hours:1}),
 night6ControlledBy:'night-six-character-system'
});