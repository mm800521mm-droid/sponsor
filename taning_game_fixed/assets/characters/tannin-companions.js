/*
 * Rift Ash — Tannin companion presentation.
 * Companions mirror Tannin's current CCTV room; they do not run independent AI.
 */
(() => {
  'use strict';
  const companionDefs = [
    { id: 'cosmo', name: '小宇宙', glyph: '✦', className: 'rift-tannin-companion-cosmo' }
  ];
  const feeds = ['feed-3','feed-4','feed-5'];
  let currentNode = null;

  function hideAll() {
    feeds.forEach(id => {
      const feed = document.getElementById(id);
      if (!feed) return;
      feed.querySelectorAll('[data-tannin-companion]').forEach(el => { el.style.display = 'none'; });
    });
  }

  function render(detail) {
    currentNode = detail && detail.node || null;
    hideAll();
    const cam = currentNode === 'cam3' ? 3 : currentNode === 'cam4' ? 4 : currentNode === 'cam5' ? 5 : 0;
    if (!cam) return;
    const feed = document.getElementById('feed-' + cam);
    if (!feed) return;
    companionDefs.forEach(def => {
      let el = feed.querySelector('[data-tannin-companion="' + def.id + '"]');
      if (!el) {
        el = document.createElement('div');
        el.className = 'rift-tannin-companion ' + def.className;
        el.dataset.tanninCompanion = def.id;
        el.innerHTML = '<span class="glyph"></span><span class="name"></span>';
        feed.appendChild(el);
      }
      el.querySelector('.glyph').textContent = def.glyph;
      el.querySelector('.name').textContent = def.name + ' // 随行';
      el.style.display = 'flex';
    });
  }

  window.addEventListener('rift:tannin-node-change', event => render(event.detail || {}));
  window.addEventListener('rift:night-start', () => { currentNode = null; hideAll(); });
  window.addEventListener('rift:night-six-others-return', () => { currentNode = null; hideAll(); });
  window.RIFT_TANNIN_COMPANIONS = Object.freeze({
    getState: () => ({ leader: 'tannin', node: currentNode, companions: ['cosmo'], pendingIdentity: ['一脚'] })
  });
})();