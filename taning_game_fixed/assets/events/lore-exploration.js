/* Rift Ash optional pre-shift exploration, collectibles, independent story P routes.
   Narrative-only module: never reads or writes character AI, route, spawn, door or combat settings. */
(() => {
 'use strict';
 const SAVE='riftAsh.story.collectibles.v1', BRANCH='riftAsh.story.branch.v1';
 const rooms=[
  {id:'lobby',name:'后台入口',desc:'褪色的欢迎海报贴在门边，纸角被潮气卷起。',items:['poster','tape1']},
  {id:'music',name:'音乐室',desc:'旧式配乐设备仍摆在桌上，琴谱压在一只生锈的节拍器下面。',items:['score','tape2']},
  {id:'props',name:'道具仓库',desc:'旧幕布、演出道具和孩子们留下的涂鸦堆在一起。',items:['taning','tape3']},
  {id:'promo',name:'宣传部',desc:'海报卷筒和停用的广播设备靠墙摆放。',items:['chillo']},
  {id:'repair',name:'维修车间',desc:'拆开的机械外壳旁，夹着一张折过很多次的字条。',items:['lobe']},
  {id:'archive',name:'档案室',desc:'文件柜没有上锁，最深处的抽屉里塞着记者留下的草稿。',items:['gu','fragment1','fragment2']},
  {id:'office',name:'主管办公室外',desc:'门被封存。门缝里露出一张旧合照，旁边有一束干枯的花。',items:['photo','fragment3','fragment4']},
  {id:'hall',name:'后台走廊',desc:'走廊尽头通往最后的房间。门锁锈蚀严重，不要把这里当成普通储物间。',items:['fragment5']}
 ];
 const entries={
  poster:{title:'剧团旧海报',kind:'文字档案',text:'海报上是煜与沦陷的合照。照片角落有孩童歪扭的签名：十一、闪流、塔宁。背面写着：演出结束后，所有人都要回到后台。'},
  score:{title:'诺卡乐谱手稿',kind:'文字档案',text:'后半段的笔迹越来越慌乱。纸边有一行小字：我看见了，我逃不掉。'},
  lobe:{title:'耳机的离职字条',kind:'文字档案',text:'我只是回来看看老朋友。如果早知道会变成这样，我绝不会再踏入这里。'},
  gu:{title:'孤的记者笔记草稿',kind:'文字档案',text:'证据已经找到。沦陷拥有双重人格，全部惨剧都出自他手。我要把这些东西带出去。'},
  chillo:{title:'寒零的宣传部便签',kind:'文字档案',text:'大家都说夜里不要靠近后台。我一直以为那只是传言。广播设备又自己响了，明明电源已经拔掉。'},
  taning:{title:'塔宁的探险日记',kind:'文字档案',text:'我偷偷溜进木偶剧团后台，这里有好多漂亮木偶！我还没有找到出口，等我再往里面看看。'},
  photo:{title:'后台合伙人旧合照',kind:'文字档案',text:'照片里，煜站在舞台调度台旁，沦陷站在阴影里。照片背面写着：移动剧团后台总站，裂隙余烬。'},
  tape1:{title:'死入的隐藏磁带·残片 1',kind:'隐藏磁带',text:'它们不是机械故障。它们记得那天晚上，所有的声音。'},
  tape2:{title:'死入的隐藏磁带·残片 2',kind:'隐藏磁带',text:'十一和其余人偶不一样。它擅长制造假象，它想让你感受它当年体会到的恐惧。'},
  tape3:{title:'死入的隐藏磁带·残片 3',kind:'隐藏磁带',text:'诺卡不会主动追击你。但如果你靠近音乐室，你会听见她当晚听见的一切。'}
 };
 const fragments=[
  {id:'fragment1',title:'档案碎片 1',text:'一份被撕开的排班记录：煜很早就察觉到沦陷的异常。'},
  {id:'fragment2',title:'档案碎片 2',text:'一张维修申请单：主管办公室的记录被要求统一销毁。'},
  {id:'fragment3',title:'档案碎片 3',text:'一封没有寄出的信：我知道后台发生了什么，但我不能失去这里。'},
  {id:'fragment4',title:'档案碎片 4',text:'一页被水浸过的笔记：每次深夜回来，煜都会在旧舞台边留下鲜花。'},
  {id:'fragment5',title:'档案碎片 5',text:'信纸最后一行：我不知道自己是在守护剧团，还是在帮着掩埋罪孽。'}
 ];
 const story={
  main:{title:'裂隙余烬・主干',body:'天亮，你存活。你走出后台，黑暗里能看见人偶模糊的轮廓静静伫立。匿名举报送到警局，废墟被封锁，但没能找到遗骸。最后的房间里的真相依旧深埋，怨念只是暂时沉寂。'},
  A:{title:'救赎：裂隙余烬的终章',body:'你冒着被怨灵袭击的风险开启禁区大门。房间里没有血腥痕迹，只有褪色的演出道具和孩子们曾经写下的涂鸦纸条。十一的虚影浮在房间中央，怨恨慢慢松动。诺卡奏响当年排练用的温柔配乐，其余怨灵安静伫立。真相补全：沦陷的表层人格常年浸泡在愧疚中，只是没有勇气自首；煜多年来会悄悄回到废墟，在这里留下鲜花。你收集证据上交警方，沦陷表层人格选择自首，惨案公之于众。怨灵的执念慢慢消散，人偶不再在午夜苏醒。很久之后，废墟被改造成小型纪念展馆，墙面挂着剧团老旧海报。'},
  B:{title:'余烬不散：无人知晓的罪',body:'你选择保持远离，成功撑过第六夜后辞职离开裂隙余烬。回避真相让这里的怨念没有得到消解。后续接手夜班的看守接连失踪，十一的力量持续变强，怨灵永远困在后台轮回。沦陷的黑暗人格依旧潜藏，无人揭发。废墟彻底被世人遗忘，黑暗里，午夜的脚步声永远不会停歇。'}
 };
 let save={found:[],gallery:[],tapeRooms:null,branch:null,mainEnding:false};
 function read(){try{const v=JSON.parse(localStorage.getItem(SAVE)||'{}');save={...save,...v};}catch(_){} try{save.branch=localStorage.getItem(BRANCH)||save.branch||null;}catch(_){}}
 function write(){try{localStorage.setItem(SAVE,JSON.stringify(save));if(save.branch)localStorage.setItem(BRANCH,save.branch);}catch(_){}}
 function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
 let overlay,activeRoom=null,onEnter=null,shiftNight=1,currentPlace='corridor',nightStarted=false,lastElapsed=0,playerX=50,moveLeft=false,moveRight=false,nearbyAction=null,walkFrame=0,exploreThreat=null,threatX=100,threatNextAt=0,threatWarningAt=0,threatCooldown=0,threatLastUpdate=0,threatGraceUntil=0,threatScareUntil=0,threatFacing=1,preShiftDeadline=0,preShiftTimer=null;
 const mapNodes=[
  {n:1,id:'security',label:'保安室',x:50,y:84.5,kind:'place'},
  {n:2,id:'corridor',label:'后台走廊',x:50,y:44.8,kind:'place'},
  {n:3,id:'music',label:'音乐室',x:74,y:59,kind:'room'},
  {n:4,id:'props',label:'道具仓库',x:26,y:59,kind:'room'},
  {n:5,id:'promo',label:'宣传部',x:12,y:59,kind:'room'},
  {n:6,id:'repair',label:'维修车间',x:88,y:59,kind:'room'},
  {n:7,id:'archive',label:'档案室',x:12,y:84.5,kind:'room'},
  {n:8,id:'office',label:'主管办公室外',x:88,y:84.5,kind:'room'},
  {n:9,id:'lobby',label:'后台入口',x:30,y:15,kind:'room'},
  {n:10,id:'hall',label:'后台深处',x:70,y:15,kind:'room'},
  {n:11,id:'theater',label:'剧院大厅',x:50,y:15,kind:'place'},
  {n:12,id:'westWing',label:'西侧封存区',x:12,y:24,kind:'locked'},
  {n:13,id:'eastWing',label:'东侧封存区',x:88,y:24,kind:'locked'},
  {n:14,id:'lastRoom',label:'最后的房间',x:50,y:97,kind:'locked'}
 ];
 function ensure(){
  if(overlay)return;
  overlay=document.createElement('section');overlay.id='rift-exploration';
  overlay.innerHTML='<div class="rift-explore-shell"><div class="rift-stage-top"><div><span class="rift-eyebrow">RIFT ASH · BACKSTAGE ACCESS</span><div class="rift-current-location">后台走廊</div></div><div class="rift-stage-top-actions"><button class="rift-open-map" type="button">地图 / 01—14</button><button class="rift-codex-open" type="button">档案 / 分 P</button></div></div><div class="rift-map-frame"><div class="rift-map-topline"><span class="rift-scene-label">后台走廊</span><span class="rift-scene-hint">A / D 或 ← / → 移动 · E 互动</span></div><div class="rift-map-board rift-primary-map"><svg class="rift-map-lines" viewBox="0 0 400 390" preserveAspectRatio="none" aria-hidden="true"><g><path d="M200 330 V380 M200 330 H45 V230 H45 V95 H125 V55 H200 V55 H275 V95 H355 V230 H355 V330 H200 V175 M200 175 V55 M200 175 H105 V230 H105 V330 M200 175 H295 V230 H295 V330 M105 230 H45 M295 230 H355 M45 330 H105 M295 330 H355"/></g></svg><div class="rift-map-nodes"></div></div><div class="rift-map-instructions">选择与当前位置相连的房间编号进入调查。2 号为出生点，1 号为保安室。</div></div><main class="rift-room-view" hidden><div class="rift-room-heading"></div><div class="rift-room-desc"></div><div class="rift-room-items"></div></main><footer><div class="rift-explore-status"><span class="rift-countdown">进入保安室倒计时：00:45</span><span class="rift-collect-status"></span></div><div class="rift-explore-actions"><button class="rift-map-return" type="button" hidden>返回走廊</button></div></footer></div><div class="rift-modal" hidden></div><div class="rift-route-modal" hidden><div class="rift-route-card"><div class="rift-route-head"><b>后台区域路线图</b><button type="button" class="rift-route-close">关闭</button></div><div class="rift-map-board"><svg class="rift-map-lines" viewBox="0 0 400 390" preserveAspectRatio="none" aria-hidden="true"><g><path d="M200 330 V380 M200 330 H45 V230 H45 V95 H125 V55 H200 V55 H275 V95 H355 V230 H355 V330 H200 V175 M200 175 V55 M200 175 H105 V230 H105 V330 M200 175 H295 V230 H295 V330 M105 230 H45 M295 230 H355 M45 330 H105 M295 330 H355"/></g></svg><div class="rift-map-nodes"></div></div><p>2 号是出生点。靠近对应房门后按 E 进入；1 号为保安室，进入后立即开始当前夜晚。</p></div></div>';
  document.body.appendChild(overlay);
  overlay.querySelector('.rift-codex-open').addEventListener('click',showCodex);
  overlay.querySelector('.rift-map-return').addEventListener('click',()=>leaveRoom());
  overlay.querySelector('.rift-modal').addEventListener('click',e=>{if(e.target.classList.contains('rift-modal'))e.currentTarget.hidden=true;});
  overlay.querySelector('.rift-open-map').addEventListener('click',()=>{const m=overlay.querySelector('.rift-route-modal');m.hidden=false;});
  overlay.querySelector('.rift-route-close').addEventListener('click',()=>{overlay.querySelector('.rift-route-modal').hidden=true;});
  renderMap();renderStatus();
 }
 const walkDoors=[
  {id:'lobby',label:'后台入口',x:4,n:9},{id:'archive',label:'档案室',x:14,n:7},
  {id:'promo',label:'宣传部',x:24,n:5},{id:'props',label:'道具仓库',x:34,n:4},
  {id:'music',label:'音乐室',x:42,n:3},{id:'repair',label:'维修车间',x:58,n:6},
  {id:'office',label:'主管办公室外',x:68,n:8},{id:'hall',label:'后台深处',x:78,n:10},
  {id:'theater',label:'剧院大厅',x:88,n:11},{id:'security',label:'保安室',x:98,n:1,security:true}
 ];
 function ensureTapeRooms(){if(save.tapeRooms&&typeof save.tapeRooms==='object'&&!Array.isArray(save.tapeRooms))return;const ids=['lobby','music','props','promo','repair','archive'];save.tapeRooms={};const picks=[...ids].sort(()=>Math.random()-.5).slice(0,3);['tape1','tape2','tape3'].forEach((id,i)=>save.tapeRooms[id]=picks[i]);write();}
 function beginShift(night,callback){read();ensure();ensureTapeRooms();if(preShiftTimer){clearInterval(preShiftTimer);preShiftTimer=null;}shiftNight=Number(night)||1;onEnter=callback;nightStarted=false;activeRoom=null;currentPlace='corridor';lastElapsed=0;playerX=50;moveLeft=false;moveRight=false;exploreThreat=null;threatX=100;threatNextAt=0;threatWarningAt=0;threatCooldown=0;threatGraceUntil=Infinity;threatScareUntil=0;preShiftDeadline=Date.now()+45000;overlay.classList.add('active');overlay.querySelector('.rift-route-modal').hidden=true;showPlace('corridor');updatePreShiftCountdown();preShiftTimer=window.setInterval(updatePreShiftCountdown,200);const scene=overlay.querySelector('.rift-walk-scene');if(scene)scene.focus();return true;}
 function updatePreShiftCountdown(){if(!overlay||!overlay.classList.contains('active')||nightStarted)return;const remain=Math.max(0,Math.ceil((preShiftDeadline-Date.now())/1000));const clock=overlay.querySelector('.rift-countdown');if(clock)clock.textContent='进入保安室倒计时：00:'+String(remain).padStart(2,'0');if(remain<=0)enterSecurity();}
 function enterSecurity(){if(nightStarted)return;nightStarted=true;if(preShiftTimer){clearInterval(preShiftTimer);preShiftTimer=null;}const clock=overlay&&overlay.querySelector('.rift-countdown');if(clock)clock.textContent='正在进入保安室…';if(overlay)overlay.classList.remove('active');const cb=onEnter;onEnter=null;if(typeof cb==='function')cb();}
 function renderMap(){
  const host=overlay.querySelector('.rift-map-nodes');if(!host)return;
  host.innerHTML=mapNodes.map(p=>'<button type="button" class="rift-map-node '+(p.n===2?'is-entry':'')+(p.n===1?' is-security':'')+(p.n===14?' is-danger':'')+(p.kind==='locked'?' is-locked':'')+'" data-map-node="'+p.n+'" style="left:'+p.x+'%;top:'+p.y+'%" aria-label="'+p.n+' '+esc(p.label)+'"><span>'+p.n+'</span><small>'+esc(p.label)+'</small></button>').join('');
  host.querySelectorAll('[data-map-node]').forEach(btn=>btn.addEventListener('click',()=>openMapNode(Number(btn.dataset.mapNode))));
 }
 function renderWalkDoors(){
  const host=overlay.querySelector('.rift-walk-doors');if(!host)return;
  host.innerHTML=walkDoors.map(d=>'<button type="button" class="rift-world-door '+(d.security?'security-door':'')+'" data-door="'+d.id+'" style="left:'+d.x+'%" aria-label="'+esc(d.label)+'"><span>'+esc(d.label)+'</span></button>').join('');
  host.querySelectorAll('[data-door]').forEach(b=>b.addEventListener('click',()=>{const d=walkDoors.find(x=>x.id===b.dataset.door);if(d){playerX=d.x;paintPlayer();interact();}}));
 }
 function paintPlayer(){
  if(!overlay)return;
  const player=overlay.querySelector('.rift-walk-player');if(player)player.style.left=playerX+'%';
  const world=overlay.querySelector('.rift-walk-world');if(world)world.style.transform='translateX('+Math.max(-55,Math.min(0,50-playerX))+'%)';
  updateNearbyPrompt();
 }
 function updateNearbyPrompt(){
  if(!overlay||currentPlace!=='corridor')return;
  const nearest=walkDoors.reduce((best,d)=>Math.abs(d.x-playerX)<Math.abs(best.x-playerX)?d:best,walkDoors[0]);
  nearbyAction=Math.abs(nearest.x-playerX)<=7?nearest:null;
  const hint=overlay.querySelector('.rift-walk-interact');
  if(hint)hint.textContent=nearbyAction?'按 E 进入：'+nearbyAction.label+'（'+nearbyAction.n+' 号）':'A / D 或方向键移动，靠近房门后按 E';
  overlay.querySelectorAll('.rift-world-door').forEach(b=>b.classList.toggle('nearby',!!nearbyAction&&b.dataset.door===nearbyAction.id));
 }
 function movePlayer(){
  if(currentPlace!=='corridor'||activeRoom||(!moveLeft&&!moveRight))return;
  const step=0.55;
  if(moveLeft)playerX=Math.max(3,playerX-step);
  if(moveRight)playerX=Math.min(97,playerX+step);
  paintPlayer();
 }
 function interact(){
  if(!overlay||nightStarted)return;
  if(activeRoom){leaveRoom();return;}
  if(currentPlace!=='corridor')return;
  updateNearbyPrompt();
  if(!nearbyAction){const hint=overlay.querySelector('.rift-walk-interact');if(hint)hint.textContent='附近没有可进入的门，继续沿走廊移动。';return;}
  const target=nearbyAction;
  if(target.id==='security'){showPlace('security');enterSecurity();return;}
  selectRoom(target.id);
 }
 function bindWalkControls(){
  const scene=overlay.querySelector('.rift-walk-scene');if(!scene||scene.dataset.controlsBound)return;scene.dataset.controlsBound='1';
  const stop=()=>{moveLeft=false;moveRight=false;};
  window.addEventListener('keydown',e=>{
   if(!overlay||!overlay.classList.contains('active')||nightStarted||overlay.querySelector('.rift-modal:not([hidden])')||!overlay.querySelector('.rift-route-modal').hidden)return;
   const k=e.key.toLowerCase();
   if(k==='a'||k==='arrowleft'){moveLeft=true;e.preventDefault();}
   else if(k==='d'||k==='arrowright'){moveRight=true;e.preventDefault();}
   else if(k==='e'){interact();e.preventDefault();}
  });
  window.addEventListener('keyup',e=>{const k=e.key.toLowerCase();if(k==='a'||k==='arrowleft')moveLeft=false;if(k==='d'||k==='arrowright')moveRight=false;});
  window.addEventListener('blur',stop);
  const bindHold=(btn,dir)=>{btn.addEventListener('pointerdown',e=>{e.preventDefault();if(dir==='interact')interact();else{moveLeft=dir==='left';moveRight=dir==='right';}});['pointerup','pointercancel','pointerleave'].forEach(ev=>btn.addEventListener(ev,stop));};
  overlay.querySelectorAll('[data-walk]').forEach(btn=>bindHold(btn,btn.dataset.walk));
  if(!window.__riftWalkTick){window.__riftWalkTick=window.setInterval(movePlayer,30);}
 }
 function showPlace(place){
  currentPlace=place;activeRoom=null;
  const title=place==='theater'?'剧院大厅':place==='corridor'?'后台走廊':'保安室';
  const label=overlay.querySelector('.rift-current-location');if(label)label.textContent=title;
  const top=overlay.querySelector('.rift-scene-label');if(top)top.textContent=title;
  overlay.querySelectorAll('.rift-map-node').forEach(node=>node.classList.toggle('is-current',Number(node.dataset.mapNode)===(place==='corridor'?2:place==='security'?1:mapNodes.find(p=>p.id===place)?.n)));
  const scene=overlay.querySelector('.rift-walk-scene');if(scene){scene.dataset.place=place;scene.classList.remove('is-room');}
  const caption=overlay.querySelector('.rift-walk-interact');if(caption)caption.textContent=place==='corridor'?'A / D 或方向键移动，靠近房门后按 E':title;const roomCaption=overlay.querySelector('.rift-room-caption');if(roomCaption)roomCaption.hidden=true;
  const panel=overlay.querySelector('.rift-room-view');if(panel)panel.hidden=true;
  const back=overlay.querySelector('.rift-map-return');if(back)back.hidden=true;
  const doors=overlay.querySelector('.rift-walk-doors');if(doors)doors.style.display=place==='corridor'?'block':'none';
  const player=overlay.querySelector('.rift-walk-player');if(player)player.style.display=place==='corridor'?'block':'none';
  if(place==='corridor')paintPlayer();
  renderRoomItems(place==='theater'?['poster','photo']:[]);
 }
 function selectRoom(id){
  const r=rooms.find(x=>x.id===id);if(!r)return;
  activeRoom=id;currentPlace='room';
  const label=overlay.querySelector('.rift-current-location');if(label)label.textContent=r.name;
  const top=overlay.querySelector('.rift-scene-label');if(top)top.textContent=r.name;
  overlay.querySelectorAll('.rift-map-node').forEach(node=>node.classList.toggle('is-current',Number(node.dataset.mapNode)===mapNodes.find(p=>p.id===id)?.n));
  const scene=overlay.querySelector('.rift-walk-scene');if(scene){scene.dataset.place=id;scene.classList.add('is-room');}
  const title=overlay.querySelector('.rift-room-heading');if(title)title.textContent=r.name;
  const desc=overlay.querySelector('.rift-room-desc');if(desc)desc.textContent=r.desc;const roomCaption=overlay.querySelector('.rift-room-caption');if(roomCaption){roomCaption.querySelector('b').textContent=r.name;roomCaption.querySelector('span').textContent=r.desc;roomCaption.hidden=false;}
  const ids=r.items.filter(item=>item.startsWith('fragment')||entries[item]||item==='photo');renderRoomItems(ids);
  const panel=overlay.querySelector('.rift-room-view');if(panel)panel.hidden=false;
  const back=overlay.querySelector('.rift-map-return');if(back)back.hidden=false;
  const doors=overlay.querySelector('.rift-walk-doors');if(doors)doors.style.display='none';
  const player=overlay.querySelector('.rift-walk-player');if(player)player.style.display='none';
  const hint=overlay.querySelector('.rift-walk-interact');if(hint)hint.textContent='已进入'+r.name+' · 按 E 或点击“返回走廊”离开';
 }
 function leaveRoom(){if(!activeRoom)return;activeRoom=null;currentPlace='corridor';showPlace('corridor');}
 function openMapNode(n){
  const p=mapNodes.find(x=>x.n===n);if(!p||nightStarted)return;
  if(p.kind==='locked'){const hint=overlay.querySelector('.rift-map-instructions');if(hint)hint.textContent=p.label+'：目前封锁，暂不可进入。';return;}
  if(p.id==='security'){showPlace('security');enterSecurity();return;}
  if(p.id==='corridor'){activeRoom=null;showPlace('corridor');return;}
  if(p.id==='theater'){showPlace('theater');return;}
  selectRoom(p.id);
 }
 function collect(id){if(save.found.includes(id)){showEntry(id);return;}save.found.push(id);if(id.startsWith('fragment')){const count=fragments.filter(f=>save.found.includes(f.id)).length;if(count===5&&!save.gallery.includes('wen独白'))save.gallery.push('wen独白');}write();renderStatus();if(activeRoom)selectRoom(activeRoom);else showPlace(currentPlace);showEntry(id);}
 function showEntry(id){const entry=entries[id]||fragments.find(f=>f.id===id);if(!entry)return;modal('<div class="rift-document"><div class="rift-eyebrow">'+esc(entry.kind||'独立档案')+'</div><h2>'+esc(entry.title)+'</h2><p>'+esc(entry.text)+'</p><button class="rift-modal-close">收好</button></div>');}
 function renderStatus(){const n=save.found.length;const f=fragments.filter(x=>save.found.includes(x.id)).length;const status=overlay.querySelector('.rift-collect-status');if(status)status.textContent='已收集 '+n+' 件线索 · 煜的档案碎片 '+f+'/5';}
 function modal(html){const m=overlay.querySelector('.rift-modal');m.innerHTML=html;m.hidden=false;const close=m.querySelector('.rift-modal-close');if(close)close.onclick=()=>m.hidden=true;}
 function showCodex(){read();ensure();overlay.classList.add('active');const found=save.found.map(id=>entries[id]||fragments.find(f=>f.id===id)).filter(Boolean);const branch=save.branch==='A'?'迟来的和解':save.branch==='B'?'余烬永燃':'尚未选择';const fragmentCount=fragments.filter(f=>save.found.includes(f.id)).length;const items=found.map(x=>'<article><small>'+esc(x.kind||'支线档案')+'</small><b>'+esc(x.title)+'</b><p>'+esc(x.text)+'</p></article>').join('');const mainLore='裂隙余烬曾是煜与沦陷合伙经营的移动木偶剧团后台总站，存放机械人偶、舞台道具、配乐设备与控制机柜。煜负责演出调度，沦陷潜藏着另一重阴暗人格。剧团招募配乐师诺卡与宣传部成员寒零。后来，塔宁独自来后台探险；闪流为寻找十一回到旧址；耳机回来探望旧同事；记者孤追查罪证。沦陷的黑暗人格在深夜引诱十一进入最后的房间并将其杀害。闪流调查失踪事件时遇害；诺卡目睹行凶，恐惧锁住灵魂；塔宁、耳机、孤也接连遇害。沦陷胁迫煜清理现场、销毁记录并谎称访客自行离开。剧团停业后，前保安死入成为夜班看守，察觉人偶异常并留下电话磁带，之后失踪。多年后，夜班看守午安来到废墟。午夜，人偶怨灵依附各自执念苏醒。';const galleries=[['cam-third-night','第三夜·孩童人偶同时看向摄像头（低概率画面）'],['cam-night-six','第六夜·十一的虚影覆盖监控并黑白闪帧（高概率画面）'],['rescue-ending','救赎结局·怨灵背对镜头逐渐消散'],['dark-ending','沉沦结局·后台通道里的人偶望向监控']];modal('<div class="rift-codex"><div class="rift-eyebrow">ARCHIVE · SEPARATE SAVE</div><h2>档案室 / 独立分 P</h2><p>主线进度不会覆盖收集物；支线也不会改变主线通关。</p><div class="rift-codex-tabs"><b>主干：《裂隙余烬》</b><b>分支 A/B：'+branch+'</b><b>煜的独白：'+(fragmentCount===5?'已解锁':'碎片 '+fragmentCount+'/5')+'</b></div><h3>已收集档案</h3>'+(items||'<p>还没有收集到档案。</p>')+'<h3>主线档案</h3><p>'+esc(mainLore)+'</p><h3>人物与身份</h3><p>夜班看守：午安。可行动的怨灵人偶：十一、闪流、诺卡、塔宁、耳机、孤。活人剧情 NPC：煜、沦陷、寒零（宣传部）。叙事 NPC（非人偶怪物）：死入（前保安、电话磁带来源）、小宇宙（独立剧情 NPC，不攻击）。移交（一脚）是所有怨念凝聚的虚影，不属于遇害者。第三夜所有怨灵解锁；十一第三夜低概率出现，第六夜高概率出现。这里只记录既有设定，不调整角色行动与攻击机制。</p><h3>《懦弱的旁观者｜煜的独白》</h3>'+(fragmentCount===5?'<p>我很早就察觉到沦陷不对劲，可我舍不得我们一起搭建起来的剧团。我一次次假装看不见那些异样。惨剧发生之后，每一天都在煎熬。我被迫和他掩盖一切，我不敢告发，也永远无法原谅自己的懦弱。我偶尔深夜独自回来，看着这些人偶，我不知道我是在守护剧团，还是在帮着掩埋罪孽。</p>':'<p>收集齐 5 份档案碎片后解锁。</p>')+'<h3>画廊记录</h3>'+galleries.map((g,i)=>'<article><small>视觉彩蛋 '+(i+1)+' · '+(save.gallery.includes(g[0])?'已解锁':'尚未发现')+'</small><p>'+esc(g[1])+'</p></article>').join('')+'<button class="rift-modal-close">返回</button></div>');}
 function showEnding(){read();const key=save.branch==='A'?'A':save.branch==='B'?'B':'main';const ending=story[key];save.mainEnding=true;const endingKey=key==='A'?'rescue-ending':key==='B'?'dark-ending':'main-ending';if(!save.gallery.includes(endingKey))save.gallery.push(endingKey);write();const root=document.createElement('div');root.id='rift-story-ending';root.innerHTML='<div class="rift-ending-inner"><div class="rift-eyebrow">RIFT ASH · '+(key==='main'?'MAIN ROUTE':'STORY ROUTE '+key)+'</div><h1>'+esc(ending.title)+'</h1><p>'+esc(ending.body)+'</p><button>返回主菜单</button></div>';document.body.appendChild(root);return new Promise(resolve=>{root.querySelector('button').onclick=()=>{root.remove();resolve();};});}
 function branchModal(html){let m=document.getElementById('rift-branch-choice');if(!m){m=document.createElement('div');m.id='rift-branch-choice';m.className='rift-modal';document.body.appendChild(m);}m.innerHTML=html;m.hidden=false;return m;}
 function showBranchPrompt(){read();if(save.branch){const m=branchModal('<div class="rift-document"><h2>门锁记录</h2><p>你已经选择了'+(save.branch==='A'?'打开门锁':'远离禁区')+'。这个选择会作为独立分支保存，不会覆盖主线。</p><button>返回监控</button></div>');m.querySelector('button').onclick=()=>m.remove();return;}const m=branchModal('<div class="rift-document"><div class="rift-eyebrow">CAM 14 · LAST ROOM</div><h2>最后的房间门锁</h2><p>监控对准禁区门锁，生锈的锁扣似乎有松动的痕迹。</p><div class="rift-choice-stack"><button data-choice="A">A · 尝试打开门锁</button><button data-choice="B">B · 保持远离，不触碰禁区</button></div><small>这是独立剧情分支，不会改变六夜主线或任何人偶的行动机制。</small></div>');m.querySelectorAll('[data-choice]').forEach(button=>button.addEventListener('click',()=>{save.branch=button.dataset.choice;write();m.innerHTML='<div class="rift-document"><h2>选择已记录</h2><p>该分支已单独保存。你仍可继续主线六夜，结局会在第六夜结束后呈现。</p><button>返回监控</button></div>';m.querySelector('button').onclick=()=>m.remove();}));}
 function installVisualEasterEggs(){let lastBucket=-1,played=new Set();window.addEventListener('rift:game-frame',event=>{const d=event.detail||{};if(nightStarted&&d.running&&Number.isFinite(Number(d.elapsed))){lastElapsed=Number(d.elapsed);const clock=overlay?.querySelector('.rift-countdown');if(clock){const total=Math.max(0,Math.ceil((shiftNight===6?9.25*60:8*60)-lastElapsed/1000));clock.textContent='夜班倒计时：'+String(Math.floor(total/60)).padStart(2,'0')+':'+String(total%60).padStart(2,'0');}}if(!d.camOpen||(d.night!==3&&d.night!==6))return;const bucket=Math.floor((Number(d.elapsed)||0)/60000);if(bucket===lastBucket)return;lastBucket=bucket;if(played.has(d.night))return;const chance=d.night===3?0.07:0.34;if(Math.random()>chance)return;const feed=document.getElementById('cam-feed-container');if(!feed)return;played.add(d.night);const egg=document.createElement('div');egg.className='rift-monitor-easter-egg '+(d.night===3?'rift-kids-look':'rift-eleven-overlap');egg.innerHTML=d.night===3?'<i></i><i></i><i></i><i></i><i></i>':'<b></b><i></i>';feed.appendChild(egg);const key=d.night===3?'cam-third-night':'cam-night-six';if(!save.gallery.includes(key)){save.gallery.push(key);write();}window.setTimeout(()=>egg.remove(),1900);});}
 function installBranchHotspot(){const btn=document.querySelector('.cam-btn[data-cam="14"]');if(!btn||btn.dataset.riftStoryHook)return;btn.dataset.riftStoryHook='1';btn.addEventListener('click',()=>{if(typeof window.RIFT_GET_NIGHT!=='function'||window.RIFT_GET_NIGHT()!==4)return;setTimeout(()=>{const feed=document.getElementById('feed-14');if(!feed)return;feed.classList.add('rift-last-room-active');feed.innerHTML='<div class="rift-last-room-feed"><div class="rift-feed-door"></div><div class="rift-feed-lock"></div><div class="rift-feed-label">LAST ROOM · DOOR LOCK</div><button class="rift-lock-hotspot">检查门锁</button></div>';feed.querySelector('.rift-lock-hotspot').addEventListener('click',showBranchPrompt);},30);});}
 function expose(){window.RIFT_LORE_SYSTEM=Object.freeze({beginShift,showEnding,openCodex:showCodex,getProgress:()=>{read();return {found:save.found.length,branch:save.branch};}});installBranchHotspot();installVisualEasterEggs();}
 document.addEventListener('DOMContentLoaded',expose);if(document.readyState!=='loading')expose();
 read();
})();