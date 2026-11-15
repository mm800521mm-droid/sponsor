class GildedElevenAI {
  constructor(config) {
    this.config = config;
    this.name = config.name;
    this.quote = config.quote;
    this.aiLevel = 0;
    this.specialAwakened = false;
    this.debugVisible = false;
    this.wasLookingBack = false;
    this.reset(null);
  }

  setAILevel(level) {
    this.aiLevel = Math.max(0, Math.min(20, Math.floor(Number(level) || 0)));
    // AI 只控制行动判定概率；行动间隔由 timings 独立控制。
  }

  canTakeAction() {
    const level = this.specialAwakened ? 20 : this.aiLevel;
    if (level <= 0) return false;
    if (typeof window.riftCanCharacterMove === 'function') {
      return window.riftCanCharacterMove(level);
    }
    const chances = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 90, 92, 94, 95, 96, 97, 98, 99, 100];
    return Math.random() * 100 < chances[level];
  }

  setDebugBehind(enabled, ctx) {
    this.debugVisible = !!enabled;
    if (this.debugVisible) {
      this.state = 'ACTIVE';
      this.phase = 'BEHIND';
      this.stage = 0;
      this.timer = this.config.timings.stage;
      this.showNode('behind', ctx);
    } else if (!this.specialAwakened && this.aiLevel <= 0) {
      this.state = 'DORMANT';
      this.hideAll(ctx);
    }
  }

  reset(ctx) {
    this.debugVisible = false;
    this.wasLookingBack = false;
    this.state = 'DORMANT';
    this.phase = 'BEHIND';
    this.timer = this.config.timings.stage;
    this.stage = 0;
    this.path = this.config.routes.MAIN.slice();
    this.currentNodeIndex = 0;
    this.specialAwakened = false;
    if (ctx) this.hideAll(ctx);
  }

  getVisualElement(node, ctx) {
    if (!ctx) return null;
    const id = this.config.visualMap[node];
    if (!id) return null;
    return document.getElementById(id) || (ctx.dom && ctx.dom[id]) || null;
  }

  ensureStageStatus() {
    let panel = document.getElementById('rift-eleven-stage-status');
    if (!panel) {
      panel = document.createElement('div');
      panel.id = 'rift-eleven-stage-status';
      panel.style.cssText = 'position:absolute;left:18px;top:72px;z-index:85;display:none;width:min(310px,42vw);padding:12px 14px;background:rgba(5,5,5,.92);border:1px solid #8e713e;box-shadow:0 0 18px #000, inset 0 0 18px rgba(180,130,55,.12);color:#e7d3a8;font: bold 13px/1.5 Courier New,monospace;letter-spacing:1px;pointer-events:none;';
      panel.innerHTML = '<div style="color:#c69b53;font-size:11px;letter-spacing:3px;">RIFT ASH // NIGHT STATUS</div><div id="rift-eleven-stage-name" style="font-size:19px;color:#fff;margin:3px 0 2px;">十一：待机</div><div id="rift-eleven-stage-place">位置：未知</div><div id="rift-eleven-stage-count">阶段：0 / 4</div><div style="height:5px;background:#292117;margin-top:8px;"><div id="rift-eleven-stage-bar" style="height:100%;width:0;background:#c69b53;box-shadow:0 0 8px #c69b53;"></div></div>';
      (document.getElementById('game') || document.body).appendChild(panel);
    }
    return panel;
  }

  updateStageStatus(node) {
    const panel = this.ensureStageStatus();
    const names = { behind: '玩家身后', stage: '排练小舞台', storage: '玩偶储藏舱', workshop: '维修工坊', props: '道具仓库', mainHall: '走廊区域' };
    const phases = { DORMANT: '休眠中', ACTIVE: this.phase === 'BEHIND' ? '身后接近阶段' : '区域巡游阶段', ATTACKED: '攻击触发' };
    const name = panel.querySelector('#rift-eleven-stage-name');
    const place = panel.querySelector('#rift-eleven-stage-place');
    const count = panel.querySelector('#rift-eleven-stage-count');
    const bar = panel.querySelector('#rift-eleven-stage-bar');
    if (name) name.textContent = '十一：' + (phases[this.state] || '状态未知');
    if (place) place.textContent = '当前位置：' + (names[node] || names[this.path[this.currentNodeIndex]] || '尚未出现');
    if (count) count.textContent = '阶段进度：' + Math.min(this.stage || 0, this.config.maxStages) + ' / ' + this.config.maxStages;
    if (bar) bar.style.width = (Math.min(this.stage || 0, this.config.maxStages) / this.config.maxStages * 100) + '%';
    panel.style.display = this.state === 'DORMANT' ? 'none' : 'block';
  }

  ensureVisualNodes(ctx) {
    const host = document.getElementById('stage') || document.getElementById('game');
    if (!host) return;
    this.ensureStageStatus();
    for (const [node, id] of Object.entries(this.config.visualMap)) {
      const matches = document.querySelectorAll('[id="' + id + '"]');
      if (matches.length) {
        for (let i = 1; i < matches.length; i++) matches[i].remove();
        continue;
      }
      const el = document.createElement('div');
      el.id = id;
      el.className = 'gilded-eleven-node';
      el.setAttribute('aria-hidden', 'true');
      el.style.cssText = 'position:absolute;display:none;pointer-events:none;z-index:36;width:min(25vw,270px);height:min(48vh,410px);left:50%;top:48%;transform:translate(-50%,-50%);filter:drop-shadow(0 0 18px rgba(190,145,65,.65));';
      el.innerHTML = '<div class="eleven-ears"></div><div class="eleven-head"><i class="eleven-eye left"></i><i class="eleven-eye right"></i><div class="eleven-muzzle"></div></div><div class="eleven-neck"></div><div class="eleven-body"><i class="eleven-button b1"></i><i class="eleven-button b2"></i><i class="eleven-button b3"></i></div><div class="eleven-arm left"></div><div class="eleven-arm right"></div><div class="eleven-leg left"></div><div class="eleven-leg right"></div>';
      el.dataset.riftNode = node;
      host.appendChild(el);
    }
  }

  hideAll(ctx) {
    if (!ctx) return;
    for (const node of Object.keys(this.config.visualMap)) {
      const el = this.getVisualElement(node, ctx);
      if (el) {
        el.style.display = 'none';
        el.style.opacity = '0';
        el.classList.remove('show', 'gilded-eleven-moving');
      }
    }
  }

  showNode(node, ctx) {
    const el = this.getVisualElement(node, ctx);
    if (!el) return;
    // 每个时刻只允许一个十一节点显示，其他区域节点一律隐藏。
    for (const otherNode of Object.keys(this.config.visualMap)) {
      if (otherNode === node) continue;
      const other = this.getVisualElement(otherNode, ctx);
      if (other) {
        other.style.display = 'none';
        other.style.opacity = '0';
        other.classList.remove('show', 'gilded-eleven-moving');
      }
    }
    el.style.display = 'block';
    el.style.visibility = 'visible';
    el.style.opacity = '1';
    el.classList.add('show');
    if (node === 'behind') {
      const backView = document.getElementById('back-view');
      if (backView && el.parentElement !== backView) backView.appendChild(el);
      el.style.left = '50%';
      el.style.top = '46%';
      el.style.width = 'min(28vw,260px)';
      el.style.height = 'min(55vh,440px)';
    } else {
      const host = document.getElementById('stage');
      if (host && el.parentElement !== host) host.appendChild(el);
      const positions = {
        stage: ['22%', '48%'],
        storage: ['76%', '46%'],
        workshop: ['50%', '30%'],
        props: ['66%', '62%'],
        mainHall: ['34%', '58%']
      };
      const pos = positions[node] || ['50%', '50%'];
      el.style.left = pos[0];
      el.style.top = pos[1];
      el.style.width = 'min(20vw,210px)';
      el.style.height = 'min(42vh,360px)';
    }
    el.style.transform = 'translate(-50%,-50%)';
    this.updateStageStatus(node);
  }

  startNight(night, settings, ctx) {
    this.reset(ctx);
    this.setAILevel(Number(((settings || {}).characters || {}).gildedEleven ?? 0));
    this.night = Number(night) || 0;
    if (this.aiLevel > 0) {
      this.state = 'ACTIVE';
      this.phase = 'BEHIND';
      this.showNode('behind', ctx);
    }
  }

  updateNightSixStageStatus() {
    const panel = this.ensureStageStatus();
    const name = panel.querySelector('#rift-eleven-stage-name');
    const place = panel.querySelector('#rift-eleven-stage-place');
    const count = panel.querySelector('#rift-eleven-stage-count');
    const bar = panel.querySelector('#rift-eleven-stage-bar');
    if (name) name.textContent = '第六夜：设施异常阶段';
    if (place) place.textContent = '活动位置：无法确认';
    if (count) count.textContent = '阶段进度：' + Math.min(this.stage || 0, this.config.maxStages) + ' / ' + this.config.maxStages;
    if (bar) bar.style.width = (Math.min(this.stage || 0, this.config.maxStages) / this.config.maxStages * 100) + '%';
    panel.style.display = 'block';
  }

  onSpecialTime(event, ctx) {
    if (!event || event.id !== 'eleven-awakens' || Number(event.night) !== 6) return;
    this.specialAwakened = true;
    this.debugVisible = false;
    this.state = 'ACTIVE';
    this.phase = 'ROAMING';
    this.stage = 0;
    this.currentNodeIndex = 1;
    this.timer = this.config.timings.roam;
    // 第六夜只在设施内部活动，不把实体渲染到保安视角或场景中。
    this.hideAll(ctx);
    this.updateNightSixStageStatus();
  }

  retreatOneStage(ctx) {
    this.stage = Math.max(0, this.stage - 1);
    this.timer = this.config.timings.stage;
    if (this.specialAwakened) this.updateNightSixStageStatus();
    else this.updateStageStatus('behind');
  }

  update(dt, ctx) {
    if (!ctx || !ctx.isGameRunning()) return;
    this.ensureVisualNodes(ctx);
    if (this.specialAwakened) this.hideAll(ctx);
    if (this.debugVisible) {
      this.showNode('behind', ctx);
      const behind = this.getVisualElement('behind', ctx);
      if (ctx.isLookingBack()) {
        if (!this.wasLookingBack) this.retreatOneStage(ctx);
        this.wasLookingBack = true;
        if (behind) behind.classList.remove('gilded-eleven-moving');
        this.updateStageStatus('behind');
        return;
      }
      this.wasLookingBack = false;
      if (behind) behind.classList.add('gilded-eleven-moving');
      // 调试显示模式与正式模式使用相同的回头退阶段规则。
      this.timer -= dt;
      if (this.timer <= 0) {
        this.stage += 1;
        this.timer = this.config.timings.stage;
        this.updateStageStatus('behind');
        if (this.stage >= this.config.maxStages) {
          this.state = 'ATTACKED';
          this.debugVisible = false;
          this.hideAll(ctx);
          ctx.triggerJumpscare(this.name, this.quote);
        }
      }
      return;
    }
    if (this.state === 'DORMANT' || this.state === 'ATTACKED') {
      if (!this.specialAwakened) this.hideAll(ctx);
      return;
    }
    dt = Math.max(0, Math.min(Number(dt) || 0, 0.1));

    if (this.phase === 'BEHIND') {
      this.showNode('behind', ctx);
      const behind = this.getVisualElement('behind', ctx);
      if (behind) behind.classList.add('gilded-eleven-moving');
      // 回头看见十一时，阶段提示保持可见，并且每次回头只击退一个阶段。
      if (ctx.isLookingBack()) {
        if (!this.wasLookingBack) this.retreatOneStage(ctx);
        this.wasLookingBack = true;
        if (behind) behind.classList.remove('gilded-eleven-moving');
        this.updateStageStatus('behind');
        return;
      }
      this.wasLookingBack = false;
      this.timer -= dt;
      if (this.timer <= 0) {
        if (!this.canTakeAction()) {
          this.timer = this.config.timings.stage;
          return;
        }
        this.stage += 1;
        this.updateStageStatus('behind');
        this.timer = this.config.timings.stage;
        if (this.stage >= this.config.maxStages) {
          this.state = 'ATTACKED';
          this.hideAll(ctx);
          ctx.triggerJumpscare(this.name, this.quote);
        }
      }
      return;
    }

    if (this.phase === 'ROAMING') {
      if (!this.specialAwakened) {
        const node = this.path[this.currentNodeIndex] || 'mainHall';
        this.showNode(node, ctx);
      }
      this.timer -= dt;
      if (this.timer <= 0) {
        if (!this.canTakeAction()) {
          this.timer = this.config.timings.roam;
          return;
        }
        this.stage += 1;
        this.currentNodeIndex = Math.min(this.currentNodeIndex + 1, this.path.length - 1);
        this.timer = this.config.timings.roam;
        if (this.specialAwakened) {
          this.updateNightSixStageStatus();
          if (this.stage >= this.config.maxStages) {
            this.state = 'ATTACKED';
            this.hideAll(ctx);
            ctx.triggerJumpscare(this.name, this.quote);
          }
        } else if (this.stage >= this.config.maxStages) {
          this.state = 'ATTACKED';
          this.hideAll(ctx);
          ctx.triggerJumpscare(this.name, this.quote);
        } else {
          this.hideAll(ctx);
          this.showNode(this.path[this.currentNodeIndex], ctx);
        }
      }
    }
  }
}

