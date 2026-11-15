/* Rift Ash — timed per-night AI level changes. Game clock: one real minute per in-game hour. */
(() => {
  'use strict';
  const stages = {
    1: [{ at: 4, values: { gildedEleven:5, flux:5, noka:5, tannin:5, lobe:5, gu:5, chillo:5, cosmo:5, transfer:5 } }],
    2: [{ at: 3, values: { lobe:2, tannin:4 } }],
    3: [{ at: 3, values: { tannin:5 } }],
    4: [{ at: 3, values: { gildedEleven:3, flux:4, noka:20, tannin:10, lobe:13, gu:13, chillo:8, cosmo:13, transfer:13 } }],
    5: [{ at: 3, values: { gildedEleven:5, flux:12, noka:20, tannin:15, lobe:20, gu:20, chillo:8, cosmo:20, transfer:20 } }]
  };
  let night = 0, applied = new Set();
  function apply(values, at) {
    const current = window.RIFT_CURRENT_AI_LEVELS || {};
    Object.assign(current, values);
    window.RIFT_CURRENT_AI_LEVELS = current;
    if (typeof taning !== 'undefined' && typeof taning.setAILevel === 'function') taning.setAILevel(Number(current.tannin) || 0);
    if (typeof gildedEleven !== 'undefined' && typeof gildedEleven.setAILevel === 'function') gildedEleven.setAILevel(Number(current.gildedEleven) || 0);
    window.dispatchEvent(new CustomEvent('rift:night-ai-levels-changed', { detail: { night, at, values: { ...current } } }));
  }
  window.addEventListener('rift:night-start', event => {
    night = Number(event.detail && event.detail.night) || 0;
    applied.clear();
    const base = ((window.NIGHT_SETTINGS || {})[night] || {}).characters || {};
    window.RIFT_CURRENT_AI_LEVELS = { ...base };
    apply(base, 0);
  });
  window.addEventListener('rift:game-frame', event => {
    if (!event.detail || !event.detail.running || !night) return;
    const hour = Math.floor(Math.max(0, Number(event.detail.elapsed) || 0) / 60000);
    for (const stage of stages[night] || []) {
      if (hour < stage.at || applied.has(stage.at)) continue;
      applied.add(stage.at);
      apply(stage.values, stage.at);
    }
  });
  window.RIFT_NIGHT_AI_PROGRESSION = Object.freeze({ stages });
})();