/* Rift Ash developer test console. Test overrides are runtime-only. */
(() => {
  'use strict';
  const bridge = () => window.RIFT_TEST_BRIDGE;
  const style = document.createElement('style');
  style.textContent = `
    #rift-dev-toggle{position:fixed;right:12px;bottom:12px;z-index:100020;padding:9px 13px;border:1px solid #9a8050;background:#111;color:#f4dfb5;font:12px "Courier New",monospace;cursor:pointer}
    #rift-dev-panel{position:fixed;right:12px;bottom:54px;z-index:100019;width:min(360px,94vw);max-height:min(78vh,720px);overflow:auto;display:none;padding:12px;background:rgba(8,8,8,.96);border:1px solid #806b45;box-shadow:0 8px 32px #000;color:#ead9b7;font:12px/1.45 "Courier New",monospace}
    #rift-dev-panel.open{display:block}
    #rift-dev-panel h3{margin:8px 0;color:#d7ad65;font-size:13px;letter-spacing:.08em}
    #rift-dev-panel .dev-row{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin:6px 0}
    #rift-dev-panel label{min-width:72px}
    #rift-dev-panel button,#rift-dev-panel select,#rift-dev-panel input{max-width:100%;padding:6px;background:#24211c;color:#f5e7cb;border:1px solid #766344;font:inherit}
    #rift-dev-panel button{cursor:pointer}
    #rift-dev-panel input[type=range]{flex:1;min-width:100px}
    #rift-dev-panel .dev-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:5px}
    #rift-dev-panel .dev-grid button{width:100%}
    #rift-dev-panel .danger{border-color:#9c4545;color:#ffb7a9}
    #rift-dev-panel .dev-status{min-height:18px;color:#9fd5a5;margin-top:7px;overflow-wrap:anywhere}
    #rift-dev-panel .dev-note{color:#a99d87;font-size:10px}
    @media(max-width:600px){#rift-dev-toggle{right:8px;bottom:8px;padding:8px 10px}#rift-dev-panel{right:2vw;bottom:48px;width:96vw;max-height:72vh}}
  `;
  document.head.appendChild(style);
  const toggle=document.createElement('button');toggle.id='rift-dev-toggle';toggle.type='button';toggle.textContent='开发测试 ▴';
  const panel=document.createElement('section');panel.id='rift-dev-panel';panel.setAttribute('aria-label','开发测试面板');
  panel.innerHTML=`
    <h3>RIFT ASH // TEST CONSOLE</h3>
    <div class="dev-row"><label>快速进入</label><select id="dev-night"><option value="1">第一夜</option><option value="2">第二夜</option><option value="3">第三夜</option><option value="4">第四夜</option><option value="5">第五夜</option><option value="6">第六夜</option></select><button id="dev-start">进入／重开</button></div>
    <div class="dev-row"><label>时间跳转</label><input id="dev-time" type="time" value="05:00"><button id="dev-jump">跳转</button></div>
    <div class="dev-row"><button id="dev-pause">暂停</button><button id="dev-resume">继续</button><button id="dev-reload">重开本夜</button></div>
    <h3>AI 数值临时覆盖</h3>
    <div class="dev-row"><label>角色</label><select id="dev-ai-char">
      <option value="gildedEleven">十一</option><option value="flux">闪流</option><option value="noka">诺卡</option><option value="tannin">塔宁</option><option value="lobe">耳机</option><option value="gu">孤</option><option value="chillo">寒零</option><option value="cosmo">小宇宙</option><option value="transfer">移交／一脚</option>
    </select></div>
    <div class="dev-row"><label>AI <span id="dev-ai-value">10</span></label><input id="dev-ai-level" type="range" min="0" max="20" value="10"><button id="dev-ai-apply">应用</button></div>
    <div class="dev-note">只修改当前运行时数据，不会改写正式夜晚配置；重开夜晚会恢复正式数值。</div>
    <h3>摄像头与办公室</h3>
    <div class="dev-grid" id="dev-cameras"></div>
    <div class="dev-row"><button id="dev-door-l">左门开／关</button><button id="dev-door-r">右门开／关</button></div>
    <div class="dev-row"><button id="dev-light-l">左灯</button><button id="dev-light-r">右灯</button><button id="dev-monitor">监控开／关</button></div>
    <h3>强制角色出现</h3>
    <div class="dev-row"><label>角色</label><select id="dev-character">
      <option value="flux">闪流</option><option value="lobe">耳机</option><option value="gu">孤</option><option value="chillo">寒零</option><option value="tannin">塔宁</option><option value="gildedEleven">十一</option><option value="cosmo">小宇宙</option><option value="transfer">移交／一脚</option>
    </select><label>摄像头</label><select id="dev-char-cam"></select><button id="dev-force-character">出现</button></div>
    <div class="dev-row"><button id="dev-reset-actor">重置共享角色</button><button id="dev-behind">显示十一在身后</button></div>
    <h3>第六夜机制测试</h3>
    <div class="dev-row"><label>突变角色</label><select id="dev-mutation"><option value="tannin">塔宁突变</option><option value="lobe">耳机突变</option><option value="gu">孤突变</option><option value="chillo">寒零突变</option></select><button id="dev-mutation-go">触发突变</button></div>
    <div class="dev-row"><label>诺卡位置</label><select id="dev-noka-cam"></select><button id="dev-noka-go">移动诺卡</button></div>
    <div class="dev-row"><label>发条</label><select id="dev-crank"><option value="0">0 / 5</option><option value="1">1 / 5</option><option value="2">2 / 5</option><option value="3">3 / 5</option><option value="4">4 / 5</option><option value="5" selected>5 / 5</option></select><button id="dev-crank-go">设置</button><button id="dev-flash">测试闪光</button></div>
    <h3>辅助演出与诊断</h3>
    <div class="dev-row"><button id="dev-transfer-scare" class="danger">移交三阶段惊吓</button><button id="dev-jumpscare" class="danger">测试跳杀</button></div>
    <div class="dev-row"><button id="dev-state">读取角色状态</button></div>
    <div class="dev-status" id="dev-status">等待游戏启动</div>
    <div class="dev-note">注意：强制突变、跳杀和移交三阶段会触发正式演出／失败流程。请在测试夜晚使用。</div>
  `;
  document.body.append(toggle,panel);
  const $=id=>panel.querySelector('#'+id);
  const status=message=>{$('dev-status').textContent=message;};
  for(let i=1;i<=14;i++){
    const b=document.createElement('button');b.textContent=String(i);b.type='button';b.addEventListener('click',()=>{const ok=bridge()?.setCamera(i);status(ok?'已切换到 CAM '+i:'请先开始夜晚并打开监控');});$('dev-cameras').appendChild(b);
  }
  for(let i=1;i<=14;i++){
    const o=document.createElement('option');o.value=String(i);o.textContent='CAM '+String(i).padStart(2,'0');$('dev-char-cam').appendChild(o);
    const n=o.cloneNode(true);if(i===13)n.selected=true;$('dev-noka-cam').appendChild(n);
  }
  toggle.addEventListener('click',()=>{panel.classList.toggle('open');toggle.textContent=panel.classList.contains('open')?'关闭测试面板 ▾':'开发测试 ▴';});
  $('dev-start').addEventListener('click',()=>{bridge()?.startNight(Number($('dev-night').value));status('已重新进入第 '+$('dev-night').value+' 夜');});
  $('dev-jump').addEventListener('click',()=>status(bridge()?.setTime($('dev-time').value)?'时间已跳转到 '+$('dev-time').value:'请先开始游戏，并输入有效时间'));
  $('dev-pause').addEventListener('click',()=>{bridge()?.pause(true);status('游戏已暂停');});
  $('dev-resume').addEventListener('click',()=>{bridge()?.pause(false);status('游戏继续运行');});
  $('dev-reload').addEventListener('click',()=>{const n=Number(window.RIFT_NIGHT_STATE?.night||$('dev-night').value);bridge()?.startNight(n);status('已重开当前夜晚');});
  $('dev-ai-level').addEventListener('input',()=>{$('dev-ai-value').textContent=$('dev-ai-level').value;});
  $('dev-ai-apply').addEventListener('click',()=>{const id=$('dev-ai-char').value;const ok=bridge()?.setAI(id,$('dev-ai-level').value);status(ok?'已临时设置 '+$('dev-ai-char').selectedOptions[0].textContent+' AI = '+$('dev-ai-level').value:'AI 设置失败');});
  $('dev-door-l').addEventListener('click',()=>bridge()?.toggleDoor('left'));
  $('dev-door-r').addEventListener('click',()=>bridge()?.toggleDoor('right'));
  $('dev-light-l').addEventListener('click',()=>bridge()?.toggleLight('left'));
  $('dev-light-r').addEventListener('click',()=>bridge()?.toggleLight('right'));
  $('dev-monitor').addEventListener('click',()=>document.getElementById('btnCam')?.click());
  $('dev-force-character').addEventListener('click',()=>{const id=$('dev-character').value,cam=Number($('dev-char-cam').value);const ok=bridge()?.forceCharacter(id,cam);status(ok?'已请求显示 '+$('dev-character').selectedOptions[0].textContent:'当前夜晚不支持该角色的此项强制测试');});
  $('dev-reset-actor').addEventListener('click',()=>{const id=$('dev-character').value;const ok=window.RIFT_SHARED_CHARACTER_AI?.resetActor(id);status(ok?'已重置 '+id:'该角色不属于共享 AI 系统');});
  $('dev-behind').addEventListener('click',()=>status(bridge()?.forceEleven()?'已显示十一':'无法显示十一，请先开始夜晚'));
  $('dev-mutation-go').addEventListener('click',()=>status(bridge()?.forceMutation($('dev-mutation').value)?'已触发第六夜突变':'突变只能在第六夜触发，或该角色当前不可用'));
  $('dev-noka-go').addEventListener('click',()=>status(bridge()?.forceNokaCamera($('dev-noka-cam').value)?'诺卡已移动到 CAM '+$('dev-noka-cam').value:'当前夜晚无法移动诺卡'));
  $('dev-crank-go').addEventListener('click',()=>status(bridge()?.setCrank($('dev-crank').value)?'发条已设置为 '+$('dev-crank').value+'/5':'发条设置失败'));
  $('dev-flash').addEventListener('click',()=>{bridge()?.flash();status('已触发闪光测试（需在 CAM 10 监控中）');});
  $('dev-transfer-scare').addEventListener('click',()=>{const ok=bridge()?.forceMutation('transfer');if(!ok){window.dispatchEvent(new CustomEvent('rift:night-six-mutation-attack',{detail:{characterId:'transfer',mutationId:'debug-transfer'}}));status('已发送移交突变测试事件');}else status('移交突变已触发');});
  $('dev-jumpscare').addEventListener('click',()=>{bridge()?.jumpscare('测试角色');status('已触发测试跳杀');});
  $('dev-state').addEventListener('click',()=>{
    const shared=window.RIFT_SHARED_CHARACTER_AI?.getState?.();
    const n6=window.RIFT_NIGHT6_CHARACTER_SYSTEM?.getState?.();
    const companion=window.RIFT_TANNIN_COMPANIONS?.getState?.();
    status('共享角色：'+JSON.stringify(shared?.actors||{})+'；第六夜：'+JSON.stringify(n6||{})+'；辅助角色：'+JSON.stringify(companion?.positions||{}));
  });
})();
