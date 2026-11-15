/*
 * Rift Ash — Night 6 character mechanics and CCTV silhouettes.
 * Independent presentation/interaction layer; host state is read through custom events.
 */
(() => {
  'use strict';
  const NIGHT = 6;
  const defs = {
    noka: { name: '诺卡', cam: 13, glyph: '♫', kind: 'music' },
    tannin: { name: '塔宁', cam: 5, glyph: '◉', kind: 'eyes' },
    lobe: { name: '耳机', cam: 10, glyph: '▤', kind: 'headphones' },
    gu: { name: '孤', cam: 4, glyph: '▥', kind: 'report' },
    chillo: { name: '寒零', cam: 6, glyph: '❄', kind: 'cold' },
    cosmo: { name: '小宇宙', cam: 11, glyph: '✦', kind: 'cosmic' },
    transfer: { name: '移交', cam: 1, glyph: '⌁', kind: 'transfer' }
  };
  const mutationOrder = ['noka','tannin','lobe','gu','chillo','cosmo','transfer'];
  let night = 0, locked = false, active = null, activeId = '', defended = new Set();
  let frame = { running:false, camOpen:false, camId:1, leftClosed:false, rightClosed:false };
  let crank = 0, transferHeat = 0, transferInside = false, transferTimer = 0;
  let cosmoLockUntil = 0, nokaLastTick = 0, fluxCam = 2, fluxLookSince = 0, fluxTextShown = false, fluxDelay = 0, fluxThreat = 0, fluxAtDoor = false;
  const $ = (id) => document.getElementById(id);

  const style = document.createElement('style');
  style.textContent = `
    .rift-n6-sprite{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:5px;z-index:8;pointer-events:none;background:radial-gradient(ellipse at 50% 70%,rgba(0,0,0,.2),transparent 65%)}
    .rift-n6-sprite .figure{width:clamp(48px,10vw,116px);height:clamp(74px,22vh,190px);display:flex;align-items:center;justify-content:center;position:relative;color:#cbbda2;font: bold clamp(34px,7vw,76px) Georgia,serif;text-shadow:0 0 8px #d5c6a0,0 0 24px #8b1c1c;filter:drop-shadow(0 8px 9px #000);animation:riftN6Sway 2.8s ease-in-out infinite}
    .rift-n6-sprite .figure:before{content:"";position:absolute;inset:12% 16% 0;border:2px solid rgba(190,170,140,.5);border-radius:48% 48% 18% 18%;background:linear-gradient(145deg,rgba(70,58,48,.9),rgba(8,8,8,.98));z-index:-1;box-shadow:inset 0 0 20px #000,0 0 14px #000}
    .rift-n6-sprite .tag{font:10px/1.2 'Courier New',monospace;letter-spacing:2px;color:#e7d6b7;background:#090807d9;border:1px solid #806d52;padding:3px 7px}
    .rift-n6-sprite.active .figure{color:#d8b8a2;text-shadow:0 0 8px #f44,0 0 25px #b00;animation:riftN6Glitch .18s steps(2) infinite}
    @keyframes riftN6Sway{50%{transform:translateY(-4px) rotate(1deg)}}
    @keyframes riftN6Glitch{50%{transform:translate(3px,-1px) skew(-3deg);filter:hue-rotate(30deg) contrast(1.8)}}
    .rift-n6-device{position:absolute;z-index:35;left:50%;bottom:12%;transform:translateX(-50%);display:none;min-width:150px;padding:10px;background:#080706ed;border:1px solid #9a7951;color:#ead8b8;text-align:center;font:12px 'Courier New',monospace;box-shadow:0 5px 22px #000}
    #feed-13.active .rift-n6-device[data-device="crank"],#feed-10.active .rift-n6-device[data-device="flash"]{display:block}
    .rift-n6-device button{margin-top:6px;padding:8px 12px;background:#39291d;border:1px solid #b18a58;color:#fff0d5;font:12px 'Courier New',monospace;touch-action:manipulation}
    .rift-n6-meter{height:5px;background:#332b22;margin-top:7px}.rift-n6-meter i{display:block;height:100%;width:0;background:#c99b57}
    #rift-n6-status{position:absolute;top:clamp(115px,17vh,170px);left:50%;transform:translateX(-50%);z-index:100;display:none;max-width:min(90vw,540px);padding:9px 14px;background:#090706e8;border:1px solid #a17b50;color:#f0dfc4;font:12px/1.5 'Courier New',monospace;text-align:center;pointer-events:none}
    #rift-n6-status.show{display:block}
    #rift-n6-transfer{position:absolute;inset:24% 30% 18%;z-index:90;display:none;align-items:center;justify-content:center;flex-direction:column;gap:8px;background:radial-gradient(ellipse,#1b1713ed,#050505cc 72%);border:1px solid #8b765b;color:#ead8c0;font:13px 'Courier New',monospace;touch-action:manipulation}
    #rift-n6-transfer.show{display:flex}
    #rift-n6-transfer .face{font-size:clamp(48px,12vw,100px);text-shadow:0 0 15px #a22}
    #rift-n6-transfer .meter{width:65%;height:7px;background:#342b25}.meter i{display:block;height:100%;width:0;background:#a22}
    .rift-flux-choice{position:absolute;z-index:50;left:50%;top:28%;transform:translateX(-50%);display:flex;gap:8px;padding:10px;background:#090807eF;border:1px solid #a17b50;color:#f0dfc4;font:16px 'Courier New',monospace;pointer-events:auto}
    .rift-flux-choice button{min-width:42px;padding:10px;background:#211a16;border:1px solid #8b765b;color:#d5c2a4;font:20px 'Courier New',monospace}
    .rift-flux-choice button.clear{color:#fff;background:#5a4630;border-color:#f0d5a4;text-shadow:0 0 8px #fff}
    #camera-panel.rift-cosmo-lock #cam-map{pointer-events:none;filter:blur(2px) grayscale(1)}
    #camera-panel.rift-cosmo-lock:after{content:'SIGNAL ORBIT // CONTROL LOST';position:absolute;inset:40% 8% auto;text-align:center;color:#d8c5a2;background:#050505dc;padding:15px;border:1px solid #a17b50;z-index:80;font:12px 'Courier New',monospace;pointer-events:none}
    @media(max-width:700px){.rift-n6-device{bottom:8%;padding:8px;min-width:135px}#rift-n6-transfer{inset:27% 12% 20%}}
  `;
  document.head.appendChild(style);

  function ensureStatus(){
    let el=$('rift-n6-status');
    if(!el){el=document.createElement('div');el.id='rift-n6-status';($('game')||document.body).appendChild(el);}
    return el;
  }
  function ensureDevices(){
    const f13=$('feed-13'), f10=$('feed-10');
    if(f13&&!f13.querySelector('[data-device="crank"]')){
      const box=document.createElement('div');box.className='rift-n6-device';box.dataset.device='crank';
      box.innerHTML='<div>CAM 13 // MUSIC BOX</div><div id="rift-n6-crank-count">发条：0 / 5</div><div class="rift-n6-meter"><i id="rift-n6-crank-meter"></i></div><button type="button" id="rift-n6-crank-btn">上发条</button>';
      f13.appendChild(box);
      box.querySelector('button').addEventListener('click',()=>{if(night!==6||!frame.running)return;crank=Math.min(5,crank+1);renderCrank();window.dispatchEvent(new CustomEvent('rift:night-six-crank',{detail:{value:crank,max:5}}));});
    }
    if(f10&&!f10.querySelector('[data-device="flash"]')){
      const box=document.createElement('div');box.className='rift-n6-device';box.dataset.device='flash';
      box.innerHTML='<div>CAM 10 // FLASH</div><div>发现耳机时照射</div><button type="button" id="rift-n6-flash-btn">闪光</button>';
      f10.appendChild(box);
      box.querySelector('button').addEventListener('click',()=>{if(night!==6||!frame.running||!frame.camOpen||Number(frame.camId)!==10)return;window.dispatchEvent(new CustomEvent('rift:night-six-flash',{detail:{camId:10}}));});
    }
  }
  function renderCrank(){
    const label=$('rift-n6-crank-count'), bar=$('rift-n6-crank-meter');
    if(label)label.textContent='发条：'+crank+' / 5';
    if(bar)bar.style.width=(crank/5*100)+'%';
  }
  function renderFlux(){
    const feed=$('feed-'+fluxCam);if(!feed)return;
    let el=feed.querySelector('[data-rift-character="flux"]');
    if(!el){el=document.createElement('div');el.className='rift-n6-sprite';el.dataset.riftCharacter='flux';el.innerHTML='<div class="figure">▣</div><div class="tag">闪流 // TV DIRECTOR</div>';feed.appendChild(el);}
    el.style.display=night===6&&!locked&&!fluxAtDoor?'flex':'none';
  }
  function renderSprites(){
    Object.entries(defs).forEach(([id,d])=>{
      const feed=$('feed-'+d.cam);if(!feed)return;
      let el=feed.querySelector('[data-rift-character="'+id+'"]');
      if(!el){el=document.createElement('div');el.className='rift-n6-sprite';el.dataset.riftCharacter=id;el.innerHTML='<div class="figure"></div><div class="tag"></div>';feed.appendChild(el);}
      const visible=night===6 && (!locked || id==='noka') && (id==='noka'||id==='lobe'||active===id);
      el.style.display=visible?'flex':'none';
      el.classList.toggle('active',active===id);
      el.querySelector('.figure').textContent=d.glyph;
      el.querySelector('.tag').textContent=d.name+' // CAM '+String(d.cam).padStart(2,'0');
    });
    renderFlux();
  }
  function showFluxChoices(){
    if(fluxTextShown)return;fluxTextShown=true;
    const feed=$('feed-'+fluxCam);if(!feed)return;
    const clearIndex=Math.floor(Math.random()*3), words=['演','幕','场'];
    const box=document.createElement('div');box.className='rift-flux-choice';box.id='rift-flux-choice';
    words.forEach((word,index)=>{const b=document.createElement('button');b.type='button';b.textContent=word;if(index===clearIndex)b.classList.add('clear');b.addEventListener('click',()=>{
      if(index===clearIndex){fluxDelay=Date.now()+25000;fluxThreat=Math.max(0,fluxThreat-1);announce('辨认成功：闪流抵达门口的时间被延缓');const close=$('btnCamClose');if(close)close.click();}
      else{fluxThreat++;announce('辨认错误：闪流正在靠近');if(fluxThreat>=2){fluxAtDoor=true;announce('闪流已经来到门口，必须关门');}}
      box.remove();fluxTextShown=false;fluxLookSince=0;renderFlux();
    });box.appendChild(b);});
    feed.appendChild(box);
  }
  function announce(text){
    const el=ensureStatus();el.textContent=text;el.classList.add('show');
    clearTimeout(announce.timer);announce.timer=setTimeout(()=>el.classList.remove('show'),2600);
  }
  function finishAttack(success,reason){
    if(!active)return;
    const id=active;
    if(success)defended.add(id);
    window.dispatchEvent(new CustomEvent(success?'rift:night-six-mutation-defended':'rift:night-six-mutation-resolved',{
      detail:{night:6,characterId:id,success:!!success,reason:reason||'',returnToStart:!!success,stopForNight:!!success}
    }));
    active=null;activeId='';
    renderSprites();
    if(success)announce(defs[id].name+' 已被防御，返回初始位置并停止行动');
  }
  function beginAttack(detail){
    if(night!==6||locked||!detail||!mutationOrder.includes(detail.characterId)||defended.has(detail.characterId))return;
    active=detail.characterId;activeId=detail.mutationId||'';
    renderSprites();
    const tips={
      noka:'诺卡突变：立即查看13号监控并持续上发条。十一事件期间可额外尝试关闭右门。',
      tannin:'塔宁突变：观察门口动静，使用对应门或灯光防御。',
      lobe:'耳机突变：切换10号监控并使用专属闪光灯。',
      gu:'孤突变：关闭左门防御。',
      chillo:'寒零突变：通过监控判断位置，关闭右门防御。',
      cosmo:'小宇宙突变：监控控制即将发生，持续数秒后恢复。',
      transfer:'移交突变：不要点击他，也不要让鼠标停留在他身上。'
    };
    announce(tips[active]);
    if(active==='cosmo'){
      cosmoLockUntil=Date.now()+4200;
      const panel=$('camera-panel');if(panel)panel.classList.add('rift-cosmo-lock');
      setTimeout(()=>{if(Date.now()>=cosmoLockUntil){const p=$('camera-panel');if(p)p.classList.remove('rift-cosmo-lock');}},4300);
      setTimeout(()=>{if(active==='cosmo')finishAttack(true,'cosmo-control-ended');},4300);
    }
    if(active==='transfer')showTransfer();
    if(active==='noka')onCrank();
  }
  function showTransfer(){
    let el=$('rift-n6-transfer');
    if(!el){el=document.createElement('div');el.id='rift-n6-transfer';el.innerHTML='<div class="face">⌁</div><div>移交 // 不要触碰</div><div class="meter"><i id="rift-n6-transfer-bar"></i></div><small id="rift-n6-transfer-stage">阶段 0 / 3</small>';($('game')||document.body).appendChild(el);
      const enter=()=>{if(active!=='transfer')return;transferInside=true;};
      const leave=()=>{transferInside=false;};
      el.addEventListener('pointerenter',enter);el.addEventListener('pointerleave',leave);
      el.addEventListener('pointerdown',e=>{if(active==='transfer'&&e.pointerType!=='mouse'){transferInside=true;}});
      el.addEventListener('click',e=>{if(active==='transfer'){transferInside=true;e.preventDefault();}});
    }
    el.classList.add('show');
  }
  function hideTransfer(){const el=$('rift-n6-transfer');if(el)el.classList.remove('show');transferInside=false;}
  function showTransferScare(){let el=$('rift-n6-transfer-scare');if(!el){el=document.createElement('div');el.id='rift-n6-transfer-scare';el.textContent='TRANSFER // SIGNAL OVERRUN';el.style.cssText='position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;background:#050303;color:#f2ddd0;font:bold clamp(24px,7vw,72px) Courier New,monospace;text-shadow:0 0 18px #b00;letter-spacing:.12em;pointer-events:none;';document.body.appendChild(el);}el.style.display='flex';setTimeout(()=>{el.style.display='none';},1100);}
  function onFrame(e){
    frame={...frame,...(e.detail||{})};
    if(active==='transfer'){
      const dt=Math.min(.1,Math.max(0,Number(frame.dt)||0));
      transferHeat=transferInside?Math.min(3,transferHeat+dt*.48):Math.max(0,transferHeat-dt*.18);
      const bar=$('rift-n6-transfer-bar'),label=$('rift-n6-transfer-stage');
      if(bar)bar.style.width=(transferHeat/3*100)+'%';
      if(label)label.textContent='阶段 '+Math.min(3,Math.floor(transferHeat+0.01))+' / 3';
      if(transferHeat>=3){hideTransfer();showTransferScare();finishAttack(false,'transfer-stage-three-jumpscare');announce('移交的三阶段已满！');}
    }
    if(night===6 && frame.running && Date.now()-nokaLastTick>12000){crank=Math.max(0,crank-1);nokaLastTick=Date.now();renderCrank();window.dispatchEvent(new CustomEvent('rift:night-six-noka-wind-level',{detail:{value:crank,max:5,calm:crank>0}}));}
    if(active==='noka'&&crank>=5)finishAttack(true,'music-box-wound');
    if(night===6&&!locked&&!fluxAtDoor){
      if(frame.camOpen&&Number(frame.camId)===fluxCam){if(!fluxLookSince)fluxLookSince=Date.now();if(Date.now()-fluxLookSince>1250)showFluxChoices();}
      else{fluxLookSince=0;const choice=$('rift-flux-choice');if(choice){choice.remove();fluxTextShown=false;}}
      if(fluxDelay&&Date.now()>fluxDelay){fluxDelay=0;fluxAtDoor=true;announce('闪流已经来到门口，必须关门');renderFlux();}
    }
  }
  function onDoor(e){
    const d=e.detail||{};
    if(!active)return;
    if(fluxAtDoor&&(d.leftClosed||d.rightClosed||frame.leftClosed||frame.rightClosed)){fluxAtDoor=false;fluxThreat=0;fluxDelay=0;announce('闪流被门挡住，暂时退开');renderFlux();}
    if(active==='gu'&&(d.leftClosed||frame.leftClosed))finishAttack(true,'left-door');
    else if(active==='chillo'&&(d.rightClosed||frame.rightClosed))finishAttack(true,'right-door');
    else if(active==='noka'&&d.rightClosed&&d.elevenEventActive)finishAttack(true,'eleven-right-door');
    else if(active==='tannin'&&(d.leftClosed||d.rightClosed))finishAttack(true,'door');
  }
  function onCrank(){
    if(active==='noka'&&crank>=5)finishAttack(true,'music-box-wound');
  }
  function onFlash(){if(active==='lobe'&&frame.camOpen&&Number(frame.camId)===10)finishAttack(true,'cam10-flash');}
  function onMonitor(e){
    const d=e.detail||{};
    if(active==='flux'&&d.open===false)finishAttack(true,'monitor-closed');
  }
  function resetNight(e){
    night=Number(e.detail&&e.detail.night)||0;locked=false;active=null;activeId='';defended.clear();
    crank=0;transferHeat=0;transferInside=false;cosmoLockUntil=0;fluxCam=2+Math.floor(Math.random()*10);if(fluxCam===10||fluxCam===13)fluxCam=9;fluxLookSince=0;fluxTextShown=false;fluxDelay=0;fluxThreat=0;fluxAtDoor=false;nokaLastTick=Date.now();renderCrank();hideTransfer();
    const p=$('camera-panel');if(p)p.classList.remove('rift-cosmo-lock');
    renderSprites();if(night===6)ensureDevices();
  }
  window.addEventListener('rift:night-start',resetNight);
  window.addEventListener('rift:night-six-mutation-attack',e=>beginAttack(e.detail));
  window.addEventListener('rift:night-six-others-return',()=>{locked=true;active=null;renderSprites();});
  window.addEventListener('rift:night-six-eleven-awakened',()=>{locked=false;renderSprites();});
  window.addEventListener('rift:game-frame',onFrame);
  window.addEventListener('rift:night-six-door-change',onDoor);
  window.addEventListener('rift:night-six-crank',onCrank);
  window.addEventListener('rift:night-six-flash',onFlash);
  window.addEventListener('rift:monitor-toggle',onMonitor);
  window.addEventListener('rift:night-six-mutation-defended',hideTransfer);
  window.addEventListener('rift:night-six-mutation-resolved',hideTransfer);
  window.RIFT_NIGHT6_CHARACTER_SYSTEM=Object.freeze({
    getState:()=>({night,locked,active,crank,transferHeat,defended:Array.from(defended)}),
    reset:()=>resetNight({detail:{night:6}})
  });
  ensureDevices();
})();
