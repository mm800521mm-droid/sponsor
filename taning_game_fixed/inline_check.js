
(function () {
  'use strict';

  const loreContainer = document.getElementById('lore-container');
  if (loreContainer) {
    const floatingLoreTexts = [
      "当年剧团合伙人之一 —— 惨案幸存的主角",
      "遇害者之一，孩童形态的执念人偶",
      "前剧团安保，事发当晚在场，精神崩溃",
      "剧团技术总管，知道内情却被迫沉默"
    ];
    const lorePositions = ['lore-tr', 'lore-mt', 'lore-mr', 'lore-bl'];
    floatingLoreTexts.forEach((text, index) => {
      const el = document.createElement('div');
      el.className = `drifting-lore ${lorePositions[index % 4]}`;
      el.innerText = text;
      loreContainer.appendChild(el);
    });
  }

  const mainMenu = document.getElementById('main-menu');
  const menuNew = document.getElementById('menu-new');
  const menuCont = document.getElementById('menu-continue');
  const gameEl = document.getElementById('game');
  const scene = document.getElementById('scene');
  const dustContainer = document.getElementById('dustContainer');
  const btnCam = document.getElementById('btnCam');
  const cameraPanel = document.getElementById('camera-panel');
  const btnCamClose = document.getElementById('btnCamClose');
  const camTitle = document.getElementById('cam-title');
  const camFeedContainer = document.getElementById('cam-feed-container');
  const camBtns = document.querySelectorAll('.cam-btn');
  const camScenes = document.querySelectorAll('.cam-scene');
  const nightLabels = document.querySelectorAll('#nightLabel');
  const clockEls = document.querySelectorAll('#clock');
  const powerTexts = document.querySelectorAll('#powerText b');
  const usageBars = document.querySelectorAll('#usageBars i');
  const powerBoxes = document.querySelectorAll('#powerBox');
  const clearOverlay = document.getElementById('night-clear-overlay');
  const clearSubtitle = document.getElementById('clear-subtitle');
  const btnReturnMenu = document.getElementById('btnReturnMenu');
  const jumpscareOverlay = document.getElementById('jumpscare-overlay');

  const btnLookBack = document.getElementById('btnLookBack');
  const backView = document.getElementById('back-view');
  let isLookingBack = false;
  let lookBackTimer = 0;

  let currentView = 0, targetView = 0;
  let isCamOpen = false;
  let highestNight = 1;
  let currentTapePlayId = 0;
  let currentCamId = 1;

  const NIGHT_MS = 6 * 60 * 1000;
  const HOUR_MS = NIGHT_MS / 6;
  
  const S = { night: 1, elapsed: 0, hour: 0, power: 100, running: false, ended: false };
  const COST = { base: 0.09, door: 0.07, light: 0.05, cam: 0.06 };

  for (let i = 0; i < 30; i++) {
    let dust = document.createElement('div'); dust.className = 'dust';
    let size = 1 + Math.random() * 3;
    dust.style.width = size + 'px'; dust.style.height = size + 'px';
    dust.style.right = (10 + Math.random() * 50) + 'vw';
    dust.style.bottom = (-10 + Math.random() * 80) + 'vh';
    dust.style.animationDuration = (8 + Math.random() * 12) + 's';
    dust.style.animationDelay = (Math.random() * -20) + 's';
    dustContainer.appendChild(dust);
  }

  let audioCtx, noiseNode, gainNode, typeNoiseBuffer;
  
  function initAudio() {
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const bufferSize = audioCtx.sampleRate * 2;
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) { data[i] = Math.random() * 2 - 1; }
        noiseNode = audioCtx.createBufferSource(); noiseNode.buffer = buffer; noiseNode.loop = true;
        const filter = audioCtx.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 1200;
        gainNode = audioCtx.createGain(); gainNode.gain.value = 0.015;
        noiseNode.connect(filter); filter.connect(gainNode); gainNode.connect(audioCtx.destination); noiseNode.start();
        typeNoiseBuffer = audioCtx.createBuffer(1, audioCtx.sampleRate * 0.2, audioCtx.sampleRate);
        const typeData = typeNoiseBuffer.getChannelData(0);
        for (let i = 0; i < typeData.length; i++) { typeData[i] = Math.random() * 2 - 1; }
      }
      if (audioCtx.state === 'suspended') audioCtx.resume();
    } catch(e) { console.log(e); }
  }

  function playTypeSound() {
    if (!audioCtx || !typeNoiseBuffer) return;
    try {
      const source = audioCtx.createBufferSource(); source.buffer = typeNoiseBuffer;
      const filter = audioCtx.createBiquadFilter(); filter.type = 'bandpass'; filter.frequency.value = 2000 + Math.random() * 2000; filter.Q.value = 1.5;
      const gain = audioCtx.createGain(); const now = audioCtx.currentTime;
      gain.gain.setValueAtTime(0, now); gain.gain.linearRampToValueAtTime(0.3 + Math.random() * 0.3, now + 0.002); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      source.connect(filter); filter.connect(gain); gain.connect(audioCtx.destination); source.start(now); source.stop(now + 0.05);
    } catch(e) {}
  }

  function playDoorSound() {
    if (!audioCtx) return;
    try {
      const now = audioCtx.currentTime;
      const scratch = audioCtx.createBufferSource(); scratch.buffer = typeNoiseBuffer;
      const scratchFilter = audioCtx.createBiquadFilter(); scratchFilter.type = 'highpass'; scratchFilter.frequency.value = 1500;
      const scratchGain = audioCtx.createGain(); scratchGain.gain.setValueAtTime(0.1, now); scratchGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      scratch.connect(scratchFilter); scratchFilter.connect(scratchGain); scratchGain.connect(audioCtx.destination); scratch.start(now); scratch.stop(now + 0.25);

      const thud = audioCtx.createOscillator(); thud.type = 'sine'; thud.frequency.setValueAtTime(120, now + 0.2); thud.frequency.exponentialRampToValueAtTime(20, now + 0.5);
      const thudGain = audioCtx.createGain(); thudGain.gain.setValueAtTime(0, now + 0.2); thudGain.gain.linearRampToValueAtTime(0.6, now + 0.22); thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      thud.connect(thudGain); thudGain.connect(audioCtx.destination); thud.start(now + 0.2); thud.stop(now + 0.6);
    } catch(e) {}
  }

  function playLightSound(isOn) {
    if (!audioCtx) return;
    try {
      const now = audioCtx.currentTime;
      const clack = audioCtx.createBufferSource(); clack.buffer = typeNoiseBuffer;
      const clackFilter = audioCtx.createBiquadFilter(); clackFilter.type = 'bandpass'; clackFilter.frequency.value = 3000; clackFilter.Q.value = 1;
      const clackGain = audioCtx.createGain(); clackGain.gain.setValueAtTime(0.4, now); clackGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      clack.connect(clackFilter); clackFilter.connect(clackGain); clackGain.connect(audioCtx.destination); clack.start(now); clack.stop(now + 0.05);
      if (isOn) {
        const hum = audioCtx.createOscillator(); hum.type = 'sine'; hum.frequency.value = 60;
        const humGain = audioCtx.createGain(); humGain.gain.setValueAtTime(0.05, now + 0.05); humGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        hum.connect(humGain); humGain.connect(audioCtx.destination); hum.start(now + 0.05); hum.stop(now + 0.4);
      }
    } catch(e) {}
  }

  function playMonitorSound(isOpen) {
    if (!audioCtx) return;
    try {
      const now = audioCtx.currentTime;
      const clickOsc = audioCtx.createOscillator(); clickOsc.type = 'square'; clickOsc.frequency.value = 1200;
      const clickGain = audioCtx.createGain(); clickGain.gain.setValueAtTime(0.15, now); clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
      clickOsc.connect(clickGain); clickGain.connect(audioCtx.destination); clickOsc.start(now); clickOsc.stop(now + 0.03);
    } catch(e) {}
  }

  function playCamSwitchSound() {
    if (!audioCtx) return;
    try {
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator(); osc.type = 'sine'; osc.frequency.setValueAtTime(1500, now);
      const gain = audioCtx.createGain(); gain.gain.setValueAtTime(0, now); gain.gain.linearRampToValueAtTime(0.08, now + 0.01); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.connect(gain); gain.connect(audioCtx.destination); osc.start(now); osc.stop(now + 0.1);
    } catch(e) {}
  }

  function playWinSound() {
    if (!audioCtx) return;
    try {
      const now = audioCtx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, i) => {
        const osc = audioCtx.createOscillator(); osc.type = 'triangle'; osc.frequency.value = freq;
        const gain = audioCtx.createGain(); gain.gain.setValueAtTime(0, now + i * 0.15); gain.gain.linearRampToValueAtTime(0.2, now + i * 0.15 + 0.05); gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 1.5);
        osc.connect(gain); gain.connect(audioCtx.destination); osc.start(now + i * 0.15); osc.stop(now + i * 0.15 + 1.5);
      });
    } catch(e) {}
  }

  function playFootstepSound(type) {
    if (!audioCtx) return;
    try {
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator(); 
      osc.type = 'sine'; 
      
      let startFreq = 50;
      let volume = 0.3;
      let duration = 0.3;
      
      if (type === 'distant') { startFreq = 40; volume = 0.2; duration = 0.2; }
      else if (type === 'close') { startFreq = 60; volume = 0.5; duration = 0.4; }
      else if (type === 'charge') { startFreq = 100; volume = 0.9; duration = 0.5; }
      
      osc.frequency.setValueAtTime(startFreq, now);
      osc.frequency.exponentialRampToValueAtTime(10, now + duration);
      
      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
      
      osc.connect(gain); gain.connect(audioCtx.destination);
      osc.start(now); osc.stop(now + duration);
    } catch(e) {}
  }

  function triggerJumpscare(name, quote) {
    if (S.ended) return;
    S.ended = true;
    S.running = false;
    releaseAllLights();
    if (isCamOpen) {
      isCamOpen = false;
      cameraPanel.classList.remove('show');
    }
    jumpscareOverlay.classList.add('show');
    
    if (audioCtx) {
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator(); osc.type = 'sawtooth'; osc.frequency.setValueAtTime(1000, now); osc.frequency.exponentialRampToValueAtTime(100, now + 1.5);
      const gain = audioCtx.createGain(); gain.gain.setValueAtTime(1, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 1.5);
      osc.connect(gain); gain.connect(audioCtx.destination); osc.start(now); osc.stop(now + 1.5);
    }

    setTimeout(() => {
      jumpscareOverlay.classList.remove('show');
      alert(name + " 抓住了你！\n\n“" + quote + "”");
      location.reload(); 
    }, 2000);
  }

  const GameContext = {
    getNight: () => S.night,
    isGameRunning: () => S.running && !S.ended,
    isPlayerLookingAt: (dir) => (dir === 'L' && Math.abs(currentView + 1) < 0.16) || (dir === 'R' && Math.abs(currentView - 1) < 0.16),
    isLightOn: (dir) => (dir === 'L' ? btnLlight : btnRlight).classList.contains('on'),
    isDoorClosed: (dir) => dir === 'L' ? dL : dR,
    isWatchingCam: (camId) => isCamOpen && currentCamId === camId,
    playFootstep: playFootstepSound,
    triggerJumpscare: triggerJumpscare,
    dom: {
      taningCam5: document.getElementById('taning-cam5'),
      taningCam4: document.getElementById('taning-cam4'),
      taningCam3: document.getElementById('taning-cam3'),
      taningL: document.getElementById('taningL'),
      taningR: document.getElementById('taningR'),
      flashL: document.getElementById('flashL'),
      flashR: document.getElementById('flashR')
    }
  };

  async function playTape(tapeLines, audioFile) {
    if (!tapeLines || tapeLines.length === 0) return;
    const tapeUi = document.getElementById('tape-ui');
    const tapeSub = document.getElementById('tape-sub');
    const tapeStatus = document.getElementById('tape-status');
    const tapeAudio = document.getElementById('tape-audio');
    const myPlayId = ++currentTapePlayId;

    // 每次播放前停止上一段录音，避免跨夜串音。
    tapeAudio.pause();
    tapeAudio.removeAttribute('src');
    tapeAudio.load();
    tapeSub.replaceChildren();
    tapeSub.classList.remove('tape-box-glitch');
    tapeSub.style.opacity = '1';
    tapeUi.style.display = 'flex';
    tapeStatus.textContent = 'LOADING TAPE...';

    // 有录音文件就播放；文件不存在、格式不支持或自动播放被拦截时，
    // 自动退回纯字幕模式，不影响夜晚开始。
    let hasAudio = false;
    if (audioFile) {
      hasAudio = await new Promise(resolve => {
        let settled = false;
        const finish = value => {
          if (settled) return;
          settled = true;
          clearTimeout(timeoutId);
          tapeAudio.removeEventListener('error', onError);
          resolve(value);
        };
        const onError = () => finish(false);
        const timeoutId = setTimeout(() => finish(false), 4000);
        tapeAudio.addEventListener('error', onError, { once: true });
        tapeAudio.src = audioFile;
        tapeAudio.load();
        try {
          Promise.resolve(tapeAudio.play()).then(() => finish(true)).catch(() => finish(false));
        } catch (err) {
          finish(false);
        }
      });
    }

    if (myPlayId !== currentTapePlayId) {
      tapeAudio.pause();
      return;
    }

    tapeStatus.textContent = hasAudio ? 'PLAYING TAPE...' : 'SUBTITLE TRANSCRIPT';

    // 计算可见字符数，控制符本身不计入音频字幕速度。
    const commandPattern = /(\*\d+(?:\.\d+)?|\/|\[(?:red|cyan|yellow|gray|white|shake|glitch|blink|big|fade|normal|boxglitch|speed=\d+(?:\.\d+)?)\])/g;
    const visibleText = tapeLines.map(line => String(line).replace(commandPattern, '')).join('');
    const totalChars = Math.max(1, Array.from(visibleText).length);
    const audioCharDelay = hasAudio && Number.isFinite(tapeAudio.duration) && tapeAudio.duration > 0
      ? Math.max(25, Math.min(160, tapeAudio.duration * 1000 / totalChars)) : 35;

    const punctuation = '，。！？；：,.!?;:……';
    const supportedEffects = ['red', 'cyan', 'yellow', 'gray', 'white', 'shake', 'glitch', 'blink', 'big', 'fade'];

    const waitFor = ms => new Promise(resolve => setTimeout(resolve, Math.max(0, ms)));
    const stillPlaying = () => S.running && myPlayId === currentTapePlayId;

    function appendTapeChar(char, effects) {
      const span = document.createElement('span');
      span.className = 'tape-char';
      effects.forEach(effect => span.classList.add('tape-' + effect));
      span.textContent = char;
      tapeSub.appendChild(span);
    }

    for (let lineIndex = 0; lineIndex < tapeLines.length; lineIndex++) {
      if (!stillPlaying()) break;

      const line = String(tapeLines[lineIndex]);
      tapeSub.replaceChildren();
      tapeSub.classList.remove('tape-box-glitch');
      tapeSub.style.opacity = '1';

      const state = { effects: [], speed: hasAudio ? audioCharDelay : 35 };
      const tokens = line.split(commandPattern);

      for (const token of tokens) {
        if (!stillPlaying()) break;
        if (!token) continue;

        // /：在当前字幕中换行。
        if (token === '/') {
          tapeSub.appendChild(document.createElement('br'));
          continue;
        }

        // *5 或 *1.5：暂停指定秒数。
        if (/^\*\d+(?:\.\d+)?$/.test(token)) {
          await waitFor(Number(token.slice(1)) * 1000);
          if (!stillPlaying()) break;
          continue;
        }

        // [特效]：设置后续文字的效果。
        if (token.startsWith('[') && token.endsWith(']')) {
          const command = token.slice(1, -1);

          if (command === 'normal') {
            state.effects = [];
            state.speed = hasAudio ? audioCharDelay : 35;
            tapeSub.classList.remove('tape-box-glitch');
          } else if (command === 'boxglitch') {
            tapeSub.classList.add('tape-box-glitch');
          } else if (command.startsWith('speed=')) {
            const newSpeed = Number(command.slice(6));
            if (Number.isFinite(newSpeed)) state.speed = Math.max(0, newSpeed);
          } else if (supportedEffects.includes(command) && !state.effects.includes(command)) {
            state.effects.push(command);
          }
          continue;
        }

        // 普通文字逐字显示；特效只作用于控制符之后的字符。
        for (const char of Array.from(token)) {
          if (!stillPlaying()) break;
          appendTapeChar(char, state.effects);

          if (!hasAudio && char !== ' ' && !punctuation.includes(char)) {
            playTypeSound();
          }

          const delay = punctuation.includes(char)
            ? (hasAudio ? Math.max(120, audioCharDelay) : 180)
            : state.speed;
          await waitFor(delay);
        }
      }

      if (!stillPlaying()) break;

      // 一行结束后稍作停留，再淡出进入下一行。
      const visibleLineLength = Array.from(line.replace(commandPattern, '')).length;
      await waitFor(hasAudio ? 250 : 900 + visibleLineLength * 45);
      if (!stillPlaying()) break;

      tapeSub.style.opacity = '0';
      await waitFor(350);
    }

    if (myPlayId === currentTapePlayId) {
      tapeSub.classList.remove('tape-box-glitch');
      tapeUi.style.display = 'none';
      tapeSub.style.opacity = '0';
      // 若录音比字幕略长，让录音自然播完；下一夜开始时再统一停止。
    }
  }

  const camNames = ["SECURITY ROOM", "MAIN STAGE", "CORRIDOR A", "CORRIDOR B", "STORAGE ROOM", "STAFF LOUNGE", "LOADING YARD", "REPAIR WORKSHOP", "ARCHIVE ROOM", "GEAR PASSAGE", "MANAGER OFFICE", "PROP CUBICLE", "ISOLATION BAY", "FINAL ROOM [LOCKED]"];

  function switchCam(camId) {
    const id = String(camId);
    const numericId = Number.parseInt(id, 10);
    if (!Number.isFinite(numericId)) return;
    const feed = document.getElementById('feed-' + id);
    if (!feed) return;
    playCamSwitchSound();
    currentCamId = numericId;
    camBtns.forEach(b => b.classList.toggle('on', b.dataset.cam === id));
    camScenes.forEach(s => s.classList.remove('active'));
    feed.classList.add('active');
    camTitle.innerText = `CAM ${id.padStart(2, '0')} - ${camNames[numericId - 1] || 'UNKNOWN'}`;
    camFeedContainer.classList.add('switching');
    setTimeout(() => camFeedContainer.classList.remove('switching'), 200);
  }

  camBtns.forEach(btn => {
    btn.onclick = function() {
      if (!S.running) return;
      let camId = this.dataset.cam;
      if (camId == 14) {
        switchCam(14);
        document.getElementById('feed-14').innerHTML = '<div style="color:#f00;font-size:2vw;font-weight:bold;letter-spacing:0.2em;">CAMERA DISABLED</div>';
        return;
      }
      switchCam(camId);
    };
  });

  function toggleMonitor() {
    if (!S.running) return;
    if (isLookingBack) return; 
    isCamOpen = !isCamOpen;
    playMonitorSound(isCamOpen);
    if (isCamOpen) {
      cameraPanel.classList.add('show');
      targetView = 0; 
    } else {
      cameraPanel.classList.remove('show');
    }
  }

  btnCam.onclick = toggleMonitor;
  btnCamClose.onclick = toggleMonitor;

  function applyView(dt = 1 / 60) {
    if (!isCamOpen && !isLookingBack) {
      const blend = 1 - Math.exp(-12 * Math.max(0, dt));
      currentView += (targetView - currentView) * blend;
      if (Math.abs(targetView - currentView) < 0.001) currentView = targetView;
      const tx = -33.3333 * (1 + currentView);
      scene.style.transform = 'translateX(' + tx.toFixed(3) + '%)';
    }
  }

  const clickLeft = document.getElementById('clickLeft');
  const clickRight = document.getElementById('clickRight');

  function changeView(dir) {
    if (!S.running || isCamOpen || isLookingBack) return;
    targetView = Math.max(-1, Math.min(1, targetView + dir));
  }

  clickLeft.addEventListener('click', (e) => { e.stopPropagation(); changeView(-1); });
  clickRight.addEventListener('click', (e) => { e.stopPropagation(); changeView(1); });

  function toggleLookBack() {
    if (!S.running || isCamOpen) return;
    if (!isLookingBack && targetView !== 0) return;
    isLookingBack = !isLookingBack;
    if (isLookingBack) { backView.classList.add('show'); lookBackTimer = 3.0; backView.classList.remove('warning'); }
    else backView.classList.remove('show', 'warning');
  }

  btnLookBack.addEventListener('click', (e) => { e.stopPropagation(); toggleLookBack(); });
  backView.addEventListener('click', () => { if (isLookingBack) toggleLookBack(); });

  window.onkeydown = function(e) {
    if (!S.running) return;
    let k = e.key.toLowerCase();
    if (k === 'c' || k === ' ') { e.preventDefault(); toggleMonitor(); return; }
    if (k === 'w' || k === 'arrowup') { e.preventDefault(); toggleLookBack(); return; }
    if (isCamOpen || isLookingBack) return;
    if (k === 'a' || k === 'arrowleft') { e.preventDefault(); changeView(-1); return; }
    if (k === 'd' || k === 'arrowright') { e.preventDefault(); changeView(1); return; }
    if (k === 's' || k === 'arrowdown') { e.preventDefault(); targetView = 0; return; }
  };

  const doorwayL = document.getElementById('doorwayL');
  const doorwayR = document.getElementById('doorwayR');
  const btnLdoor = document.getElementById('btnLdoor');
  const btnRdoor = document.getElementById('btnRdoor');
  const btnLlight = document.getElementById('btnLlight');
  const btnRlight = document.getElementById('btnRlight');
  
  let dL = false, dR = false;

  btnLdoor.onclick = function(e) { e.stopPropagation(); if (isLookingBack) return; dL = !dL; this.classList.toggle('on', dL); doorwayL.classList.toggle('closed', dL); playDoorSound(); };
  btnRdoor.onclick = function(e) { e.stopPropagation(); if (isLookingBack) return; dR = !dR; this.classList.toggle('on', dR); doorwayR.classList.toggle('closed', dR); playDoorSound(); };

  function turnOnLight(button, doorway, e) {
    if (e) e.preventDefault();
    if (!S.running || isCamOpen || isLookingBack || button.classList.contains('on')) return;
    button.classList.add('on');
    doorway.classList.add('lit');
    playLightSound(true);
    try { if (e && e.pointerId !== undefined) button.setPointerCapture(e.pointerId); } catch (_) {}
  }
  function turnOffLight(button, doorway, e) {
    if (e && e.preventDefault) e.preventDefault();
    button.classList.remove('on');
    doorway.classList.remove('lit');
  }
  const releaseAllLights = () => {
    turnOffLight(btnLlight, doorwayL);
    turnOffLight(btnRlight, doorwayR);
  };
  btnLlight.addEventListener('pointerdown', e => turnOnLight(btnLlight, doorwayL, e));
  btnLlight.addEventListener('pointerup', e => turnOffLight(btnLlight, doorwayL, e));
  btnLlight.addEventListener('pointercancel', e => turnOffLight(btnLlight, doorwayL, e));
  btnRlight.addEventListener('pointerdown', e => turnOnLight(btnRlight, doorwayR, e));
  btnRlight.addEventListener('pointerup', e => turnOffLight(btnRlight, doorwayR, e));
  btnRlight.addEventListener('pointercancel', e => turnOffLight(btnRlight, doorwayR, e));
  window.addEventListener('pointerup', releaseAllLights);
  window.addEventListener('blur', releaseAllLights);
  document.addEventListener('visibilitychange', () => { if (document.hidden) releaseAllLights(); });

  function updateUI() {
    let hourStr = S.hour === 0 ? '12 AM' : S.hour + ' AM';
    clockEls.forEach(el => el.innerText = hourStr);
    let powerPercent = Math.ceil(S.power);
    powerTexts.forEach(el => el.innerText = powerPercent + '%');
    powerBoxes.forEach(el => el.classList.toggle('low', S.power <= 20));
    
    let usage = COST.base;
    if (dL) usage += COST.door;
    if (dR) usage += COST.door;
    if (btnLlight.classList.contains('on')) usage += COST.light;
    if (btnRlight.classList.contains('on')) usage += COST.light;
    if (isCamOpen) usage += COST.cam;
    
    let usageLevel = Math.max(1, Math.min(5, Math.round(usage / 0.08)));
    usageBars.forEach((bar, index) => { bar.classList.toggle('on', index < usageLevel); });
  }

  let lastTime = performance.now();
  let rafHandle = 0;
  function gameLoop(now) {
    let dt = Math.max(0, (now - lastTime) / 1000);
    lastTime = now;
    if (dt > 0.1) dt = 0.1;

    if (S.running) {
      S.elapsed += dt * 1000;
      let currentHour = Math.min(6, Math.floor(S.elapsed / HOUR_MS));
      if (currentHour !== S.hour) {
        S.hour = currentHour;
        if (S.hour === 6) {
          S.running = false;
          releaseAllLights();
          playWinSound();
          if (S.night >= highestNight) highestNight = S.night + 1;
          clearSubtitle.innerText = `NIGHT ${S.night} COMPLETE`;
          clearOverlay.classList.add('show');
        }
      }

      if (S.running) {
        let usage = COST.base;
        if (dL) usage += COST.door;
        if (dR) usage += COST.door;
        if (btnLlight.classList.contains('on')) usage += COST.light;
        if (btnRlight.classList.contains('on')) usage += COST.light;
        if (isCamOpen) usage += COST.cam;

        S.power = Math.max(0, S.power - usage * dt);
        if (S.power <= 0) {
          S.running = false;
          releaseAllLights();
          if (isCamOpen) {
            isCamOpen = false;
            cameraPanel.classList.remove('show');
          }
          document.getElementById('tape-ui').style.display = 'none';
          document.getElementById('tape-sub').style.opacity = '0';
          clearSubtitle.innerText = 'POWER OUT';
          clearOverlay.classList.add('show');
        }
      }

      if (S.running) {
        if (isLookingBack) {
          lookBackTimer -= dt;
          if (lookBackTimer <= 0 && !backView.classList.contains('warning')) backView.classList.add('warning');
        }
        if (typeof taning !== 'undefined') {
          try { taning.update(dt, GameContext); } catch (e) { console.error('Taning AI update failed:', e); }
        }
      }
      updateUI();
    }

    applyView(dt);
    rafHandle = requestAnimationFrame(gameLoop);
  }

  function startNight(nightNum) {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    currentTapePlayId++;
    const tapeAudio = document.getElementById('tape-audio');
    if (tapeAudio) { tapeAudio.pause(); tapeAudio.removeAttribute('src'); tapeAudio.load(); }
    document.getElementById('tape-ui').style.display = 'none';
    document.getElementById('tape-sub').style.opacity = '0';
    document.getElementById('tape-sub').textContent = '';
    
    clearOverlay.classList.remove('show');
    backView.classList.remove('show', 'warning');
    jumpscareOverlay.classList.remove('show');
    isLookingBack = false;
    releaseAllLights();
    
    S.night = nightNum;
    S.elapsed = 0;
    S.hour = 0;
    S.power = 100;
    S.running = true;
    S.ended = false;
    
    dL = false; dR = false;
    doorwayL.classList.remove('closed'); doorwayR.classList.remove('closed');
    btnLdoor.classList.remove('on'); btnRdoor.classList.remove('on');
    btnLlight.classList.remove('on'); btnRlight.classList.remove('on');
    doorwayL.classList.remove('lit'); doorwayR.classList.remove('lit');
    if (isCamOpen) {
      isCamOpen = false;
      cameraPanel.classList.remove('show');
    }
    
    currentView = 0; targetView = 0;
    currentCamId = 1;
    switchCam(1);
    scene.style.transform = 'translateX(-33.3333%)';

    let currentNightData = null;
    // 最稳妥的获取方式，直接读取变量，不依赖 window 对象
    const nightDataSource = window.NIGHT_DATA;
    if (nightDataSource && nightDataSource[nightNum]) {
      currentNightData = nightDataSource[nightNum];
    } else {
      console.error('[电话系统] 未找到 NIGHT_DATA[' + nightNum + ']。请检查 ./data.js 是否成功加载。', nightDataSource);
      currentNightData = { nightName: 'NIGHT ' + nightNum, tape: ["（系统提示：电话字幕数据未加载，请检查 data.js 文件及其路径。）"] };
    }
    
    let nightTitle = currentNightData.nightName;
    nightLabels.forEach(el => el.innerText = nightTitle);
    
    if (typeof taning !== 'undefined') {
        try { taning.reset(GameContext); } catch(e) {}
    }
    
    updateUI();

    if (currentNightData.tape && currentNightData.tape.length > 0) {
      playTape(currentNightData.tape, currentNightData.audioFile || `audio/Night_Video_${nightNum}.mp3`);
    }

    lastTime = performance.now();
  }

  btnReturnMenu.onclick = function() { location.reload(); };

  if (highestNight > 1) {
    menuCont.classList.remove('disabled');
    menuCont.innerText = `继续（第 ${highestNight} 夜）`;
    menuCont.onclick = function() {
      mainMenu.style.display = 'none'; gameEl.style.display = 'block'; initAudio(); startNight(highestNight);
    };
  }

  menuNew.onclick = function() { mainMenu.style.display = 'none'; gameEl.style.display = 'block'; initAudio(); startNight(1); };

  const debugBtns = document.querySelectorAll('.debug-btn');
  debugBtns.forEach(btn => {
    btn.onclick = function() {
      if (mainMenu.style.display !== 'none') return; 
      initAudio(); 
      startNight(parseInt(this.dataset.night));
    };
  });

  requestAnimationFrame(gameLoop);

})();
