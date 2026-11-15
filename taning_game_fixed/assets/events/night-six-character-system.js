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
    transfer: { name: '移交', cam: 1, glyph: '⌁', kind: 'transfer' }
  };
  const mutationOrder = ['tannin','lobe','gu','chillo','transfer'];
  const routes = { tannin:[5,4,1], lobe:[10,9,1], gu:[4,5,1], chillo:[6,3,1], transfer:[1] };
  let activeCam = 1, routeIndex = 0, routeClock = 0, attackClock = 0;
  let night = 0, locked = false, active = null, activeId = '', defended = new Set();
  let frame = { running:false, camOpen:false, camId:1, leftClosed:false, rightClosed:false };
  let crank = 0, transferHeat = 0, transferInside = false, transferTimer = 0;
  let cosmoLockUntil = 0, nokaLastTick = 0, fluxCam = 2, fluxLookSince = 0, fluxTextShown = false, fluxDelay = 0, fluxThreat = 0, fluxAtDoor = false;
  const $ = (id) => document.getElementById(id);

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
      box.querySelector('button').addEventListener('click',()=>{
        if(!frame.running||!frame.camOpen||Number(frame.camId)!==10)return;
        const feed=$('feed-10');if(feed){feed.classList.remove('rift-cam10-flash');void feed.offsetWidth;feed.classList.add('rift-cam10-flash');setTimeout(()=>feed.classList.remove('rift-cam10-flash'),260);}
        window.dispatchEvent(new CustomEvent('rift:night-six-flash',{detail:{camId:10,deviceOnly:true}}));
      });
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
    if(!el){el=document.createElement('div');el.className='rift-n6-sprite rift-flux-tv';el.dataset.riftCharacter='flux';el.innerHTML='<div class="figure">▣</div><div class="tag">闪流 // TV DIRECTOR</div>';feed.appendChild(el);}
    el.style.display=night===6&&!locked&&!fluxAtDoor?'flex':'none';
  }
  function renderSprites(){
    Object.entries(defs).forEach(([id,d])=>{
      const feed=$('feed-'+d.cam);if(!feed)return;
      let el=feed.querySelector('[data-rift-character="'+id+'"]');
      if(!el){el=document.createElement('div');el.className='rift-n6-sprite';el.dataset.riftCharacter=id;el.innerHTML='<div class="figure"></div><div class="tag"></div>';feed.appendChild(el);}
      const visible=night===6 && ((id==='noka') || (id==='lobe') || (active===id) || defended.has(id));
      el.style.display=(visible && (id==='noka'||id==='lobe'?true:(active===id?Number(d.cam)===activeCam:defended.has(id))))?'flex':'none';
      el.classList.toggle('active',active===id);
      el.querySelector('.figure').textContent=d.glyph;
      el.querySelector('.tag').textContent=d.name+' // CAM '+String(d.cam).padStart(2,'0');
    });
    renderFlux();
  }
  function renderActiveAtCam(){
    const office=$('rift-n6-office-attacker');
    if(office)office.style.display=(active && activeCam===1)?'flex':'none';
    if(!active || !defs[active])return;
    const d=defs[active];
    document.querySelectorAll('[data-rift-character="'+active+'"]').forEach(el=>{if(el.parentElement)el.style.display='none';});
    const feed=$('feed-'+activeCam);if(!feed)return;
    let el=feed.querySelector('[data-rift-character="'+active+'"]');
    if(!el){el=document.createElement('div');el.className='rift-n6-sprite';el.dataset.riftCharacter=active;el.innerHTML='<div class="figure"></div><div class="tag"></div>';feed.appendChild(el);}
    el.style.display='flex';el.classList.add('active');
    el.querySelector('.figure').textContent=d.glyph;
    el.querySelector('.tag').textContent=d.name+' // CAM '+String(activeCam).padStart(2,'0');
    if(activeCam===1)ensureOfficeAttacker();
  }
  function ensureOfficeAttacker(){
    let el=$('rift-n6-office-attacker');if(!el){el=document.createElement('div');el.id='rift-n6-office-attacker';el.innerHTML='<div class="figure"></div><div class="tag"></div>';($('game')||document.body).appendChild(el);}
    el.style.display=active?'flex':'none';el.querySelector('.figure').textContent=defs[active].glyph;el.querySelector('.tag').textContent=defs[active].name+' // ATTACK';
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
    if(success){defended.add(id);activeCam=routes[id]&&routes[id][0]||defs[id].cam;}
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
    if(active==='transfer')showTransfer();
    if((active==='gu'&&frame.leftClosed)||(active==='chillo'&&frame.rightClosed)||(active==='tannin'&&(frame.leftClosed||frame.rightClosed)))finishAttack(true,'door-already-closed');
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
    if(active && frame.running){
      const dt=Math.min(.1,Math.max(0,Number(frame.dt)||0));
      routeClock+=dt;attackClock+=dt;
      const route=routes[active]||[defs[active].cam,1];
      if(routeClock>=2.2 && routeIndex<route.length-1){
        routeClock=0;routeIndex++;activeCam=route[routeIndex];renderActiveAtCam();
      }
      if(active!=='transfer' && attackClock>=8.5){
        if(active==='lobe'){
          window.dispatchEvent(new CustomEvent('rift:night-six-time-rollback',{detail:{hours:1,characterId:'lobe'}}));
          finishAttack(true,'lobe-time-rollback');
        }else{
          window.dispatchEvent(new CustomEvent('rift:night-six-mutation-failed',{detail:{night:6,characterId:active,mutationId:activeId}}));
          finishAttack(false,'attack-timeout');
        }
      }
    }
    if(active==='transfer'){
      const dt=Math.min(.1,Math.max(0,Number(frame.dt)||0));
      transferHeat=transferInside?Math.min(3,transferHeat+dt*.48):Math.max(0,transferHeat-dt*.18);
      const bar=$('rift-n6-transfer-bar'),label=$('rift-n6-transfer-stage');
      if(bar)bar.style.width=(transferHeat/3*100)+'%';
      if(label)label.textContent='阶段 '+Math.min(3,Math.floor(transferHeat+0.01))+' / 3';
      if(transferHeat>=3){hideTransfer();showTransferScare();finishAttack(false,'transfer-stage-three-jumpscare');announce('移交的三阶段已满！');}
    }
    if(night===6 && frame.running && Date.now()-nokaLastTick>12000){crank=Math.max(0,crank-1);nokaLastTick=Date.now();renderCrank();window.dispatchEvent(new CustomEvent('rift:night-six-noka-wind-level',{detail:{value:crank,max:5,calm:crank>0}}));}
    if(night===6&&!locked&&!fluxAtDoor){
      if(frame.camOpen&&Number(frame.camId)===fluxCam){if(!fluxLookSince)fluxLookSince=Date.now();if(Date.now()-fluxLookSince>1250)showFluxChoices();}
      else{fluxLookSince=0;const choice=$('rift-flux-choice');if(choice){choice.remove();fluxTextShown=false;}}
      if(fluxDelay&&Date.now()>fluxDelay){fluxDelay=0;fluxAtDoor=true;announce('闪流已经来到门口，必须关门');renderFlux();}
    }
  }
  function onDoor(e){
    const d=e.detail||{};
    if(!active&&!fluxAtDoor)return;
    if(fluxAtDoor&&(d.leftClosed||d.rightClosed||frame.leftClosed||frame.rightClosed)){fluxAtDoor=false;fluxThreat=0;fluxDelay=0;announce('闪流被门挡住，暂时退开');renderFlux();}
    if(active==='gu'&&(d.leftClosed||frame.leftClosed))finishAttack(true,'left-door');
    else if(active==='chillo'&&(d.rightClosed||frame.rightClosed))finishAttack(true,'right-door');
    else if(active==='tannin'&&(d.leftClosed||d.rightClosed))finishAttack(true,'door');
  }
  function onCrank(){ /* Noka is handled by the independent music-box rule. */ }
  function onFlash(){if(active==='lobe'&&frame.camOpen&&Number(frame.camId)===10)finishAttack(true,'cam10-flash');}
  function onMonitor(e){
    const d=e.detail||{};
    if(active==='flux'&&d.open===false)finishAttack(true,'monitor-closed');
  }
  function resetNight(e){
    night=Number(e.detail&&e.detail.night)||0;locked=false;active=null;activeId='';defended.clear();activeCam=1;routeIndex=0;routeClock=0;attackClock=0;
    crank=0;transferHeat=0;transferInside=false;cosmoLockUntil=0;fluxCam=2+Math.floor(Math.random()*10);if(fluxCam===10||fluxCam===13)fluxCam=9;fluxLookSince=0;fluxTextShown=false;fluxDelay=0;fluxThreat=0;fluxAtDoor=false;nokaLastTick=Date.now();renderCrank();hideTransfer();
    const p=$('camera-panel');if(p)p.classList.remove('rift-cosmo-lock');
    renderSprites();ensureDevices();
  }
  window.addEventListener('rift:night-start',resetNight);
  window.addEventListener('rift:night-six-mutation-attack',e=>beginAttack(e.detail));
  window.addEventListener('rift:night-six-others-return',()=>{locked=true;active=null;const office=$('rift-n6-office-attacker');if(office)office.style.display='none';renderSprites();});
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
