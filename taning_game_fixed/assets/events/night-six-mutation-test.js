/* Night 6 all-character subtitle preview. Preview only; it never triggers attacks. */
(() => {
  'use strict';
  const controls = document.getElementById('rift-test-controls');
  if (!controls || document.getElementById('test-all-character-subtitles')) return;

  const makeButton = (id, label, action) => {
    const button = document.createElement('button');
    button.id = id;
    button.type = 'button';
    button.textContent = label;
    button.style.cssText = 'padding:5px 8px;background:#542020;color:#fff;border:1px solid #b66;cursor:pointer;white-space:nowrap;';
    button.addEventListener('click', async () => {
      const api = window.RIFT_NIGHT6_MUTATION_TEST;
      if (!api) { button.textContent = '字幕模块未加载'; return; }
      button.disabled = true;
      try { await action(api); }
      catch (error) { console.error('[Night 6 all-character subtitle test]', error); }
      finally { button.disabled = false; }
    });
    return button;
  };

  const all = makeButton('test-all-character-subtitles', '测试全员字幕（9人）', api => api.playAllCharacterSubtitles());
  all.style.background = '#754019';
  controls.appendChild(all);

  const entries = [
    ['gildedEleven', '十一'], ['flux', '闪流'], ['noka', '诺卡'],
    ['tannin', '塔宁'], ['lobe', '耳机'], ['gu', '孤'],
    ['chillo', '寒零'], ['cosmo', '小宇宙'], ['transfer', '移交']
  ];
  const group = document.createElement('div');
  group.style.cssText = 'position:fixed;top:82px;left:50%;transform:translateX(-50%);z-index:100001;display:flex;flex-wrap:wrap;justify-content:center;gap:5px;max-width:96vw;padding:6px;background:rgba(0,0,0,.88);border:1px solid #806b45;';
  for (const [id, name] of entries) {
    group.appendChild(makeButton('test-subtitle-' + id, name, api => api.playCharacterSubtitle(id)));
  }
  const stop = document.createElement('button');
  stop.id = 'stop-all-character-subtitles';
  stop.type = 'button';
  stop.textContent = '停止字幕';
  stop.style.cssText = 'padding:5px 8px;background:#292929;color:#eee;border:1px solid #777;cursor:pointer;';
  stop.addEventListener('click', () => {
    const api = window.RIFT_NIGHT6_MUTATION_TEST;
    if (api && api.stop) api.stop();
  });
  group.appendChild(stop);
  document.body.appendChild(group);
})();
