/*
 * Rift Ash - Night settings
 * 每个夜晚都完整列出全部角色；0 = 本夜不出场、不行动，1-20 = 本夜 AI 等级。
 * AI 数字同时影响行动检查成功概率与行动节奏；AI 越高，检查越频繁、行动越快。
 * 第六夜特殊时间表由 night-six-special-times.js 独立提供。
 */
(function () {
  const MAX_AI = 20;
  const roster = [
    'gildedEleven', 'flux', 'noka', 'tannin', 'lobe', 'gu',
    'chillo', 'cosmo', 'transfer'
  ];

  function makeNight(characters, specialTimes = [], alwaysPresent = []) {
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
      specialTimes,
      alwaysPresent: alwaysPresent.slice()
    };
  }

  window.NIGHT_SETTINGS = {
    1: makeNight({
      gildedEleven: 0, flux: 0, noka: 0, tannin: 0, lobe: 0, gu: 3,
      chillo: 0, cosmo: 2, transfer: 2
    }),
    2: makeNight({
      gildedEleven: 0, flux: 0, noka: 3, tannin: 3, lobe: 2, gu: 8,
      chillo: 0, cosmo: 8, transfer: 8
    }),
    3: makeNight({
      gildedEleven: 1, flux: 3, noka: 10, tannin: 0, lobe: 8, gu: 8,
      chillo: 3, cosmo: 8, transfer: 8
    }),
    4: makeNight({
      gildedEleven: 2, flux: 4, noka: 15, tannin: 0, lobe: 10, gu: 10,
      chillo: 6, cosmo: 10, transfer: 10
    }),
    5: makeNight({
      gildedEleven: 5, flux: 10, noka: 20, tannin: 15, lobe: 16, gu: 16,
      chillo: 6, cosmo: 16, transfer: 16
    }),
    6: makeNight({
      gildedEleven: 12, flux: 15, noka: 20, tannin: 20, lobe: 20, gu: 20,
      chillo: 20, cosmo: 20, transfer: 20
    }, window.RIFT_NIGHT6_SPECIAL_TIMES || [], ['noka'])
  };

  // 自定义行动概率曲线：AI 1-11 每级 +5%；AI 12 起进入高概率区。
  const AI_CHANCES = [0, 10, 20, 30, 40, 50, 60, 70, 80, 88, 94, 97, 99, 99, 99, 100, 100, 100, 100, 100, 100];
  window.RIFT_AI_CHANCES = AI_CHANCES.slice();
  window.riftCanCharacterMove = function (ai) {
    const level = Math.max(0, Math.min(20, Math.floor(Number(ai) || 0)));
    return Math.random() * 100 < AI_CHANCES[level];
  };

  // Auxiliary companions follow Tannin; they are not independent hostile AI entries.
  window.RIFT_CHARACTER_GROUPS = Object.freeze({
    tannin: Object.freeze({ role: 'leader', companions: Object.freeze(['cosmo', 'transfer']), aliases: Object.freeze({ transfer: Object.freeze(['移交', '一脚']) }) })
  });

  window.RIFT_CHARACTER_ROSTER = roster.slice();
  window.RIFT_MAX_AI_LEVEL = MAX_AI;
})();
