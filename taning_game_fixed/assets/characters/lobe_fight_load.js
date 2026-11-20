/* Lobe attack behavior: CAM10 flash window; missed response rolls the clock back one hour. */
window.RIFT_CHARACTER_ATTACKS=window.RIFT_CHARACTER_ATTACKS||{};
window.RIFT_CHARACTER_ATTACKS.lobe=Object.freeze({
 id:'lobe',homeCam:10,interval:32,route:[10],trigger:'cam10-flash-window',
 defense:'flash-on-cam10',responseBaseSeconds:8,responsePerAI:.25,
 minimumResponseSeconds:3,timeoutEffect:Object.freeze({type:'time-rollback',hours:1}),
 night6ControlledBy:'night-six-character-system'
});
window.RIFT_CHARACTER_ATTACKS.lobe=Object.freeze({...window.RIFT_CHARACTER_ATTACKS.lobe,
 update(a,dt,api){
  if(a.phase==='moving'){
   a.timer-=dt;
   if(a.timer<=0){
   a.phase='flash-window';const policy=(window.RIFT_CHARACTER_AI_POLICIES||{}).lobe;
   const seconds=policy&&policy.responseSeconds?policy.responseSeconds(api.ai('lobe')):Math.max(3,8-api.ai('lobe')*.25);
   a.deadline=Date.now()+seconds*1000;
   api.emit('rift:lobe-warning-start',{seconds,ai:api.ai('lobe')});
   api.emit('rift:character-at-door',{characterId:'lobe',side:'cam10'});
   }
  }
  if(a.phase==='flash-window'&&Date.now()>=a.deadline){
   api.emit('rift:lobe-warning-clear',{reason:'timeout'});
   api.emit('rift:character-time-rollback',{characterId:'lobe',hours:1});
   api.returnActor(a);
  }
 }
});
