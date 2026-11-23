/* Rift Ash - Night completion and next-night flow. */
(() => {
 'use strict';
 const KEY='riftAsh.highestNight', MAX=6, wait=ms=>new Promise(r=>setTimeout(r,ms));
 function getHighestNight(){try{const n=Number(localStorage.getItem(KEY));return Number.isInteger(n)?Math.max(1,Math.min(MAX,n)):1;}catch(_){return 1;}}
 function saveHighestNight(n){try{localStorage.setItem(KEY,String(Math.max(getHighestNight(),Math.min(MAX,n))));}catch(_){}}
 async function completeNight({night,startNight}){
  const next=Number(night)+1;if(next<=MAX)saveHighestNight(next);
  const root=document.getElementById('night-clear-overlay'),clock=document.getElementById('clear-title'),sub=document.getElementById('clear-subtitle');
  if(!root||!clock||!sub){if(next<=MAX&&typeof startNight==='function'){if(next<6&&window.RIFT_LORE_SYSTEM)window.RIFT_LORE_SYSTEM.beginShift(next,()=>startNight(next));else startNight(next);}return;}
  root.classList.remove('show','rift-clock-flip','rift-night-clear');clock.textContent='7 AM';sub.textContent='';
  void root.offsetWidth;root.classList.add('show','rift-clock-flip');await wait(1050);
  clock.textContent='8 AM';root.classList.add('rift-night-clear');sub.textContent='NIGHT '+night+' COMPLETE';await wait(2300);
  if(next>MAX||typeof startNight!=='function'){root.classList.remove('show','rift-clock-flip','rift-night-clear');if(window.RIFT_LORE_SYSTEM&&typeof window.RIFT_LORE_SYSTEM.showEnding==='function'){await window.RIFT_LORE_SYSTEM.showEnding();}else{sub.textContent='ALL AVAILABLE NIGHTS COMPLETE';await wait(2600);}window.dispatchEvent(new CustomEvent('rift:return-to-menu'));return;}
  root.classList.remove('show','rift-clock-flip','rift-night-clear');
  let card=document.getElementById('rift-next-night-card');
  if(!card){card=document.createElement('div');card.id='rift-next-night-card';card.innerHTML='<div class="rift-next-night-kicker">SHIFT CONTINUES</div><div class="rift-next-night-number"></div>';document.body.appendChild(card);}
  card.querySelector('.rift-next-night-number').textContent='NIGHT '+next;card.classList.remove('active');void card.offsetWidth;card.classList.add('active');
  await wait(2300);card.classList.remove('active');await wait(350);
  if(Number(night)===5){
   let message=document.getElementById('rift-fifth-night-message');
   if(!message){message=document.createElement('div');message.id='rift-fifth-night-message';message.innerHTML='<div class="rift-fifth-night-text">午安，我想跟你玩玩</div>';document.body.appendChild(message);}
   message.classList.remove('active');void message.offsetWidth;message.classList.add('active');
   await wait(4200);message.classList.remove('active');await wait(250);
  }
  if(next<6&&window.RIFT_LORE_SYSTEM){window.RIFT_LORE_SYSTEM.beginShift(next,()=>startNight(next));}else{startNight(next);}
 }
 window.RIFT_NIGHT_TRANSITIONS=Object.freeze({getHighestNight,completeNight});
})();