/* Gu attack behavior: CAM04 -> CAM05 -> left doorway; left door is the defense. */
window.RIFT_CHARACTER_ATTACKS=window.RIFT_CHARACTER_ATTACKS||{};
window.RIFT_CHARACTER_ATTACKS.gu=Object.freeze({
 id:'gu',homeCam:4,interval:16,route:[4,5,1],doorSide:'left',
 moveBetweenNodesSeconds:7,doorWarningSeconds:8,defense:'close-left-door',
 night6ControlledBy:'night-six-character-system'
});