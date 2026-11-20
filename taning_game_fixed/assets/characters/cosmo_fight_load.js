/* Cosmo companion behavior: follows Tannin's authored companion/group system; no new hostile attack. */
window.RIFT_CHARACTER_ATTACKS=window.RIFT_CHARACTER_ATTACKS||{};
window.RIFT_CHARACTER_ATTACKS.cosmo=Object.freeze({
 id:'cosmo',role:'companion',leader:'tannin',independentHostileAI:false,
 behavior:'follow-tannin',routeOwnedBy:'tannin',defenseOwnedBy:'tannin'
});