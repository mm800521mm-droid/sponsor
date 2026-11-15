/*
 * Rift Ash - Night settings
 * 每个夜晚都完整列出全部角色；0 = 本夜不出场、不行动，1-20 = 本夜 AI 等级。
 * AI 数字只影响每次行动检查的成功概率；行动检查间隔由角色自身 timings 决定。
 * specialTimes 与该夜角色表放在同一个夜晚对象中。
 */
(function () {
  const MAX_AI = 20;
  const roster = [
    'gildedEleven', 'flux', 'noka', 'tannin', 'lobe', 'gu',
    'chillo', 'cosmo', 'transfer', 'deadin', 'split', 'yu', 'guard'
  ];

  function makeNight(characters, specialTimes = []) {
    const missing = roster.filter(id => !Object.prototype.hasOwnProperty.call(characters, id));
    if (missing.length) throw new Error('Night settings missing character IDs: ' + missing.join(', '));

    for (const id of roster) {
      const value = Number(characters[id]);
      if (!Number.isInteger(value) || value < 0 || value > MAX_AI) {
        throw new Error('Invalid AI level for ' + id + ': ' + characters[id] + ' (allowed: 0-20)');
      }
    }
    return {
      characters: Object.fromEntries(roster.map(id => [id, Number(characters[id])])),
      specialTimes
    };
  }

  window.NIGHT_SETTINGS = {
    1: makeNight({
      gildedEleven: 0, flux: 0, noka: 0, tannin: 0, lobe: 0, gu: 0,
      chillo: 0, cosmo: 0, transfer: 4, deadin: 0, split: 0, yu: 0, guard: 0
    }),
    2: makeNight({
      gildedEleven: 0, flux: 0, noka: 0, tannin: 0, lobe: 0, gu: 4,
      chillo: 0, cosmo: 0, transfer: 5, deadin: 0, split: 0, yu: 0, guard: 0
    }),
    3: makeNight({
      gildedEleven: 0, flux: 4, noka: 0, tannin: 5, lobe: 0, gu: 5,
      chillo: 4, cosmo: 4, transfer: 6, deadin: 0, split: 0, yu: 0, guard: 0
    }),
    4: makeNight({
      gildedEleven: 0, flux: 6, noka: 0, tannin: 7, lobe: 0, gu: 6,
      chillo: 5, cosmo: 6, transfer: 8, deadin: 0, split: 0, yu: 0, guard: 0
    }),
    5: makeNight({
      gildedEleven: 0, flux: 8, noka: 0, tannin: 10, lobe: 0, gu: 8,
      chillo: 7, cosmo: 8, transfer: 11, deadin: 0, split: 0, yu: 0, guard: 0
    }),
    6: makeNight({
      gildedEleven: 0, flux: 10, noka: 0, tannin: 12, lobe: 0, gu: 10,
      chillo: 9, cosmo: 10, transfer: 13, deadin: 0, split: 0, yu: 0, guard: 0
    }, [
      { id: 'all-return', at: '05:30', type: 'all_except_eleven_return_to_start' },
      { id: 'eleven-awakens', at: '05:40', type: 'eleven_activates' },
      { id: 'eleven-turns', at: '07:30', type: 'eleven_changes_direction_toward_deadin' },
      { id: 'line-impact', at: '07:45', type: 'nearby_line_impact' },
      { id: 'call-cut', at: '07:56', type: 'deadin_call_disconnects' }
    ])
  };

  // 自定义行动概率曲线：AI 1-11 每级 +5%；AI 12 起进入高概率区。
  const AI_CHANCES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 90, 92, 94, 95, 96, 97, 98, 99, 100];
  window.RIFT_AI_CHANCES = AI_CHANCES.slice();
  window.riftCanCharacterMove = function (ai) {
    const level = Math.max(0, Math.min(20, Math.floor(Number(ai) || 0)));
    return Math.random() * 100 < AI_CHANCES[level];
  };

  window.RIFT_CHARACTER_ROSTER = roster.slice();
  window.RIFT_MAX_AI_LEVEL = MAX_AI;
})();
