/* Gu attack behavior: CAM04 -> CAM05 -> left doorway; left door is the defense. */
window.RIFT_CHARACTER_ATTACKS=window.RIFT_CHARACTER_ATTACKS||{};
window.RIFT_CHARACTER_ATTACKS.gu=Object.freeze({
 id:'gu',homeCam:4,interval:16,route:[4,5,1],doorSide:'left',
 moveBetweenNodesSeconds:7,doorWarningSeconds:8,defense:'close-left-door',
 night6ControlledBy:'night-six-character-system'
});
window.RIFT_CHARACTER_ATTACKS.gu=Object.freeze({...window.RIFT_CHARACTER_ATTACKS.gu,
 update(a,dt,api){
  if(a.phase!=='moving')return;a.timer-=dt;if(a.timer>0)return;
  if(a.bonusCam2&&a.cam===2){a.cam=4;a.timer=api.pace(7,a.id);api.render(a);}
  else if(a.cam===4){a.cam=5;a.timer=api.pace(7,a.id);api.render(a);}
  else{a.bonusCam2=false;a.phase='door';a.deadline=Date.now()+api.pace(8000,a.id);api.renderDoorThreat(a);api.emit('rift:character-at-door',{characterId:'gu',side:'left'});}
 }
});