window.drawGildedElevenJumpscareFace = function (canvas) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  ctx.imageSmoothingEnabled = false;
  const unit = Math.max(3, Math.floor(Math.min(w / 40, h / 48)));
  const ox = Math.floor((w - unit * 40) / 2);
  const oy = Math.floor((h - unit * 48) / 2);
  const px = (x, y, ww, hh, color) => {
    ctx.fillStyle = color;
    ctx.fillRect(ox + x * unit, oy + y * unit, ww * unit, hh * unit);
  };
  const dark='#17100d', rust='#493021', shadow='#2b1c15', gold='#8b642d',
    mid='#bd9147', light='#e0bd70', pale='#f0d99b', black='#080707',
    red='#f21c13', steel='#77716a';
  // Ears and battered outer silhouette.
  px(3,4,10,12,dark); px(5,3,7,11,rust); px(7,4,4,8,gold);
  px(27,3,10,13,dark); px(29,4,7,10,rust); px(30,5,4,7,gold);
  // Head shell, uneven and cracked.
  px(6,10,28,27,dark); px(8,9,24,27,rust); px(10,8,20,28,gold);
  px(8,13,3,17,shadow); px(29,13,4,16,shadow);
  px(11,10,18,4,mid); px(9,17,22,13,mid);
  px(12,14,5,3,light); px(24,13,5,3,light);
  // Brow ridges and eye sockets.
  px(9,18,10,8,dark); px(22,18,10,8,dark);
  px(11,20,7,4,black); px(23,20,7,4,black);
  px(13,20,3,4,red); px(25,20,3,4,red);
  px(14,20,1,2,'#fff1c5'); px(26,20,1,2,'#fff1c5');
  // Snout, split muzzle and square teeth.
  px(13,27,14,8,dark); px(15,27,10,6,light);
  px(18,26,4,4,pale); px(16,31,8,3,'#b18b51');
  px(14,34,13,3,black); px(15,34,3,2,pale); px(20,34,3,2,pale); px(25,34,2,2,pale);
  // Cracks, exposed bolts and endoskeleton at jaw.
  px(7,15,2,6,steel); px(31,15,2,5,steel);
  px(10,12,2,4,dark); px(12,12,1,3,pale);
  px(27,11,2,5,dark); px(26,12,1,4,pale);
  px(8,29,4,2,dark); px(29,29,4,2,dark);
  px(17,38,6,3,steel); px(13,41,14,3,dark);
  // Hard shadowing and gold glints.
  px(5,23,3,9,shadow); px(32,23,3,9,shadow);
  px(11,9,5,2,pale); px(25,9,4,2,pale);
  ctx.fillStyle='rgba(0,0,0,.35)';
  ctx.fillRect(0,0,w,h);
  ctx.globalCompositeOperation='screen';
  ctx.fillStyle='rgba(170,0,0,.10)';
  ctx.fillRect(0,0,w,h);
  ctx.globalCompositeOperation='source-over';
};

window.GildedElevenAI = GildedElevenAI;
