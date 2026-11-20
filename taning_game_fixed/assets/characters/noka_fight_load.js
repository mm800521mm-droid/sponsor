/* Noka attack behavior: music-box crank, room migration, then unwound-box scare. */
window.RIFT_CHARACTER_ATTACKS=window.RIFT_CHARACTER_ATTACKS||{};
window.RIFT_CHARACTER_ATTACKS.noka=Object.freeze({
 id:'noka',homeCam:13,interval:24,requiresCrank:true,crankMaximum:5,
 drainBaseSeconds:24,drainPerAI:.9,minimumDrainSeconds:6,
 unpoweredMoveSeconds:3.5,unpoweredScareSeconds:12,
 movement:'random-camera',defense:'rewind-music-box',
 night6ControlledBy:'night-six-character-system'
});