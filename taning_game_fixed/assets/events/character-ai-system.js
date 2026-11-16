/*
 * Rift Ash - Shared character AI for Nights 1-5.
 * Night 6 one-shot mutations remain owned by night-six-character-system.js.
 * AI values are read from NIGHT_SETTINGS and are never changed here.
 */
(() => {
  'use strict';
  const names = { flux:'闪流', noka:'诺卡', lobe:'耳机', gu:'孤', chillo:'寒零' };
  const suspended = new Set();
  const state = {
    night:0, running:false, camOpen:false, camId:1,
    leftClosed:false, rightClosed:false, elapsed:0,
    actors:{}, lastFrame:0, crank:5, nokaTimer:0
  };
  const $ = id => document.getElementById(id);
  const emit = (name, detail={}) => window.dispatchEvent(new CustomEvent(name,{detail}));
  const aiFor = id => Math.max(0,Math.min(20,Number((window.RIFT_CURRENT_AI_LEVELS||{})[id] ?? ((((window.NIGHT_SETTINGS||{})[state.night]||{}).characters||{})[id]))||0));
  const chance = id => typeof window.riftCanCharacterMove==='function' ? window.riftCanCharacterMove(aiFor(id)) : Math.random()*100 < aiFor(id)*5;
  // Nights 1-5 become progressively more aggressive without changing AI probability.
  const pace = seconds => seconds / (1 + Math.max(0, state.night - 1) * 0.12);
  const makeActor = (id, cam, interval) => ({id,cam,home:cam,interval,timer:interval,phase:'idle',threat:0,look:0,deadline:0,clearWord:'',words:[],el:null});
  function actorList(){
    return {
      flux:makeActor('flux',2,13),
      lobe:makeActor('lobe',10,17),
      gu:makeActor('gu',4,16),
      chillo:makeActor('chillo',6,18)
    };
  }
  function removeActorVisual(a){
    if(a.el){a.el.remove();a.el=null;}
    document.querySelectorAll('[data-rift-shared-character="'+a.id+'"]').forEach(el=>el.remove());
  }
  function render(a,camOverride){
    if(!a)return;
    
    if(aiFor(a.id)<=0){removeActorVisual(a);return;}
    const cam=Number(camOverride||a.cam);
    const feed=$('feed-'+cam);
    if(!feed)return;
    if(a.el && a.el.parentElement!==feed){a.el.remove();a.el=null;}
    if(!a.el){
      a.el=document.createElement('div');
      a.el.className='rift-shared-character rift-shared-'+a.id;
      a.el.dataset.riftSharedCharacter=a.id;
      a.el.innerHTML='<div class="figure"></div><div class="tag"></div>';
      feed.appendChild(a.el);
    }
    const glyph={flux:'▣',lobe:'▤',gu:'▥',chillo:'❄'}[a.id];
    const figure=a.el.querySelector('.figure');
    if(window.RIFT_PIXEL_CHARACTERS) window.RIFT_PIXEL_CHARACTERS.mount(figure,a.id);
    else figure.textContent=glyph;
    a.el.querySelector('.tag').textContent=names[a.id]+' // CAM '+String(cam).padStart(2,'0')+(a.phase==='idle'?' // 待机':'');
    a.el.style.display=state.night>0?'flex':'none';
    a.el.style.opacity=a.phase==='idle'?'0.72':'1';
  }
  function showFluxChoice(a){
    if(a.choiceEl || !state.camOpen || state.camId!==a.cam)return;
    const feed=$('feed-'+a.cam); if(!feed)return;
    const words=['演','幕','场'];
    const correct=Math.floor(Math.random()*words.length);
    const box=document.createElement('div');box.className='rift-flux-choice';box.dataset.riftFluxShared='true';
    words.forEach((word,i)=>{
      const button=document.createElement('button');button.type='button';button.textContent=word;
      if(i===correct)button.classList.add('clear');
      button.addEventListener('click',()=>{
        if(i===correct){
          a.threat=0;a.phase='delay';a.deadline=Date.now()+pace(22000);a.timer=0;a.look=0;
          emit('rift:character-status',{characterId:'flux',status:'delayed'});
          const close=$('btnCamClose');if(close)close.click();
        }else{
          a.threat++;a.phase='approach';
          if(a.threat>=2){a.phase='door';a.deadline=Date.now()+pace(9000);}
        }
        box.remove();a.choiceEl=null;render(a);
      });
      box.appendChild(button);
    });
    a.choiceEl=box;feed.appendChild(box);
  }
  function clearChoice(a){if(a.choiceEl){a.choiceEl.remove();a.choiceEl=null;}}
  function syncFlashDevice(){
    if(state.night===6)return;
    const panel=$('camera-panel');if(!panel)return;
    let box=panel.querySelector('[data-device="flash"]');
    if(!box){
      box=document.createElement('div');box.className='rift-n6-device';box.dataset.device='flash';
      box.innerHTML='<div>CAM 10 // FLASH</div><div>耳机出现后5秒内闪光</div><button type="button">闪光</button>';
      panel.appendChild(box);
      box.querySelector('button').addEventListener('click',e=>{
        e.preventDefault();e.stopPropagation();
        if(!state.running||!state.camOpen||state.camId!==10||box.dataset.cooldown==='1')return;
        const lobeReady=state.actors.lobe&&state.actors.lobe.phase==='flash-window';
        const button=box.querySelector('button');
        if(lobeReady){box.dataset.cooldown='1';button.disabled=true;button.textContent='冷却 3s';let remaining=3;const cooldown=()=>{remaining--;if(remaining>0){button.textContent='冷却 '+remaining+'s';setTimeout(cooldown,1000);}else{box.dataset.cooldown='0';button.disabled=false;button.textContent='闪光';}};setTimeout(cooldown,1000);}
        const feed=$('feed-10');if(feed){feed.classList.remove('rift-cam10-flash');void feed.offsetWidth;feed.classList.add('rift-cam10-flash');setTimeout(()=>feed.classList.remove('rift-cam10-flash'),260);}
        emit('rift:night-six-flash',{camId:10,source:'shared-cam10-device'});
      });
    }
    box.style.display=state.running&&state.camOpen&&state.camId===10?'block':'none';
  }
  function startActor(a){
    a.phase='moving';a.timer=pace(a.interval);a.threat=0;a.look=0;
    if(a.id==='flux'){
      const cams=[2,3,4,5,6,7,8,9,11,12];
      a.cam=cams[Math.floor(Math.random()*cams.length)];
    } else a.cam=a.home;
    render(a);
    emit('rift:character-appearance',{characterId:a.id,camId:a.cam});
  }
  function returnActor(a){
    clearChoice(a);a.phase='idle';a.cam=a.home;a.timer=pace(a.interval);a.threat=0;a.look=0;a.deadline=0;a.bonusCam2=false;
    removeActorVisual(a);
    if(aiFor(a.id)>0)render(a);
    emit('rift:character-returned',{characterId:a.id});
  }
  function fail(a,reason){
    emit('rift:character-jumpscare',{characterId:a.id,name:names[a.id],reason});
    returnActor(a);
  }
  function handleDoor(){
    for(const a of Object.values(state.actors)){
      if(a.phase==='door' && (state.leftClosed||state.rightClosed) && ['gu','chillo','flux'].includes(a.id)){
        returnActor(a);
        emit('rift:shared-defense',{method:'door',side:a.id==='gu'?'left':a.id==='chillo'?'right':'either',source:a.id});
        emit('rift:character-status',{characterId:a.id,status:'repelled'});
      }
    }
    for(const a of Object.values(state.actors)){
      if(a.phase!=='door')continue;
      const safe=(a.id==='gu'||a.id==='chillo'||a.id==='flux')&&(state.leftClosed||state.rightClosed);
      if(a.id==='flux'){
        if(state.leftClosed||state.rightClosed){returnActor(a);emit('rift:character-status',{characterId:'flux',status:'repelled'});}
        else if(Date.now()>=a.deadline)fail(a,'flux-door-timeout');
      }else if(safe)returnActor(a);
      else if(Date.now()>=a.deadline)fail(a,'door-not-closed');
    }
  }
  function onFrame(event){
    const d=event.detail||{};
    state.running=!!d.running;state.camOpen=!!d.camOpen;state.camId=Number(d.camId)||1;
    state.leftClosed=!!d.leftClosed;state.rightClosed=!!d.rightClosed;
    syncFlashDevice();
    if(!state.running)return;
    const dt=Math.min(.1,Math.max(0,Number(d.dt)||0));
    for(const a of Object.values(state.actors)){
      if(suspended.has(a.id))continue;
      if(aiFor(a.id)<=0)continue;
      if(a.phase==='idle'){
        a.timer-=dt;
        if(a.timer<=0){if(chance(a.id))startActor(a);else a.timer=pace(a.interval);}
        continue;
      }
      if(a.phase==='delay'){
        if(Date.now()>=a.deadline){a.phase='moving';a.timer=pace(a.interval);}
        continue;
      }
      if(a.id==='flux'){
        if(a.phase==='moving'){
          a.timer-=dt;
          if(a.timer<=0){a.phase='approach';a.deadline=Date.now()+pace(16000);}
        }
        if(a.phase==='moving' && state.camOpen && state.camId===a.cam){
          a.look+=dt;
          if(a.look>=1.25)showFluxChoice(a);
        }
        if(a.phase==='moving' && a.look>=1.25 && !a.choiceEl && (!state.camOpen||state.camId!==a.cam)){
          a.look=0;
        }
        if(a.phase==='approach'){
          a.deadline=a.deadline||Date.now()+pace(16000);
          if(Date.now()>=a.deadline){a.phase='door';a.deadline=Date.now()+pace(9000);}
        }
        if(a.phase==='door' && !state.leftClosed && !state.rightClosed && Date.now()>=a.deadline)fail(a,'flux-door-timeout');
      } else if(a.phase==='moving'){
        a.timer-=dt;
        if(a.timer<=0){
          if(a.id==='gu'){
            if(a.bonusCam2 && a.cam===2){a.cam=4;a.timer=pace(7);render(a);}
            else if(a.cam===4){a.cam=5;a.timer=pace(7);render(a);}
            else{a.bonusCam2=false;a.phase='door';a.deadline=Date.now()+pace(8000);emit('rift:character-at-door',{characterId:'gu',side:'left'});}
          }else if(a.id==='chillo'){
            if(a.cam===6){a.cam=3;a.timer=pace(7);render(a);}
            else{a.phase='door';a.deadline=Date.now()+pace(8000);emit('rift:character-at-door',{characterId:'chillo',side:'right',visualSide:'left'});}
          }else if(a.id==='lobe'){
            a.phase='flash-window';a.deadline=Date.now()+5000;
            emit('rift:character-at-door',{characterId:'lobe',side:'cam10'});
          }
        }
      }else if(a.phase==='flash-window' && Date.now()>=a.deadline){
        emit('rift:character-time-rollback',{characterId:'lobe',hours:1});
        returnActor(a);
      }
    }
    handleDoor();
  }
  function onMonitor(e){
    const d=e.detail||{};state.camOpen=!!d.open;state.camId=Number(d.camId)||state.camId;syncFlashDevice();
    if(state.camOpen) for(const actor of Object.values(state.actors)) if(aiFor(actor.id)>0) render(actor);
    const flux=state.actors.flux;
    if(flux && !state.camOpen && flux.phase==='moving' && flux.look>0){
      if(flux.choiceEl){clearChoice(flux);flux.threat++;flux.phase=flux.threat>=2?'door':'approach';flux.deadline=Date.now()+(flux.phase==='door'?9000:12000);}
      else{flux.look=0;flux.phase='delay';flux.deadline=Date.now()+pace(20000);}
    }
  }
  function onFlash(e){
    const d=e.detail||{};
    const a=state.actors.lobe;
    // The CAM10 flashlight works for Lobe on every night, including Night 6.
    if(a && a.phase==='flash-window' && state.running && state.camOpen && state.camId===10 && Number(d.camId)===10){
      returnActor(a);emit('rift:character-status',{characterId:'lobe',status:'flashed'});
    }
  }
  function onDoorChange(e){
    const d=e.detail||{};state.leftClosed=!!d.leftClosed;state.rightClosed=!!d.rightClosed;handleDoor();
  }
  function onCrank(e){
    const d=e.detail||{};
    state.crank=Math.max(0,Math.min(5,Number(d.value)||0));
    // Noka's music skips other active characters out of the same camera.
    const room=Number(d.camId)||13;
    for(const a of Object.values(state.actors)){
      if(a.id!=='flux' && a.phase!=='idle' && a.cam===room){
        a.cam=a.id==='gu'?5:a.id==='chillo'?3:a.home;
        a.timer=0;
        render(a);
        emit('rift:character-skipped-by-noka',{characterId:a.id,camId:room,nextCamId:a.cam});
      }
    }
  }
  function onNokaEnter(event){
    const cam=Number(event.detail&&event.detail.camId);
    if(!Number.isInteger(cam))return;
    for(const a of Object.values(state.actors)){
      if(a.id==='flux'||a.phase==='idle'||a.cam!==cam)continue;
      if(a.id==='gu'){a.cam=a.cam===4?5:1;a.phase=a.cam===1?'door':'moving';a.timer=pace(7);a.deadline=Date.now()+pace(8000);}
      else if(a.id==='chillo'){a.cam=a.cam===6?3:1;a.phase=a.cam===1?'door':'moving';a.timer=pace(7);a.deadline=Date.now()+pace(8000);}
      else if(a.id==='lobe'){returnActor(a);continue;}
      render(a);
      emit('rift:character-skipped-by-noka',{characterId:a.id,camId:cam,nextCamId:a.cam});
    }
  }
  function reset(e){
    state.night=Number(e.detail&&e.detail.night)||0;
    state.running=false;state.camOpen=false;state.camId=1;state.leftClosed=false;state.rightClosed=false;
    suspended.clear();state.actors=actorList();
    Object.values(state.actors).forEach(a=>{removeActorVisual(a);a.timer=pace(a.interval);a.bonusCam2=false;if(aiFor(a.id)>0)render(a);});
    state.crank=5;state.nokaTimer=0;
    for(const a of Object.values(state.actors)){a.timer=pace(a.interval);a.bonusCam2=false;}
  }
  window.addEventListener('rift:night-start',reset);
  window.addEventListener('rift:night-six-mutation-attack',e=>{const id=e.detail&&e.detail.characterId;if(state.actors[id]){suspended.add(id);removeActorVisual(state.actors[id]);}});
  window.addEventListener('rift:night-six-mutation-resolved',e=>{const id=e.detail&&e.detail.characterId;if(state.actors[id]){suspended.delete(id);returnActor(state.actors[id]);}});
  window.addEventListener('rift:night-six-mutation-defended',e=>{const id=e.detail&&e.detail.characterId;if(state.actors[id]){suspended.add(id);removeActorVisual(state.actors[id]);}});
  window.addEventListener('rift:game-frame',onFrame);
  window.addEventListener('rift:monitor-toggle',onMonitor);
  window.addEventListener('rift:night-six-flash',onFlash);
  window.addEventListener('rift:night-six-door-change',onDoorChange);
  window.addEventListener('rift:night-six-crank',onCrank);
  window.addEventListener('rift:noka-music',onCrank);
  window.addEventListener('rift:noka-enter-room',onNokaEnter);
  window.addEventListener('rift:character-time-rollback',e=>{
    if(state.night===6)return;
    const hours=Math.max(1,Number(e.detail&&e.detail.hours)||1);
    emit('rift:night-six-time-rollback',{hours,characterId:'lobe',night:state.night});
    // A missed CAM10 flash brings Gu onto CAM02 before his usual route resumes.
    const gu=state.actors.gu;
    if(gu && aiFor('gu')>0){
      clearChoice(gu);gu.cam=2;gu.phase='moving';gu.timer=pace(5);gu.deadline=0;gu.threat=0;gu.bonusCam2=true;
      render(gu);emit('rift:character-appearance',{characterId:'gu',camId:2,source:'lobe-time-rollback'});
    }
  });
  window.RIFT_SHARED_CHARACTER_AI=Object.freeze({
    getState:()=>({night:state.night,actors:Object.fromEntries(Object.entries(state.actors).map(([id,a])=>[id,{phase:a.phase,cam:a.cam,threat:a.threat}]))}),
    force:(id,cam,phase='moving')=>{const a=state.actors[id];if(!a||(state.night===6&&id!=='flux'))return false;a.cam=Math.max(1,Math.min(14,Number(cam)||a.home));a.phase=phase==='door'?'door':'moving';a.timer=0;a.deadline=Date.now()+pace(12000);a.threat=0;render(a);return true;},
    resetActor:id=>{const a=state.actors[id];if(!a)return false;returnActor(a);return true;}
  });
  window.addEventListener('rift:night-ai-levels-changed',()=>{
    // Re-render idle actors too: their AI can rise from 0 at a timed stage.
    for(const actor of Object.values(state.actors)) render(actor);
  });
})();