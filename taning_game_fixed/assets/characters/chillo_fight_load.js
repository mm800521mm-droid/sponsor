/* 寒零：从左门发动攻击；玩家只能在对侧的右门监控（CAM06）看到他，防御时关闭左门。 */
window.RIFT_CHARACTER_ATTACKS=window.RIFT_CHARACTER_ATTACKS||{};
window.RIFT_CHARACTER_ATTACKS.chillo=Object.freeze({
 id:'chillo',homeCam:6,interval:18,route:[6,3,1],doorSide:'left',monitorSide:'right',monitorCam:6,
 moveBetweenNodesSeconds:7,doorWarningSeconds:8,defense:'close-left-door',
 night6ControlledBy:'night-six-character-system'
});
window.RIFT_CHARACTER_ATTACKS.chillo=Object.freeze({...window.RIFT_CHARACTER_ATTACKS.chillo,
 update(a,dt,api){
  if(a.phase!=='moving')return;a.timer-=dt;if(a.timer>0)return;
  if(a.cam===6){a.cam=3;a.timer=api.pace(7,a.id);api.render(a);}
  else{a.phase='door';a.cam=6;a.deadline=Date.now()+api.pace(8000,a.id);api.render(a,6);api.emit('rift:character-at-door',{characterId:'chillo',side:'left',visualSide:'right',monitorCam:6});}
 }
});
