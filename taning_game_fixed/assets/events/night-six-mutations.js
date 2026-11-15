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
