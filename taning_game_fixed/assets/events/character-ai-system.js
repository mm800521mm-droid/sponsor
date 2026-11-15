/*
 * Rift Ash - Shared character AI for Nights 1-5.
 * Night 6 one-shot mutations remain owned by night-six-character-system.js.
 * AI values are read from NIGHT_SETTINGS and are never changed here.
 */
(() => {
  'use strict';
  const names = { flux:'闪流', noka:'诺卡', lobe:'耳机', gu:'孤', chillo:'寒零' };
  const state = {
    night:0, running:false, camOpen:false, camId:1,
    leftClosed:false, rightClosed:false, elapsed:0,
    actors:{}, lastFrame:0, crank:5, nokaTimer:0, noka:{cam:13,wind:5,decay:0,threat:0,moveTick:0,el:null}
  };
  const $ = id => document.getElementById(id);
  const emit = (name, detail={}) => window.dispatchEvent(new CustomEvent(name,{detail}));
  const aiFor = id => Math.max(0,Math.min(20,Number((((window.NIGHT_SETTINGS||{})[state.night]||{}).characters||{})[id])||0));
  const chance = id => typeof window.riftCanCharacterMove==='function' ? window.riftCanCharacterMove(aiFor(id)) : Math.random()*100 < aiFor(id)*5;
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
    if(!a || aiFor(a.id)<=0 || state.night===6)return;
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
    a.el.querySelector('.figure').textContent=glyph;
    a.el.querySelector('.tag').textContent=names[a.id]+' // CAM '+String(cam).padStart(2,'0');
    a.el.style.display=state.night>0&&a.phase!=='idle'?'flex':'none';
  }
  function renderNoka(){
    const n=state.noka;
    if(state.night===6||aiFor('noka')<=0){if(n.el){n.el.remove();n.el=null;}return;}
    const feed=$('feed-'+n.cam);if(!feed)return;
    if(n.el&&n.el.parentElement!==feed){n.el.remove();n.el=null;}
    if(!n.el){n.el=document.createElement('div');n.el.className='rift-shared-character rift-shared-noka';n.el.innerHTML='<div class="figure">♫</div><div class="tag"></div>';feed.appendChild(n.el);}
    n.el.querySelector('.tag').textContent='诺卡 // CAM '+String(n.cam).padStart(2,'0');
    n.el.style.display='flex';
  }
  function moveNoka(){
    const cams=[1,2,3,4,5,6,7,8,9,10,11,12];let next=cams[Math.floor(Math.random()*cams.length)];if(next===state.noka.cam)next=next===12?1:next+1;
    state.noka.cam=next;renderNoka();emit('rift:noka-enter-room',{camId:next,night:state.night});
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
          a.threat=0;a.phase='delay';a.deadline=Date.now()+22000;a.timer=0;a.look=0;
          emit('rift:character-status',{characterId:'flux',status:'delayed'});
          const close=$('btnCamClose');if(close)close.click();
        }else{
          a.threat++;a.phase='approach';
          if(a.threat>=2){a.phase='door';a.deadline=Date.now()+9000;}
        }
        box.remove();a.choiceEl=null;render(a);
      });
      box.appendChild(button);
    });
    a.choiceEl=box;feed.appendChild(box);
  }
  function clearChoice(a){if(a.choiceEl){a.choiceEl.remove();a.choiceEl=null;}}
  function startActor(a){
    a.phase='moving';a.timer=a.interval;a.threat=0;a.look=0;
    if(a.id==='flux'){
      const cams=[2,3,4,5,6,7,8,9,11,12];
      a.cam=cams[Math.floor(Math.random()*cams.length)];
    } else a.cam=a.home;
    render(a);
    emit('rift:character-appearance',{characterId:a.id,camId:a.cam});
  }
  function returnActor(a){
    clearChoice(a);a.phase='idle';a.cam=a.home;a.threat=0;a.look=0;a.deadline=0;
    removeActorVisual(a);
    emit('rift:character-returned',{characterId:a.id});
  }
  function fail(a,reason){
    emit('rift:character-jumpscare',{characterId:a.id,name:names[a.id],reason});
    returnActor(a);
  }
  function handleDoor(){
    for(const a of Object.values(state.actors)){
      if(a.phase!=='door')continue;
      const safe=a.id==='gu'?state.leftClosed:a.id==='chillo'?state.rightClosed:false;
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
    if(!state.running)return;
    const dt=Math.min(.1,Math.max(0,Number(d.dt)||0));
    if(state.night!==6 && aiFor('noka')>0){
      const n=state.noka;
      if(n.wind>0){n.decay+=dt;if(n.decay>=12){n.wind=Math.max(0,n.wind-1);n.decay=0;}}
      if(n.wind===0){n.threat+=dt;if(n.threat>=n.moveTick+3.5&&n.threat<12){n.moveTick+=3.5;moveNoka();}if(n.threat>=12){emit('rift:character-jumpscare',{characterId:'noka',name:'诺卡',reason:'music-box-unwound'});n.threat=0;}}
      else{n.threat=0;n.moveTick=0;}
      renderNoka();
    }
    for(const a of Object.values(state.actors)){
      if(state.night===6 && a.id!=='flux')continue;
      if(aiFor(a.id)<=0)continue;
      if(a.phase==='idle'){
        a.timer-=dt;
        if(a.timer<=0){if(chance(a.id))startActor(a);else a.timer=a.interval;}
        continue;
      }
      if(a.phase==='delay'){
        if(Date.now()>=a.deadline){a.phase='moving';a.timer=a.interval;}
        continue;
      }
      if(a.id==='flux'){
        if(a.phase==='moving'){
          a.timer-=dt;
          if(a.timer<=0){a.phase='approach';a.deadline=Date.now()+16000;}
        }
        if(a.phase==='moving' && state.camOpen && state.camId===a.cam){
          a.look+=dt;
          if(a.look>=1.25)showFluxChoice(a);
        }
        if(a.phase==='moving' && a.look>=1.25 && !a.choiceEl && (!state.camOpen||state.camId!==a.cam)){
          a.look=0;
        }
        if(a.phase==='approach'){
          a.deadline=a.deadline||Date.now()+16000;
          if(Date.now()>=a.deadline){a.phase='door';a.deadline=Date.now()+9000;}
        }
        if(a.phase==='door' && !state.leftClosed && !state.rightClosed && Date.now()>=a.deadline)fail(a,'flux-door-timeout');
      } else if(a.phase==='moving'){
        a.timer-=dt;
        if(a.timer<=0){
          if(a.id==='gu'){
            if(a.cam===4){a.cam=5;a.timer=7;render(a);}
            else{a.phase='door';a.deadline=Date.now()+8000;emit('rift:character-at-door',{characterId:'gu',side:'left'});}
          }else if(a.id==='chillo'){
            if(a.cam===6){a.cam=3;a.timer=7;render(a);}
            else{a.phase='door';a.deadline=Date.now()+8000;emit('rift:character-at-door',{characterId:'chillo',side:'right',visualSide:'left'});}
          }else if(a.id==='lobe'){
            a.phase='flash-window';a.deadline=Date.now()+6500;
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
    const d=e.detail||{};state.camOpen=!!d.open;state.camId=Number(d.camId)||state.camId;
    const flux=state.actors.flux;
    if(flux && !state.camOpen && flux.phase==='moving' && flux.look>0){
      if(flux.choiceEl){clearChoice(flux);flux.threat++;flux.phase=flux.threat>=2?'door':'approach';flux.deadline=Date.now()+(flux.phase==='door'?9000:12000);}
      else{flux.look=0;flux.phase='delay';flux.deadline=Date.now()+20000;}
    }
  }
  function onFlash(e){
    const d=e.detail||{};
    const a=state.actors.lobe;
    if(state.night!==6 && a && a.phase==='flash-window' && Number(d.camId)===10){
      returnActor(a);emit('rift:character-status',{characterId:'lobe',status:'flashed'});
    }
  }
  function onDoorChange(e){
    const d=e.detail||{};state.leftClosed=!!d.leftClosed;state.rightClosed=!!d.rightClosed;handleDoor();
  }
  function onCrank(e){
    const d=e.detail||{};
    state.crank=Math.max(0,Math.min(5,Number(d.value)||0));
    if(state.night!==6 && aiFor('noka')>0){state.noka.wind=state.crank;state.noka.decay=0;state.noka.threat=0;state.noka.moveTick=0;state.noka.cam=13;renderNoka();}
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
      if(a.id==='gu'){a.cam=a.cam===4?5:1;a.phase=a.cam===1?'door':'moving';a.timer=0;a.deadline=Date.now()+8000;}
      else if(a.id==='chillo'){a.cam=a.cam===6?3:1;a.phase=a.cam===1?'door':'moving';a.timer=0;a.deadline=Date.now()+8000;}
      else if(a.id==='lobe'){returnActor(a);continue;}
      render(a);
      emit('rift:character-skipped-by-noka',{characterId:a.id,camId:cam,nextCamId:a.cam});
    }
  }
  function reset(e){
    if(state.noka&&state.noka.el)state.noka.el.remove();document.querySelectorAll('.rift-shared-noka').forEach(el=>el.remove());
    state.night=Number(e.detail&&e.detail.night)||0;
    state.running=false;state.camOpen=false;state.camId=1;state.leftClosed=false;state.rightClosed=false;
    state.actors=actorList();
    Object.values(state.actors).forEach(a=>{removeActorVisual(a);a.timer=a.interval;});
    state.crank=5;state.nokaTimer=0;state.noka={cam:13,wind:5,decay:0,threat:0,moveTick:0,el:null};renderNoka();
  }
  window.addEventListener('rift:night-start',reset);
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
    emit('rift:night-six-time-rollback',{hours,characterId:'lobe'});
  });
  window.RIFT_SHARED_CHARACTER_AI=Object.freeze({getState:()=>({night:state.night,actors:Object.fromEntries(Object.entries(state.actors).map(([id,a])=>[id,{phase:a.phase,cam:a.cam,threat:a.threat}]))})});
  window.addEventListener('rift:night-start',()=>{});
})();