/* Chillo attack behavior: CAM06 -> CAM03 -> right doorway; right door is the defense. */
window.RIFT_CHARACTER_ATTACKS=window.RIFT_CHARACTER_ATTACKS||{};
window.RIFT_CHARACTER_ATTACKS.chillo=Object.freeze({
 id:'chillo',homeCam:6,interval:18,route:[6,3,1],doorSide:'right',
 moveBetweenNodesSeconds:7,doorWarningSeconds:8,defense:'close-right-door',
 night6ControlledBy:'night-six-character-system'
});
window.RIFT_CHARACTER_ATTACKS.chillo=Object.freeze({...window.RIFT_CHARACTER_ATTACKS.chillo,
 update(a,dt,api){
  if(a.phase!=='moving')return;a.timer-=dt;if(a.timer>0)return;
  if(a.cam===6){a.cam=3;a.timer=api.pace(7,a.id);api.render(a);}
  else{a.phase='door';a.deadline=Date.now()+api.pace(8000,a.id);api.emit('rift:character-at-door',{characterId:'chillo',side:'right',visualSide:'right'});}
 }
});
