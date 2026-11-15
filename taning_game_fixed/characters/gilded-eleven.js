class GildedElevenAI {
  constructor(config) {
    this.config = config;
    this.name = config.name;
    this.quote = config.quote;
    this.aiLevel = 0;
    this.specialAwakened = false;
    this.debugVisible = false;
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

  update(dt, ctx) {
    if (!ctx || !ctx.isGameRunning()) return;
    this.ensureVisualNodes(ctx);
    if (this.specialAwakened) this.hideAll(ctx);
    if (this.debugVisible) {
      this.showNode('behind', ctx);
      return;
    }
    if (this.state === 'DORMANT' || this.state === 'ATTACKED') {
      if (!this.specialAwakened) this.hideAll(ctx);
      return;
    }
    dt = Math.max(0, Math.min(Number(dt) || 0, 0.1));

    if (this.phase === 'BEHIND') {
      this.showNode('behind', ctx);
      // 玩家回头观察时，十一立即回到静止起点。
      if (ctx.isLookingBack()) {
        this.stage = 0;
        this.timer = this.config.timings.stage;
        return;
      }
      this.timer -= dt;
      if (this.timer <= 0) {
        if (!this.canTakeAction()) {
          this.timer = this.config.timings.stage;
          return;
        }
        this.stage += 1;
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
window.GildedElevenAI = GildedElevenAI;
