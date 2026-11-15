/*
 * Rift Ash — Tannin companion presentation.
 * Cosmo and Transfer are auxiliary characters. Their CCTV locations are
 * supplied independently; this module does not force them into Tannin's room.
 */
(() => {
  'use strict';
  const defs = {
    cosmo: { name: '小宇宙', glyph: '✦', className: 'rift-tannin-companion-cosmo' },
    transfer: { name: '移交／一脚', glyph: '⌁', className: 'rift-tannin-companion-transfer' }
  };
  const visible = new Map();

  function hideCharacter(id) {
    document.querySelectorAll('[data-tannin-companion="' + id + '"]').forEach(el => {
      el.style.display = 'none';
    });
    visible.delete(id);
  }

  function place(detail) {
    if (!detail || !Object.prototype.hasOwnProperty.call(defs, detail.characterId)) return;
    const id = detail.characterId;
    const cam = Number(detail.camId);
    if (!Number.isInteger(cam) || cam < 1 || cam > 13) {
      hideCharacter(id);
      return;
    }
    hideCharacter(id);
    const feed = document.getElementById('feed-' + cam);
    if (!feed) return;
    const def = defs[id];
    let el = feed.querySelector('[data-tannin-companion="' + id + '"]');
    if (!el) {
      el = document.createElement('div');
      el.className = 'rift-tannin-companion ' + def.className;
      el.dataset.tanninCompanion = id;
      el.innerHTML = '<span class="glyph"></span><span class="name"></span>';
      feed.appendChild(el);
    }
    el.querySelector('.glyph').textContent = def.glyph;
    el.querySelector('.name').textContent = def.name + ' // 塔宁辅助';
    if (Number.isFinite(detail.x)) el.style.left = Math.max(0, Math.min(90, detail.x)) + '%';
    if (Number.isFinite(detail.y)) { el.style.bottom = Math.max(0, Math.min(90, detail.y)) + '%'; }
    el.style.display = 'flex';
    visible.set(id, cam);
  }

  // When Tannin changes rooms, the companions receive independent camera positions.
  // They are not pinned to Tannin's room and do not use separate hostile AI levels.
  function randomCamera() { return 1 + Math.floor(Math.random() * 13); }
  window.addEventListener('rift:tannin-node-change', event => {
    const detail = event.detail || {};
    if (detail.character !== 'tannin') return;
    if (!detail.node) {
      Object.keys(defs).forEach(hideCharacter);
      return;
    }
    for (const id of Object.keys(defs)) {
      place({
        characterId: id,
        camId: randomCamera(),
        x: 8 + Math.random() * 72,
        y: 6 + Math.random() * 24
      });
    }
  });

  window.addEventListener('rift:tannin-companion-position', event => place(event.detail || {}));
  window.addEventListener('rift:tannin-companion-hide', event => {
    const id = event.detail && event.detail.characterId;
    if (id && defs[id]) hideCharacter(id);
    else Object.keys(defs).forEach(hideCharacter);
  });
  window.addEventListener('rift:night-start', () => Object.keys(defs).forEach(hideCharacter));
  window.addEventListener('rift:night-six-others-return', () => Object.keys(defs).forEach(hideCharacter));

  window.RIFT_TANNIN_COMPANIONS = Object.freeze({
    getState: () => ({
      leader: 'tannin',
      companions: ['cosmo', 'transfer'],
      aliases: { transfer: ['移交', '一脚'] },
      positions: Object.fromEntries(visible)
    }),
    setPosition: (characterId, camId, x, y) => window.dispatchEvent(new CustomEvent('rift:tannin-companion-position', {
      detail: { characterId, camId, x, y }
    })),
    hide: characterId => window.dispatchEvent(new CustomEvent('rift:tannin-companion-hide', {
      detail: { characterId }
    }))
  });
})();
