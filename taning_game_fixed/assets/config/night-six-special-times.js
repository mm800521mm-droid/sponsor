/*
 * Rift Ash - Night 6 special-time schedule
 * Seven one-shot mutations begin only after Eleven awakens.
 * The first attack starts 30 seconds after 05:40; each following attack is 30 seconds later.
 */
window.RIFT_NIGHT6_SPECIAL_TIMES = Object.freeze([
  { id: 'all-return', at: '05:30', type: 'all_except_eleven_return_to_start' },
  { id: 'eleven-awakens', at: '05:40', type: 'eleven_activates' },

  { id: 'noka-tone-break', mutationId: 'noka-tone-break', at: '06:10', type: 'night_six_one_shot_mutation' },
  { id: 'tannin-red-rush', mutationId: 'tannin-red-rush', at: '06:40', type: 'night_six_one_shot_mutation' },
  { id: 'lobe-forced-rule', mutationId: 'lobe-forced-rule', at: '07:10', type: 'night_six_one_shot_mutation' },
  { id: 'gu-last-report', mutationId: 'gu-last-report', at: '07:40', type: 'night_six_one_shot_mutation' },
  { id: 'chillo-final-promo', mutationId: 'chillo-final-promo', at: '08:10', type: 'night_six_one_shot_mutation' },
  { id: 'cosmo-orbit-break', mutationId: 'cosmo-orbit-break', at: '08:40', type: 'night_six_one_shot_mutation' },
  { id: 'transfer-collective-rage', mutationId: 'transfer-collective-rage', at: '09:10', type: 'night_six_one_shot_mutation' },

  { id: 'eleven-turns', at: '07:30', type: 'eleven_changes_direction_toward_deadin' },
  { id: 'line-impact', at: '07:45', type: 'nearby_line_impact' },
  { id: 'call-cut', at: '07:56', type: 'deadin_call_disconnects' }
]);
