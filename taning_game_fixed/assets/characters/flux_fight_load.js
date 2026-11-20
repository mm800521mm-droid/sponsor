/* Flux attack behavior: roaming TV route, timed word choice, then shared-door pressure. */
window.RIFT_CHARACTER_ATTACKS=window.RIFT_CHARACTER_ATTACKS||{};
window.RIFT_CHARACTER_ATTACKS.flux=Object.freeze({
 id:'flux',homeCam:2,interval:13,night6Route:[2,3,4,5,6,7,8,9,11,12],
 choiceWords:Object.freeze(['ACT','CUT','TAKE']),choiceLookSeconds:1.25,
 approachSeconds:16,doorSeconds:9,defense:'either-door',choiceFailureThreshold:2,
 night6ControlledBy:'shared-character-ai'
});