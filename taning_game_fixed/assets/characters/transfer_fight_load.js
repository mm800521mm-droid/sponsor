/* Transfer attack behavior: existing three-stage pointer-contact threat; remains companion/group-owned. */
window.RIFT_CHARACTER_ATTACKS=window.RIFT_CHARACTER_ATTACKS||{};
window.RIFT_CHARACTER_ATTACKS.transfer=Object.freeze({
 id:'transfer',role:'companion',leader:'tannin',independentHostileAI:false,
 behavior:'pointer-contact-three-stage',stages:3,fillSeconds:3,
 fillPerSecond:.48,decayPerSecond:.18,
 defense:'avoid-pointer-contact',routeOwnedBy:'tannin'
});
window.RIFT_CHARACTER_ATTACKS.transfer=Object.freeze({...window.RIFT_CHARACTER_ATTACKS.transfer,
 updateNight6(s,api){
  const dt=Math.min(.1,Math.max(0,Number(api.frame.dt)||0))*(1+api.ai*.075);
  s.heat=s.inside?Math.min(3,s.heat+dt*.48):Math.max(0,s.heat-dt*.18);
  if(api.bar)api.bar.style.width=(s.heat/3*100)+'%';
  if(api.label)api.label.textContent='阶段 '+Math.min(3,Math.floor(s.heat+0.01))+' / 3';
  if(s.heat>=3){api.hide();api.scare();api.finish(false,'transfer-stage-three-jumpscare');api.announce('移交的三阶段已满！');}
 }
});
