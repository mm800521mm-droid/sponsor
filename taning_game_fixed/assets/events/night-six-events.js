/*
 * Rift Ash - Night 6 exclusive camera and system-alert presentation.
 * 所有十一摄像头异常效果只允许在第六夜触发；切换夜晚立即清理残留画面。
 */
(() => {
  'use strict';

  let arrivalToken = 0;
  let subtitleToken = 0;
  let activeNight = 0;

  function clearElevenCameraPresentation() {
    arrivalToken++;
    const deskScreen = document.querySelector('#btnCam .screen');
    if (deskScreen) {
      deskScreen.classList.remove('eleven-message', 'eleven-face');
      deskScreen.replaceChildren();
    }
  }

  function hideSystemAlert() {
    subtitleToken++;
    const subtitle = document.getElementById('system-alert-subtitle');
    if (subtitle) {
      subtitle.classList.remove('show');
      subtitle.replaceChildren();
    }
  }

  function resetNightSixPresentation() {
    clearElevenCameraPresentation();
    hideSystemAlert();
    if (window.RIFT_NIGHT6_API && typeof window.RIFT_NIGHT6_API.blackoutCameras === 'function') {
      window.RIFT_NIGHT6_API.blackoutCameras(false);
    }
  }

  function showElevenArrivalSequence() {
    const token = ++arrivalToken;
    const deskScreen = document.querySelector('#btnCam .screen');
    if (!deskScreen) return;
    deskScreen.classList.remove('eleven-message', 'eleven-face');
    deskScreen.replaceChildren();

    window.setTimeout(() => {
      if (token !== arrivalToken || activeNight !== 6) return;
      deskScreen.classList.add('eleven-message');
      deskScreen.innerHTML = '<div class="eleven-monitor-text">我想和你玩玩</div>';
    }, 2800);
    window.setTimeout(() => {
      if (token !== arrivalToken || activeNight !== 6) return;
      deskScreen.classList.remove('eleven-message');
      deskScreen.classList.add('eleven-face');
      deskScreen.innerHTML = '<div class="eleven-monitor-face"><div class="eleven-monitor-ears"></div><div class="eleven-monitor-head"><i class="eye left"></i><i class="eye right"></i><div class="muzzle"></div></div></div>';
    }, 5200);
  }

  async function showSystemAlertSubtitle(alertText) {
    if (!alertText || activeNight !== 6) return;
    const token = ++subtitleToken;
    let subtitle = document.getElementById('system-alert-subtitle');
    if (!subtitle) {
      subtitle = document.createElement('div');
      subtitle.id = 'system-alert-subtitle';
      const game = document.getElementById('game');
      if (!game) return;
      game.appendChild(subtitle);
    }
    subtitle.replaceChildren();
    subtitle.classList.add('show');
    const commandPattern = /\\[(red|glitch)\\]/g;
    const parts = String(alertText).split(commandPattern);
    let effects = [];
    for (const part of parts) {
      if (part === 'red' || part === 'glitch') {
        if (!effects.includes(part)) effects.push(part);
        continue;
      }
      for (const char of Array.from(part)) {
        if (token !== subtitleToken || activeNight !== 6) return;
        const span = document.createElement('span');
        span.textContent = char;
        span.className = effects.map(effect => 'tape-' + effect).join(' ');
        subtitle.appendChild(span);
        await new Promise(resolve => window.setTimeout(resolve, 24));
      }
    }
    window.setTimeout(() => {
      if (token !== subtitleToken || activeNight !== 6) return;
      subtitle.classList.remove('show');
    }, 4800);
  }

  window.addEventListener('rift:night-start', event => {
    activeNight = Number(event.detail && event.detail.night) || 0;
    // 无论进入哪一夜都清理上一夜残留；第六夜也从干净状态开始。
    resetNightSixPresentation();
  });

  window.addEventListener('rift:night-special-time', event => {
    const detail = event.detail || {};
    if (activeNight !== 6 || Number(detail.night) !== 6 || detail.id !== 'eleven-awakens') return;
    if (window.RIFT_NIGHT6_API && typeof window.RIFT_NIGHT6_API.blackoutCameras === 'function') {
      window.RIFT_NIGHT6_API.blackoutCameras(true);
    }
    showElevenArrivalSequence();
    const alertText = window.NIGHT_DATA && window.NIGHT_DATA[6] && window.NIGHT_DATA[6].systemAlert;
    showSystemAlertSubtitle(alertText);
  });
})();
