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

  // Companions have their own harmless, independent CCTV appearances.
  // Their schedule is presentation-only and is deliberately unrelated to AI levels.
  const schedule = {
    cosmo: { wait: 0, visible: 0 },
    transfer: { wait: 0, visible: 0 }
  };
  let locked = false;
  function randomCamera() { return 1 + Math.floor(Math.random() * 13); }
  function scheduleNext(id) { schedule[id].wait = 14 + Math.random() * 18; }
  function appear(id) {
    const camId = randomCamera();
    place({characterId:id,camId,x:8+Math.random()*72,y:6+Math.random()*24});
    schedule[id].visible = 5 + Math.random() * 7;
  }
  window.addEventListener('rift:game-frame', event => {
    const d = event.detail || {};
    if (locked || !d.running) return;
    const dt = Math.min(.1, Math.max(0, Number(d.dt) || 0));
    for (const id of Object.keys(schedule)) {
      const item = schedule[id];
      if (item.visible > 0) {
        item.visible -= dt;
        if (item.visible <= 0) { hideCharacter(id); scheduleNext(id); }
      } else {
        item.wait -= dt;
        if (item.wait <= 0) appear(id);
      }
    }
  });

  window.addEventListener('rift:tannin-companion-position', event => place(event.detail || {}));
  window.addEventListener('rift:tannin-companion-hide', event => {
    const id = event.detail && event.detail.characterId;
    if (id && defs[id]) hideCharacter(id);
    else Object.keys(defs).forEach(hideCharacter);
  });
  window.addEventListener('rift:night-start', () => { locked=false; Object.keys(defs).forEach(id=>{hideCharacter(id);scheduleNext(id);schedule[id].visible=0;}); });
  window.addEventListener('rift:night-six-others-return', () => { locked=true; Object.keys(defs).forEach(id=>{hideCharacter(id);schedule[id].visible=0;}); });

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
