/* Noka attack behavior: music-box crank, room migration, then unwound-box scare. */
window.RIFT_CHARACTER_ATTACKS=window.RIFT_CHARACTER_ATTACKS||{};
window.RIFT_CHARACTER_ATTACKS.noka=Object.freeze({
 id:'noka',homeCam:13,interval:24,requiresCrank:true,crankMaximum:5,
 drainBaseSeconds:24,drainPerAI:.9,minimumDrainSeconds:6,
 unpoweredMoveSeconds:3.5,unpoweredScareSeconds:12,
 movement:'random-camera',defense:'rewind-music-box',
 night6ControlledBy:'night-six-character-system'
});
window.RIFT_CHARACTER_ATTACKS.noka=Object.freeze({...window.RIFT_CHARACTER_ATTACKS.noka,
 updateNight6(s,api){
  const ai=Math.max(0,Number(api.ai)||0);
  const drainSeconds=Math.max(6,24-ai*.9);
  if(api.frame.running&&ai>0&&api.now()-s.lastTick>=drainSeconds*1000){
   s.crank=Math.max(0,s.crank-1);s.lastTick=api.now();api.renderCrank();
   api.emit('rift:night-six-noka-wind-level',{value:s.crank,max:5,calm:s.crank>0,ai,interval:drainSeconds*1000});
  }
  if(api.night>0&&api.frame.running&&ai>0){
   if(s.crank>0){s.threatTimer=0;s.moveTick=0;}
   else{
    s.threatTimer+=Math.min(.1,Math.max(0,Number(api.frame.dt)||0))*(1+ai*.075);
    if(s.threatTimer>=s.moveTick+3.5&&s.threatTimer<12){
     s.moveTick+=3.5;
     if(api.actionCheck()){
      let next=1+Math.floor(Math.random()*12);if(next===s.cam)next=next===12?1:next+1;
      s.cam=next;api.renderSprites();api.emit('rift:noka-enter-room',{detail:{camId:s.cam,night:api.night}});
     }
    }
    if(s.threatTimer>=12){s.threatTimer=0;s.moveTick=0;if(api.actionCheck())api.emit('rift:character-jumpscare',{detail:{characterId:'noka',name:'诺卡',reason:'music-box-unwound'}});}
   }
  }
 }
});
