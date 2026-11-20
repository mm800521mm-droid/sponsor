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
    lobe: { name: 'LOBE', cam: 10, glyph: '▤', kind: 'headphones' },
    gu: { name: '孤', cam: 4, glyph: '▥', kind: 'report' },
    chillo: { name: '寒零', cam: 6, glyph: '❄', kind: 'cold' },
    transfer: { name: '移交', cam: 1, glyph: '⌁', kind: 'transfer' }
  };
  // Tannin keeps its own original AI route and office defense; only the other three use mutation attacks.
  const mutationOrder = ['lobe','gu','chillo'];
  const attackDefs=window.RIFT_CHARACTER_ATTACKS||{};
  const routes = { lobe:attackDefs.lobe?.route||[10], gu:attackDefs.gu?.route||[4,5,1], chillo:attackDefs.chillo?.route||[6,3,1] };
  let activeCam = 1, routeIndex = 0, routeClock = 0, attackClock = 0;
  let night = 0, locked = false, active = null, activeId = '', defended = new Set();
  let fluxPauseStartedAt = 0;
  let frame = { running:false, camOpen:false, camId:1, leftClosed:false, rightClosed:false };
  let crank = 0, nokaCam = 13, nokaMoveTick = 0, transferHeat = 0, transferInside = false, transferTimer = 0;
  let nokaLastTick = 0, nokaAI = 0, nokaThreatTimer = 0, flashReadyAt = 0, lobeResponseSeconds = 5, fluxCam = 2, fluxLookSince = 0, fluxTextShown = false, fluxDelay = 0, fluxThreat = 0, fluxAtDoor = false;
  const $ = (id) => document.getElementById(id);

  function ensureStatus(){
    let el=$('rift-n6-status');
    if(!el){el=document.createElement('div');el.id='rift-n6-status';($('game')||document.body).appendChild(el);}
    return el;
  }
  function syncDeviceVisibility(){
    const panel=$('camera-panel');
    const visible=!!(frame.running&&frame.camOpen&&panel&&panel.classList.contains('show'));
    const crankBox=panel&&panel.querySelector('[data-device="crank"]');
    const flashBox=panel&&panel.querySelector('[data-device="flash"]');
    if(crankBox)crankBox.style.display=visible&&Number(frame.camId)===13?'block':'none';
    if(flashBox)flashBox.style.display=visible&&Number(frame.camId)===10?'block':'none';
  }
  function ensureDevices(){
    const panel=$('camera-panel');
    if(!panel)return;
    if(!panel.querySelector('[data-device="crank"]')){
      const box=document.createElement('div');box.className='rift-n6-device';box.dataset.device='crank';
      box.innerHTML='<div>CAM 13 // MUSIC BOX</div><div id="rift-n6-crank-count">发条：0 / 5</div><div class="rift-n6-meter"><i id="rift-n6-crank-meter"></i></div><button type="button" id="rift-n6-crank-btn">上发条</button>';
      panel.appendChild(box);
      box.querySelector('button').addEventListener('click',e=>{
        e.preventDefault();e.stopPropagation();
        if(!frame.running||!frame.camOpen||Number(frame.camId)!==13)return;
        const now=Date.now();
        crank=Math.min(5,crank+1);nokaThreatTimer=0;nokaMoveTick=0;nokaLastTick=now;
        renderCrank();
        const detail={value:crank,max:5,camId:13,source:'music-box-button'};
        window.dispatchEvent(new CustomEvent('rift:night-six-crank',{detail}));
        window.dispatchEvent(new CustomEvent('rift:noka-music',{detail}));
      });
    }
    if(!panel.querySelector('[data-device="flash"]')){
      const box=document.createElement('div');box.className='rift-n6-device';box.dataset.device='flash';
      box.innerHTML='<div>CAM 10 // FLASH</div><div>FLASH WHEN LOBE APPEARS</div><button type="button" id="rift-n6-flash-btn">FLASH</button>';
      panel.appendChild(box);
      const flashButton=box.querySelector('button');
      flashButton.addEventListener('click',e=>{
        e.preventDefault();e.stopPropagation();
        if(!frame.running||!frame.camOpen||Number(frame.camId)!==10||Date.now()<flashReadyAt)return;
        flashReadyAt=Date.now()+3000;
        flashButton.disabled=true;flashButton.textContent='COOLDOWN 3s';
        let remaining=3;
        const cooldown=setInterval(()=>{
          remaining--;
          if(remaining>0){flashButton.textContent='COOLDOWN '+remaining+'s';}
          else{clearInterval(cooldown);flashButton.disabled=false;flashButton.textContent='闪光';}
        },1000);
        const feed=$('feed-10');
        if(feed){feed.classList.remove('rift-cam10-flash');void feed.offsetWidth;feed.classList.add('rift-cam10-flash');setTimeout(()=>feed.classList.remove('rift-cam10-flash'),260);}
        window.dispatchEvent(new CustomEvent('rift:night-six-flash',{detail:{camId:10,deviceOnly:true}}));
      });
    }
    syncDeviceVisibility();
  }
  function aiFor(id){const current=window.RIFT_CURRENT_AI_LEVELS||{};const settings=(((window.NIGHT_SETTINGS||{})[night]||{}).characters||{});const policy=(window.RIFT_CHARACTER_AI_POLICIES||{})[id];return Math.max(0,Math.min(20,Number(current[id] ?? (policy&&policy.getLevel?policy.getLevel():settings[id]))||0));}
  function nokaActionCheck(){const p=(window.RIFT_CHARACTER_AI_POLICIES||{}).noka;return nokaAI>0&&(p&&p.canAct?p.canAct(nokaAI):(typeof window.riftCanCharacterMove==='function'?window.riftCanCharacterMove(nokaAI):Math.random()*100<nokaAI*5));}
  function renderCrank(){
    const label=$('rift-n6-crank-count'), bar=$('rift-n6-crank-meter');
    if(label)label.textContent='发条：'+crank+' / 5';
    if(bar)bar.style.width=(crank/5*100)+'%';
  }
  function renderFlux(){
    return; // Flux is rendered and controlled by the shared character AI module.
    const feed=$('feed-'+fluxCam);if(!feed)return;
    let el=feed.querySelector('[data-rift-character="flux"]');
    if(!el){el=document.createElement('div');el.className='rift-n6-sprite rift-flux-tv';el.dataset.riftCharacter='flux';el.innerHTML='<div class="figure">▣</div><div class="tag">闪流 // TV DIRECTOR</div>';feed.appendChild(el);}
    el.style.display=night===6&&!locked&&!fluxAtDoor?'flex':'none';
  }
  function renderSprites(){
    Object.entries(defs).forEach(([id,d])=>{
      const cam=id==='noka'?nokaCam:(active===id?activeCam:d.cam);
      const feed=$('feed-'+cam);if(!feed)return;
      if(id==='noka'||active===id)document.querySelectorAll('[data-rift-character="'+id+'"]').forEach(oldEl=>{if(oldEl.parentElement!==feed)oldEl.style.display='none';});
      let el=feed.querySelector('[data-rift-character="'+id+'"]');
      if(!el){el=document.createElement('div');el.className='rift-n6-sprite';el.dataset.riftCharacter=id;el.innerHTML='<div class="figure"></div><div class="tag"></div>';feed.appendChild(el);}
      const baseAI=Math.max(0,Number((window.RIFT_CURRENT_AI_LEVELS||{})[id] ?? ((((window.NIGHT_SETTINGS||{})[night]||{}).characters||{})[id]))||0);
      const visible=(id==='noka' && nokaAI>0) || (night===6 && active===id && baseAI>0) || (id==='lobe' && night===6 && !locked && active!=='lobe' && !defended.has('lobe') && baseAI>0);
      el.style.display=(visible && (id==='noka'||(active===id&&Number(cam)===activeCam)||(id==='lobe'&&active!=='lobe'&&Number(cam)===10)))?'flex':'none';
      el.classList.toggle('active',active===id);
      const figure=el.querySelector('.figure');
      if(window.RIFT_PIXEL_CHARACTERS) window.RIFT_PIXEL_CHARACTERS.mount(figure,id);
      else figure.textContent=d.glyph;
      el.querySelector('.tag').textContent=d.name+' // CAM '+String(cam).padStart(2,'0')+(id==='lobe'&&active!=='lobe'?' // STANDBY':'');
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
    const figure=el.querySelector('.figure');
    if(window.RIFT_PIXEL_CHARACTERS) window.RIFT_PIXEL_CHARACTERS.mount(figure,active);
    else figure.textContent=d.glyph;
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
    const clearIndex=Math.floor(Math.random()*3), words=['ACT','CUT','TAKE'];
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
    if(id==='lobe')window.dispatchEvent(new CustomEvent('rift:lobe-warning-clear',{detail:{reason:success?'flashed':'timeout'}}));
    active=null;activeId='';routeClock=0;attackClock=0;routeIndex=0;
    renderSprites();
    if(success)announce(defs[id].name+' 已被防御，返回初始位置并停止行动');
  }
  function beginAttack(detail){
    if(night!==6||locked||!detail||!mutationOrder.includes(detail.characterId)||defended.has(detail.characterId)||aiFor(detail.characterId)<=0)return;
    // 每个突变事件都必须从独立的路线和计时状态开始，不能继承上一名角色的进度。
    routeIndex=0;routeClock=0;attackClock=0;
    active=detail.characterId;activeId=detail.mutationId||'';
    if(active==='lobe'){const lobePolicy=(window.RIFT_CHARACTER_AI_POLICIES||{}).lobe;lobeResponseSeconds=lobePolicy&&lobePolicy.responseSeconds?lobePolicy.responseSeconds(aiFor('lobe')):Math.max(3,8-aiFor('lobe')*0.25);window.dispatchEvent(new CustomEvent('rift:lobe-warning-start',{detail:{seconds:lobeResponseSeconds,ai:aiFor('lobe')}}));}
    activeCam=(routes[active]&&routes[active][0])||defs[active].cam;
    renderSprites();
    const tips={
      noka:'诺卡突变：立即查看13号监控并持续上发条。十一事件期间可额外尝试关闭右门。',
      lobe:'耳机突变：切换10号监控并使用专属闪光灯。',
      gu:'孤突变：关闭左门防御。',
      chillo:'寒零突变：通过监控判断位置，关闭右门防御。',
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
    syncDeviceVisibility();
    if(window.RIFT_FLUX_PRIORITY_SCARE_ACTIVE)return;
    if(active && frame.running){
      const dt=Math.min(.1,Math.max(0,Number(frame.dt)||0));
      const attackSpeed=1+aiFor(active)*0.075;
      routeClock+=dt*attackSpeed;attackClock+=dt*attackSpeed;
      const route=routes[active]||[defs[active].cam,1];
      if(routeClock>=2.2 && routeIndex<route.length-1){
        routeClock=0;routeIndex++;activeCam=route[routeIndex];renderActiveAtCam();
      }
      if(active!=='transfer' && attackClock>=(active==='lobe'?lobeResponseSeconds*attackSpeed:8.5)){
        if(active==='lobe'){
          window.dispatchEvent(new CustomEvent('rift:night-six-time-rollback',{detail:{hours:1,characterId:'lobe'}}));
          finishAttack(true,'lobe-time-rollback');
        }else{
          window.dispatchEvent(new CustomEvent('rift:night-six-mutation-failed',{detail:{night:6,characterId:active,mutationId:activeId}}));
          finishAttack(false,'attack-timeout');
        }
      }
    }
    const transferAttack=(window.RIFT_CHARACTER_ATTACKS||{}).transfer;
    if(active==='transfer'&&transferAttack&&transferAttack.updateNight6){
      const ts={heat:transferHeat,inside:transferInside};
      transferAttack.updateNight6(ts,{frame,ai:aiFor('transfer'),bar:$('rift-n6-transfer-bar'),label:$('rift-n6-transfer-stage'),hide:hideTransfer,scare:showTransferScare,finish:finishAttack,announce});
      transferHeat=ts.heat;transferInside=ts.inside;
    }
    nokaAI=Math.max(0,Number((window.RIFT_CURRENT_AI_LEVELS||{}).noka ?? ((((window.NIGHT_SETTINGS||{})[night]||{}).characters||{}).noka))||0);
    const nokaAttack=(window.RIFT_CHARACTER_ATTACKS||{}).noka;
    if(nokaAttack&&nokaAttack.updateNight6){
      const ns={crank,cam:nokaCam,threatTimer:nokaThreatTimer,moveTick:nokaMoveTick,lastTick:nokaLastTick};
      nokaAttack.updateNight6(ns,{frame,night,ai:nokaAI,now:Date.now,renderCrank,renderSprites,actionCheck:nokaActionCheck,
        emit:(name,detail)=>window.dispatchEvent(new CustomEvent(name,{detail}))});
      crank=ns.crank;nokaCam=ns.cam;nokaThreatTimer=ns.threatTimer;nokaMoveTick=ns.moveTick;nokaLastTick=ns.lastTick;
    }
    // Flux is handled by character-ai-system.js on every night.
  }
  function onDoor(e){
    const d=e.detail||{};
    if(!active&&!fluxAtDoor&&!(nokaAI>0&&nokaThreatTimer>0))return;
    if(nokaAI>0&&nokaThreatTimer>0&&d.elevenEventActive&&(d.rightClosed||frame.rightClosed)){nokaThreatTimer=0;nokaMoveTick=0;nokaCam=13;crank=Math.max(1,crank);nokaLastTick=Date.now();renderCrank();renderSprites();announce('十一的异常期间，右门暂时挡住了诺卡');}
    if(fluxAtDoor&&(d.leftClosed||d.rightClosed||frame.leftClosed||frame.rightClosed)){fluxAtDoor=false;fluxThreat=0;fluxDelay=0;announce('闪流被门挡住，暂时退开');renderFlux();}
    const closedLeft=!!(d.leftClosed||frame.leftClosed), closedRight=!!(d.rightClosed||frame.rightClosed);
    const doorDefense={gu:closedLeft,chillo:closedRight};
    if(active && doorDefense[active])finishAttack(true,'shared-door-defense');
  }
  function onCrank(e){const d=e&&e.detail||{};crank=Math.max(0,Math.min(5,Number(d.value)||0));nokaThreatTimer=0;nokaMoveTick=0;nokaCam=13;nokaLastTick=Date.now();renderCrank();renderSprites();}
  function onFlash(){if(active==='lobe'&&frame.camOpen&&Number(frame.camId)===10)finishAttack(true,'cam10-flash');}
  function onMonitor(e){
    const d=e.detail||{};
    frame.camOpen=!!d.open;frame.camId=Number(d.camId)||frame.camId;
    syncDeviceVisibility();
    if(active==='flux'&&d.open===false)finishAttack(true,'monitor-closed');
  }
  function resetNight(e){
    night=Number(e.detail&&e.detail.night)||0;locked=false;active=null;activeId='';defended.clear();activeCam=1;routeIndex=0;routeClock=0;attackClock=0;
    crank=5;nokaCam=13;nokaMoveTick=0;nokaAI=Math.max(0,Number((((window.NIGHT_SETTINGS||{})[night]||{}).characters||{}).noka)||0);nokaThreatTimer=0;transferHeat=0;transferInside=false;fluxCam=2+Math.floor(Math.random()*10);if(fluxCam===10||fluxCam===13)fluxCam=9;fluxLookSince=0;fluxTextShown=false;fluxDelay=0;fluxThreat=0;fluxAtDoor=false;nokaLastTick=Date.now();flashReadyAt=0;renderCrank();hideTransfer();
    renderSprites();ensureDevices();
  }
  window.addEventListener('rift:night-six-eleven-room-event',e=>{
    const d=e.detail||{};
    if(Number(d.night)!==6||!d.characterId)return;
    const id=d.characterId;
    announce('十一进入'+(d.roomName||'未知房间')+'，发现'+(d.characterName||id)+'！'+(d.hint||'注意附近异常。'));
    window.dispatchEvent(new CustomEvent('rift:character-status',{detail:{
      characterId:id,status:'eleven-room-encounter',room:d.room,camId:d.camId
    }}));
    // 触发角色原有的专属机制，而不只是显示通用提示。
    if(id==='tannin'){
      // Eleven's encounter only makes Tannin more eager to use his existing charge.
      // It does not create a second attack route or alter the player's defense rules.
      window.dispatchEvent(new CustomEvent('rift:tannin-aggression-increased',{
        detail:{night:6,source:'eleven-room-encounter',room:d.room,camId:d.camId}
      }));
      announce('塔宁的攻击欲望变强了，但仍按原本的路线和方式行动。');
    } else if(mutationOrder.includes(id)){
      window.dispatchEvent(new CustomEvent('rift:night-six-mutation-attack',{
        detail:{night:6,characterId:id,mutationId:'eleven-room-'+String(d.room||'').replace(/[^a-z0-9_-]/gi,'')}
      }));
    } else if(id==='noka'){
      nokaThreatTimer=0;
      nokaMoveTick=0;
      window.dispatchEvent(new CustomEvent('rift:night-six-noka-eleven-encounter',{
        detail:{night:6,room:d.room,camId:d.camId,crank,value:crank}
      }));
      announce('诺卡专属事件：十一闯入了诺卡所在区域！留意音乐盒发条。');
    } else if(id==='transfer'){
      window.dispatchEvent(new CustomEvent('rift:night-six-transfer-eleven-encounter',{
        detail:{night:6,room:d.room,camId:d.camId}
      }));
    } else {
      window.dispatchEvent(new CustomEvent('rift:night-six-character-eleven-encounter',{
        detail:{night:6,characterId:id,room:d.room,camId:d.camId}
      }));
    }
  });
  window.addEventListener('rift:night-start',resetNight);
  window.addEventListener('rift:night-six-mutation-attack',e=>beginAttack(e.detail));
  window.addEventListener('rift:night-ai-levels-changed',e=>{const v=e.detail&&e.detail.values||{};nokaAI=Math.max(0,Number(v.noka)||0);renderSprites();});
  window.addEventListener('rift:noka-enter-room',e=>{const cam=Number(e.detail&&e.detail.camId);if(active&&activeCam===cam){const route=routes[active]||[];if(routeIndex<route.length-1){routeIndex++;activeCam=route[routeIndex];routeClock=0;renderActiveAtCam();}}});
  window.addEventListener('rift:night-six-others-return',()=>{locked=true;active=null;const office=$('rift-n6-office-attacker');if(office)office.style.display='none';renderSprites();});
  window.addEventListener('rift:night-six-eleven-awakened',()=>{locked=false;renderSprites();});
  window.addEventListener('rift:flux-priority-scare-start',()=>{fluxPauseStartedAt=Date.now();});
  window.addEventListener('rift:flux-priority-scare-end',()=>{
    if(!fluxPauseStartedAt)return;
    const pausedFor=Date.now()-fluxPauseStartedAt;fluxPauseStartedAt=0;
    if(nokaLastTick)nokaLastTick+=pausedFor;
    if(flashReadyAt)flashReadyAt+=pausedFor;
  });
  window.addEventListener('rift:game-frame',onFrame);
  window.addEventListener('rift:night-six-door-change',onDoor);
  window.addEventListener('rift:night-six-crank',onCrank);
  window.addEventListener('rift:night-six-flash',onFlash);
  window.addEventListener('rift:monitor-toggle',onMonitor);
  window.addEventListener('rift:night-six-mutation-defended',hideTransfer);
  window.addEventListener('rift:night-six-mutation-resolved',hideTransfer);
  window.RIFT_NIGHT6_CHARACTER_SYSTEM=Object.freeze({
    getState:()=>({night,locked,active,activeCam,crank,nokaCam,transferHeat,defended:Array.from(defended)}),
    reset:()=>resetNight({detail:{night:6}}),
    forceMutation:characterId=>{if(night!==6||!mutationOrder.includes(characterId))return false;beginAttack({characterId,mutationId:'debug-'+characterId});return active===characterId;},
    forceNokaCamera:cam=>{if(night!==6&&nokaAI<=0)return false;nokaCam=Math.max(1,Math.min(12,Number(cam)||1));renderSprites();return true;},
    setCrank:value=>{onCrank({detail:{value:Number(value),camId:13}});window.dispatchEvent(new CustomEvent('rift:night-six-crank',{detail:{value:crank,max:5,camId:13,debug:true}}));return crank;},
    triggerFlash:()=>onFlash()
  });
  ensureDevices();
})();
