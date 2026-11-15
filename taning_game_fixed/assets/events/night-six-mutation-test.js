/* Night 6 subtitle-only test controls. No attack or gameplay state is triggered. */
(() => {
  'use strict';
  const controls = document.getElementById('rift-test-controls');
  if (!controls || document.getElementById('test-night-six-subtitles')) return;

  const play = document.createElement('button');
  play.id = 'test-night-six-subtitles';
  play.type = 'button';
  play.textContent = '测试第六夜七段字幕';
  play.style.cssText = 'padding:5px 8px;background:#542020;color:#fff;border:1px solid #b66;cursor:pointer;';

  const stop = document.createElement('button');
  stop.id = 'stop-night-six-subtitles';
  stop.type = 'button';
  stop.textContent = '停止测试';
  stop.style.cssText = 'padding:5px 8px;background:#292929;color:#eee;border:1px solid #777;cursor:pointer;';

  play.addEventListener('click', async () => {
    const api = window.RIFT_NIGHT6_MUTATION_TEST;
    if (!api || typeof api.playAllSubtitles !== 'function') {
      play.textContent = '字幕模块未加载';
      return;
    }
    play.disabled = true;
    play.textContent = '字幕测试播放中…';
    try {
      await api.playAllSubtitles();
      play.textContent = '测试第六夜七段字幕';
    } catch (error) {
      console.error('[Night 6 subtitle test]', error);
      play.textContent = '测试失败（查看控制台）';
    } finally {
      play.disabled = false;
    }
  });

  stop.addEventListener('click', () => {
    const api = window.RIFT_NIGHT6_MUTATION_TEST;
    if (api && typeof api.stop === 'function') api.stop();
    const playButton = document.getElementById('test-night-six-subtitles');
    if (playButton) {
      playButton.disabled = false;
      playButton.textContent = '测试第六夜七段字幕';
    }
  });

  controls.append(play, stop);
})();
