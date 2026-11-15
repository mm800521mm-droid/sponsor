/*
 * Rift Ash - Night 6 special-time schedule.
 * Four independent mutation attacks begin after Eleven awakens; Tannin's companions follow him.
 */
window.RIFT_NIGHT6_SPECIAL_TIMES = Object.freeze([
  { id: 'all-return', at: '05:30', type: 'all_except_eleven_return_to_start' },
  { id: 'eleven-awakens', at: '05:40', type: 'eleven_activates' },
  { id: 'tannin-red-rush', mutationId: 'tannin-red-rush', at: '06:10', type: 'night_six_one_shot_mutation' },
  { id: 'lobe-forced-rule', mutationId: 'lobe-forced-rule', at: '06:40', type: 'night_six_one_shot_mutation' },
  { id: 'gu-last-report', mutationId: 'gu-last-report', at: '07:10', type: 'night_six_one_shot_mutation' },
  { id: 'eleven-turns', at: '07:30', type: 'eleven_changes_direction_toward_deadin' },
  { id: 'chillo-final-promo', mutationId: 'chillo-final-promo', at: '07:40', type: 'night_six_one_shot_mutation' },
  { id: 'line-impact', at: '07:45', type: 'nearby_line_impact' },
  { id: 'call-cut', at: '07:56', type: 'deadin_call_disconnects' }
]);
