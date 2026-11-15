/*
 * Rift Ash - Night 6 one-shot mutation events.
 * 仅负责第六夜的顶部文字演出与一次性攻击事件分发。
 */
(() => {
  'use strict';

  let activeNight = 0;
  let sequenceToken = 0;
  let locked = false;
  const triggered = new Set();
  let testRunToken = 0;

  function ensureOverlay() {
    let el = document.getElementById('night-six-mutation-text');
    if (!el) {
      const game = document.getElementById('game');
      if (!game) return null;
      el = document.createElement('div');
      el.id = 'night-six-mutation-text';
      el.setAttribute('aria-live', 'polite');
      game.appendChild(el);
    }
    return el;
  }

  function hideOverlay() {
    sequenceToken++;
    const el = document.getElementById('night-six-mutation-text');
    if (el) {
      el.classList.remove('show', 'glitch');
      el.replaceChildren();
    }
  }

  async function showSequence(eventData) {
    const el = ensureOverlay();
    if (!el || !eventData || !Array.isArray(eventData.lines)) return;
    const token = ++sequenceToken;
    el.replaceChildren();
    el.classList.remove('glitch');
    el.classList.add('show');

    const heading = document.createElement('div');
    heading.className = 'night-six-mutation-heading';
    heading.textContent = 'NIGHT 6 // ' + String(eventData.name || 'UNKNOWN') + ' — ' + String(eventData.title || 'MUTATION');
    el.appendChild(heading);

    for (const line of eventData.lines) {
      if (token !== sequenceToken || activeNight !== 6 || locked) return;
      const row = document.createElement('div');
      row.className = 'night-six-mutation-line';
      row.textContent = String(line);
      el.appendChild(row);
      el.classList.toggle('glitch', !!eventData.glitch);
      await new Promise(resolve => window.setTimeout(resolve, 1150));
    }

    if (token !== sequenceToken || activeNight !== 6) return;
    window.setTimeout(() => {
      if (token === sequenceToken) {
        el.classList.remove('show', 'glitch');
        el.replaceChildren();
      }
    }, 1800);
  }

  function lockOtherCharacters(reason) {
    locked = true;
    window.RIFT_NIGHT6_MUTATION_STATE = {
      night: 6,
      locked: true,
      reason: reason || 'eleven-awakens',
      triggered: Array.from(triggered)
    };
    hideOverlay();
    window.dispatchEvent(new CustomEvent('rift:night-six-others-return', {
      detail: { night: 6, locked: true, reason: reason || 'eleven-awakens' }
    }));
  }

  const extraTestSubtitles = {
    gildedEleven: { id: 'test-eleven', characterId: 'gildedEleven', name: '十一', title: '觉醒测试', glitch: true, lines: ['监控画面突然全部熄灭。', '其他人偶已经回到各自的初始位置。', '走廊深处，只有十一仍在移动。', '它抬起头，设施里的灯光逐盏熄灭。'] },
    flux: { id: 'test-flux', characterId: 'flux', name: '闪流', title: '新导演', glitch: true, lines: ['后台广播响起一段陌生的开场音乐。', '监控画面像舞台幕布一样缓缓拉开。', '闪流的声音从所有扬声器同时传来。', '“演出现在才正式开始。”'] }
  };

  async function playOneCharacterSubtitle(characterId) {
    const data = window.NIGHT_DATA && window.NIGHT_DATA[6];
    const items = data && data.nightSixMutations;
    const item = (Array.isArray(items) ? items.find(entry => entry.characterId === characterId) : null)
      || extraTestSubtitles[characterId];
    if (!item) return false;
    const runToken = ++testRunToken;
    activeNight = 6;
    locked = false;
    hideOverlay();
    await showSequence(item);
    return runToken === testRunToken;
  }

  async function testAllCharacterSubtitles() {
    const data = window.NIGHT_DATA && window.NIGHT_DATA[6];
    const items = data && Array.isArray(data.nightSixMutations) ? data.nightSixMutations.slice() : [];
    const all = [
      extraTestSubtitles.gildedEleven,
      extraTestSubtitles.flux,
      ...items
    ];
    const runToken = ++testRunToken;
    activeNight = 6;
    locked = false;
    triggered.clear();
    hideOverlay();
    for (const item of all) {
      if (runToken !== testRunToken) break;
      await showSequence(item);
      if (runToken !== testRunToken) break;
      await new Promise(resolve => window.setTimeout(resolve, item.lines.length * 1150 + 1900));
    }
    return true;
  }

  async function testAllSubtitles() {
    const runToken = ++testRunToken;
    activeNight = 6;
    locked = false;
    triggered.clear();
    hideOverlay();
    const data = window.NIGHT_DATA && window.NIGHT_DATA[6];
    const mutations = data && data.nightSixMutations;
    if (!Array.isArray(mutations) || !mutations.length) return false;
    for (const item of mutations) {
      if (runToken !== testRunToken || activeNight !== 6) break;
      await showSequence(item);
      await new Promise(resolve => window.setTimeout(resolve, item.lines.length * 1150 + 2100));
      if (runToken !== testRunToken) break;
    }
    return true;
  }

  window.RIFT_NIGHT6_MUTATION_TEST = Object.freeze({
    playAllSubtitles: testAllSubtitles,\n    playAllCharacterSubtitles: testAllCharacterSubtitles,\n    playCharacterSubtitle: playOneCharacterSubtitle,
    stop: () => { testRunToken++; hideOverlay(); }
  });

  window.addEventListener('rift:night-start', event => {
    activeNight = Number(event.detail && event.detail.night) || 0;
    locked = false;
    triggered.clear();
    hideOverlay();
    window.RIFT_NIGHT6_MUTATION_STATE = {
      night: activeNight,
      locked: false,
      triggered: []
    };
  });

  window.addEventListener('rift:night-special-time', event => {
    const detail = event.detail || {};
    if (activeNight !== 6 || Number(detail.night) !== 6) return;

    if (detail.id === 'all-return' || detail.id === 'eleven-awakens') {
      lockOtherCharacters(detail.id);
      return;
    }

    if (locked || !detail.mutationId || triggered.has(detail.mutationId)) return;
    const data = window.NIGHT_DATA && window.NIGHT_DATA[6];
    const mutations = data && data.nightSixMutations;
    const eventData = Array.isArray(mutations)
      ? mutations.find(item => item.id === detail.mutationId)
      : null;
    if (!eventData) return;

    triggered.add(detail.mutationId);
    window.RIFT_NIGHT6_MUTATION_STATE = {
      night: 6,
      locked: false,
      triggered: Array.from(triggered)
    };
    window.dispatchEvent(new CustomEvent('rift:night-six-mutation-attack', {
      detail: {
        night: 6,
        characterId: eventData.characterId,
        name: eventData.name,
        mutationId: eventData.id,
        oneShot: true
      }
    }));
    showSequence(eventData);
  });
})();
