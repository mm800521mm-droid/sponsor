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
 let overlay,activeRoom=null,onEnter=null,shiftNight=1;
 function ensure(){
  if(overlay)return;
  overlay=document.createElement('section');overlay.id='rift-exploration';overlay.innerHTML='<div class="rift-explore-shell"><header><div class="rift-eyebrow">RIFT ASH · BACKSTAGE ACCESS</div><h1>裂隙余烬 / 后台总站</h1><p class="rift-explore-lead">夜班开始前，你可以先在后台走走。没有倒计时，也不会触发夜间人偶行动。</p></header><div class="rift-explore-layout"><nav class="rift-room-list" aria-label="后台区域"></nav><main class="rift-room-view"><div class="rift-room-heading">选择一个区域</div><div class="rift-room-desc">你还没有进入任何房间。</div><div class="rift-room-items"></div></main></div><footer><div class="rift-explore-status"></div><div class="rift-explore-actions"><button class="rift-codex-open">档案 / 分 P</button><button class="rift-enter-office">进入保安室</button></div></footer></div><div class="rift-modal" hidden></div>';
  document.body.appendChild(overlay);
  overlay.querySelector('.rift-enter-office').addEventListener('click',()=>{overlay.classList.remove('active');const cb=onEnter;onEnter=null;if(cb)cb();});
  overlay.querySelector('.rift-codex-open').addEventListener('click',showCodex);
  overlay.querySelector('.rift-modal').addEventListener('click',e=>{if(e.target.classList.contains('rift-modal'))e.currentTarget.hidden=true;});
 }
 function ensureTapeRooms(){if(Array.isArray(save.tapeRooms))return;const ids=['lobby','music','props','promo','repair','archive'];save.tapeRooms={};const picks=[...ids].sort(()=>Math.random()-.5).slice(0,3);['tape1','tape2','tape3'].forEach((id,i)=>save.tapeRooms[id]=picks[i]);write();}
 function beginShift(night,callback){read();ensure();ensureTapeRooms();shiftNight=night;onEnter=callback;activeRoom=null;overlay.classList.add('active');renderRooms();renderStatus();selectRoom('lobby');return true;}
 function renderRooms(){const nav=overlay.querySelector('.rift-room-list');nav.innerHTML=rooms.map((r,i)=>'<button data-room="'+r.id+'" class="'+(activeRoom===r.id?'active':'')+'"><span>'+(i+1).toString().padStart(2,'0')+'</span>'+esc(r.name)+'</button>').join('');nav.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>selectRoom(b.dataset.room)));}
 function selectRoom(id){activeRoom=id;const r=rooms.find(x=>x.id===id);if(!r)return;renderRooms();overlay.querySelector('.rift-room-heading').textContent=r.name;overlay.querySelector('.rift-room-desc').textContent=r.desc;const items=r.items.filter(id=>id.startsWith('fragment')||entries[id]||id==='photo');const list=overlay.querySelector('.rift-room-items');list.innerHTML=items.map(id=>{const tape= id.startsWith('tape');const actual=tape?save.tapeRooms[id]===r.id:id;const entry=entries[id];const f=fragments.find(x=>x.id===id);const found=save.found.includes(id);return actual?'<button class="rift-find-item '+(found?'found':'')+'" data-item="'+id+'"><span class="rift-item-mark">'+(found?'✓':'?')+'</span><span><b>'+esc(entry?.title||f?.title||'可疑的纸张')+'</b><small>'+(found?'已收入档案':'检查物件')+'</small></span></button>':'';}).join('')||'<div class="rift-empty-room">暂时没有发现可收集的东西。也许下次来会有新线索。</div>';list.querySelectorAll('[data-item]').forEach(b=>b.addEventListener('click',()=>collect(b.dataset.item)));}
 function collect(id){if(save.found.includes(id)){showEntry(id);return;}save.found.push(id);if(id.startsWith('fragment')){const count=fragments.filter(f=>save.found.includes(f.id)).length;if(count===5&&!save.gallery.includes('wen独白'))save.gallery.push('wen独白');}write();renderStatus();selectRoom(activeRoom);showEntry(id);}
 function showEntry(id){const entry=entries[id]||fragments.find(f=>f.id===id);if(!entry)return;modal('<div class="rift-document"><div class="rift-eyebrow">'+esc(entry.kind||'独立档案')+'</div><h2>'+esc(entry.title)+'</h2><p>'+esc(entry.text)+'</p><button class="rift-modal-close">收好</button></div>');}
 function renderStatus(){const n=save.found.length;const f=fragments.filter(x=>save.found.includes(x.id)).length;overlay.querySelector('.rift-explore-status').textContent='已收集 '+n+' / 15 件线索 · 煜的档案碎片 '+f+' / 5';}
 function modal(html){const m=overlay.querySelector('.rift-modal');m.innerHTML=html;m.hidden=false;const close=m.querySelector('.rift-modal-close');if(close)close.onclick=()=>m.hidden=true;}
 function showCodex(){read();const found=save.found.map(id=>entries[id]||fragments.find(f=>f.id===id)).filter(Boolean);const branch=save.branch==='A'?'迟来的和解':save.branch==='B'?'余烬永燃':'尚未选择';const fragmentCount=fragments.filter(f=>save.found.includes(f.id)).length;const items=found.map(x=>'<article><small>'+esc(x.kind||'支线档案')+'</small><b>'+esc(x.title)+'</b><p>'+esc(x.text)+'</p></article>').join('');const galleries=['第三夜·孩童人偶同时看向摄像头（低概率画面）','第六夜·十一的虚影覆盖监控并黑白闪帧（高概率画面）','救赎结局·怨灵背对镜头逐渐消散','沉沦结局·后台通道里的人偶望向监控'];modal('<div class="rift-codex"><div class="rift-eyebrow">ARCHIVE · SEPARATE SAVE</div><h2>档案室 / 独立分 P</h2><p>主线进度不会覆盖收集物；支线也不会改变主线通关。</p><div class="rift-codex-tabs"><b>主干：《裂隙余烬》</b><b>分支 A/B：'+branch+'</b><b>煜的独白：'+(fragmentCount===5?'已解锁':'碎片 '+fragmentCount+'/5')+'</b></div><h3>已收集档案</h3>'+(items||'<p>还没有收集到档案。</p>')+'<h3>画廊记录</h3>'+galleries.map((g,i)=>'<article><small>视觉彩蛋 '+(i+1)+'</small><p>'+esc(g)+'</p></article>').join('')+'<button class="rift-modal-close">返回</button></div>');}
 function showEnding(){read();const key=save.branch==='A'?'A':save.branch==='B'?'B':'main';const ending=story[key];const root=document.createElement('div');root.id='rift-story-ending';root.innerHTML='<div class="rift-ending-inner"><div class="rift-eyebrow">RIFT ASH · '+(key==='main'?'MAIN ROUTE':'STORY ROUTE '+key)+'</div><h1>'+esc(ending.title)+'</h1><p>'+esc(ending.body)+'</p><button>返回主菜单</button></div>';document.body.appendChild(root);return new Promise(resolve=>{root.querySelector('button').onclick=()=>{root.remove();resolve();};});}
 function showBranchPrompt(){read();if(save.branch){modal('<div class="rift-document"><h2>门锁记录</h2><p>你已经选择了'+(save.branch==='A'?'打开门锁':'远离禁区')+'。这个选择会作为独立分支保存，不会覆盖主线。</p><button class="rift-modal-close">返回监控</button></div>');return;}modal('<div class="rift-document"><div class="rift-eyebrow">CAM 14 · LAST ROOM</div><h2>最后的房间门锁</h2><p>监控对准禁区门锁，生锈的锁扣似乎有松动的痕迹。</p><div class="rift-choice-stack"><button data-choice="A">A · 尝试打开门锁</button><button data-choice="B">B · 保持远离，不触碰禁区</button></div><small>这是独立剧情分支，不会改变六夜主线或任何人偶的行动机制。</small></div>');overlay.querySelectorAll('[data-choice]').forEach(b=>b.addEventListener('click',()=>{save.branch=b.dataset.choice;write();showBranchConfirm();}));}
 function showBranchConfirm(){const m=overlay.querySelector('.rift-modal');m.innerHTML='<div class="rift-document"><h2>选择已记录</h2><p>该分支已单独保存。你仍可继续主线六夜，结局会在第六夜结束后呈现。</p><button class="rift-modal-close">返回监控</button></div>';m.querySelector('button').onclick=()=>m.hidden=true;}
 function installBranchHotspot(){const btn=document.querySelector('.cam-btn[data-cam="14"]');if(!btn||btn.dataset.riftStoryHook)return;btn.dataset.riftStoryHook='1';btn.addEventListener('click',()=>{if(typeof window.RIFT_GET_NIGHT!=='function'||window.RIFT_GET_NIGHT()!==4)return;setTimeout(()=>{const feed=document.getElementById('feed-14');if(!feed)return;feed.innerHTML='<div class="rift-last-room-feed"><div class="rift-feed-door"></div><div class="rift-feed-lock"></div><div class="rift-feed-label">LAST ROOM · DOOR LOCK</div><button class="rift-lock-hotspot">检查门锁</button></div>';feed.querySelector('.rift-lock-hotspot').addEventListener('click',showBranchPrompt);},30);});}
 function expose(){window.RIFT_LORE_SYSTEM=Object.freeze({beginShift,showEnding,openCodex:showCodex,getProgress:()=>{read();return {found:save.found.length,branch:save.branch};}});installBranchHotspot();}
 document.addEventListener('DOMContentLoaded',expose);if(document.readyState!=='loading')expose();
 read();
})();