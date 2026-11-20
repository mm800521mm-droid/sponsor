/* Transfer attack behavior: existing three-stage pointer-contact threat; remains companion/group-owned. */
window.RIFT_CHARACTER_ATTACKS=window.RIFT_CHARACTER_ATTACKS||{};
window.RIFT_CHARACTER_ATTACKS.transfer=Object.freeze({
 id:'transfer',role:'companion',leader:'tannin',independentHostileAI:false,
 behavior:'pointer-contact-three-stage',stages:3,fillSeconds:3,
 fillPerSecond:.48,decayPerSecond:.18,
 defense:'avoid-pointer-contact',routeOwnedBy:'tannin'
});