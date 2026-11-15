/*
 * Rift Ash - Night 6 special-time presentation
 * 第六夜的专属演出放在独立模块，避免继续堆进 index.html。
 */
(() => {
  'use strict';

  let arrivalToken = 0;
  let subtitleToken = 0;

  function showElevenArrivalSequence() {
    const token = ++arrivalToken;
    const deskScreen = document.querySelector('#btnCam .screen');
    if (!deskScreen) return;
    deskScreen.classList.remove('eleven-message', 'eleven-face');
    deskScreen.innerHTML = '';

    window.setTimeout(() => {
      if (token !== arrivalToken) return;
      deskScreen.classList.add('eleven-message');
      deskScreen.innerHTML = '<div class="eleven-monitor-text">我想和你玩玩</div>';
    }, 2800);
    window.setTimeout(() => {
      if (token !== arrivalToken) return;
      deskScreen.classList.remove('eleven-message');
      deskScreen.classList.add('eleven-face');
      deskScreen.innerHTML = '<div class="eleven-monitor-face"><div class="eleven-monitor-ears"></div><div class="eleven-monitor-head"><i class="eye left"></i><i class="eye right"></i><div class="muzzle"></div></div></div>';
    }, 5200);
  }

  async function showSystemAlertSubtitle(alertText) {
    if (!alertText) return;
    const token = ++subtitleToken;
    let subtitle = document.getElementById('system-alert-subtitle');
    if (!subtitle) {
      subtitle = document.createElement('div');
      subtitle.id = 'system-alert-subtitle';
      document.getElementById('game').appendChild(subtitle);
    }
    subtitle.replaceChildren();
    subtitle.classList.add('show');
    const commandPattern = /\[(red|glitch)\]/g;
    const parts = String(alertText).split(commandPattern);
    let effects = [];
    for (const part of parts) {
      if (part === 'red' || part === 'glitch') {
        if (!effects.includes(part)) effects.push(part);
        continue;
      }
      for (const char of Array.from(part)) {
        if (token !== subtitleToken) return;
        const span = document.createElement('span');
        span.textContent = char;
        span.className = effects.map(effect => 'tape-' + effect).join(' ');
        subtitle.appendChild(span);
        await new Promise(resolve => window.setTimeout(resolve, 24));
      }
    }
    window.setTimeout(() => {
      if (token !== subtitleToken) return;
      subtitle.classList.remove('show');
    }, 4800);
  }

  window.addEventListener('rift:night-special-time', event => {
    const detail = event.detail || {};
    if (Number(detail.night) !== 6 || detail.id !== 'eleven-awakens') return;
    if (window.RIFT_NIGHT6_API && typeof window.RIFT_NIGHT6_API.blackoutCameras === 'function') {
      window.RIFT_NIGHT6_API.blackoutCameras(true);
    }
    showElevenArrivalSequence();
    const alertText = window.NIGHT_DATA && window.NIGHT_DATA[6] && window.NIGHT_DATA[6].systemAlert;
    showSystemAlertSubtitle(alertText);
  });
})();
