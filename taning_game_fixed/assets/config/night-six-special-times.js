/*
 * Rift Ash - Night 6 special-time schedule
 * 第六夜专属时间轴。这里只定义事件时间与类型，不放保安室主体逻辑。
 */
window.RIFT_NIGHT6_SPECIAL_TIMES = Object.freeze([
  { id: 'noka-tone-break', mutationId: 'noka-tone-break', at: '00:50', type: 'night_six_one_shot_mutation' },
  { id: 'tannin-red-rush', mutationId: 'tannin-red-rush', at: '01:40', type: 'night_six_one_shot_mutation' },
  { id: 'lobe-forced-rule', mutationId: 'lobe-forced-rule', at: '02:30', type: 'night_six_one_shot_mutation' },
  { id: 'gu-last-report', mutationId: 'gu-last-report', at: '03:20', type: 'night_six_one_shot_mutation' },
  { id: 'chillo-final-promo', mutationId: 'chillo-final-promo', at: '04:10', type: 'night_six_one_shot_mutation' },
  { id: 'cosmo-orbit-break', mutationId: 'cosmo-orbit-break', at: '04:50', type: 'night_six_one_shot_mutation' },
  { id: 'transfer-collective-rage', mutationId: 'transfer-collective-rage', at: '05:15', type: 'night_six_one_shot_mutation' },
  { id: 'all-return', at: '05:30', type: 'all_except_eleven_return_to_start' },
  { id: 'eleven-awakens', at: '05:40', type: 'eleven_activates' },
  { id: 'eleven-turns', at: '07:30', type: 'eleven_changes_direction_toward_deadin' },
  { id: 'line-impact', at: '07:45', type: 'nearby_line_impact' },
  { id: 'call-cut', at: '07:56', type: 'deadin_call_disconnects' }
]);
