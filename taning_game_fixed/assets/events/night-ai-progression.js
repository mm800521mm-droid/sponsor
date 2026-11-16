/* Rift Ash — fixed per-night AI levels.
 * AI probability is determined only by NIGHT_SETTINGS (or a runtime test override),
 * never increased or unlocked by the in-game clock.
 */
(() => {
  'use strict';
  let night = 0;
  function sync(event) {
    night = Number(event.detail && event.detail.night) || 0;
    const base = ((window.NIGHT_SETTINGS || {})[night] || {}).characters || {};
    window.RIFT_CURRENT_AI_LEVELS = { ...base };
    if (typeof taning !== 'undefined' && typeof taning.setAILevel === 'function') taning.setAILevel(Number(base.tannin) || 0);
    if (typeof gildedEleven !== 'undefined' && typeof gildedEleven.setAILevel === 'function') gildedEleven.setAILevel(Number(base.gildedEleven) || 0);
    window.dispatchEvent(new CustomEvent('rift:night-ai-levels-changed', { detail: { night, at: 0, values: { ...base }, fixed: true } }));
  }
  window.addEventListener('rift:night-start', sync);
  window.RIFT_NIGHT_AI_PROGRESSION = Object.freeze({ mode: 'fixed-per-night', sync: () => sync({ detail: { night } }) });
})();
