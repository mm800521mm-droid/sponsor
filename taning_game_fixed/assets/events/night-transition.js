/* Rift Ash - Night completion and next-night flow. */
(() => {
 'use strict';
 const KEY='riftAsh.highestNight', MAX=6, wait=ms=>new Promise(r=>setTimeout(r,ms));
 function getHighestNight(){try{const n=Number(localStorage.getItem(KEY));return Number.isInteger(n)?Math.max(1,Math.min(MAX,n)):1;}catch(_){return 1;}}
 function saveHighestNight(n){try{localStorage.setItem(KEY,String(Math.max(getHighestNight(),Math.min(MAX,n))));}catch(_){}}
 async function completeNight({night,startNight}){
  const root=document.getElementById('night-clear-overlay'),clock=document.getElementById('clear-title'),sub=document.getElementById('clear-subtitle');
  if(!root||!clock||!sub)return;
  const next=Number(night)+1;if(next<=MAX)saveHighestNight(next);
  root.classList.remove('show','rift-clock-flip','rift-night-clear');clock.textContent='7 AM';sub.textContent='';
  void root.offsetWidth;root.classList.add('show','rift-clock-flip');await wait(1050);
  clock.textContent='8 AM';root.classList.add('rift-night-clear');sub.textContent='NIGHT '+night+' COMPLETE';await wait(2300);
  if(next>MAX||typeof startNight!=='function'){sub.textContent='ALL AVAILABLE NIGHTS COMPLETE';await wait(2600);root.classList.remove('show','rift-clock-flip','rift-night-clear');window.dispatchEvent(new CustomEvent('rift:return-to-menu'));return;}
  root.classList.remove('show','rift-clock-flip','rift-night-clear');
  let card=document.getElementById('rift-next-night-card');
  if(!card){card=document.createElement('div');card.id='rift-next-night-card';card.innerHTML='<div class="rift-next-night-kicker">SHIFT CONTINUES</div><div class="rift-next-night-number"></div>';document.body.appendChild(card);}
  card.querySelector('.rift-next-night-number').textContent='NIGHT '+next;card.classList.remove('active');void card.offsetWidth;card.classList.add('active');
  await wait(2300);card.classList.remove('active');await wait(350);startNight(next);
 }
 window.RIFT_NIGHT_TRANSITIONS=Object.freeze({getHighestNight,completeNight});
})();