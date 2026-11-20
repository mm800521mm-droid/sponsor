/* Chillo attack behavior: CAM06 -> CAM03 -> right doorway; right door is the defense. */
window.RIFT_CHARACTER_ATTACKS=window.RIFT_CHARACTER_ATTACKS||{};
window.RIFT_CHARACTER_ATTACKS.chillo=Object.freeze({
 id:'chillo',homeCam:6,interval:18,route:[6,3,1],doorSide:'right',
 moveBetweenNodesSeconds:7,doorWarningSeconds:8,defense:'close-right-door',
 night6ControlledBy:'night-six-character-system'
});