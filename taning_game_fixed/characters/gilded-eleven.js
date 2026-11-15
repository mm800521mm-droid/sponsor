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

  ensureVisualNodes(ctx) {
    const host = document.getElementById('stage') || document.getElementById('game');
    if (!host) return;
    for (const [node, id] of Object.entries(this.config.visualMap)) {
      // 防止重复初始化/重复脚本执行留下多个同 ID 的可视节点。
      const matches = document.querySelectorAll('[id="' + id + '"]');
      if (matches.length) {
        for (let i = 1; i < matches.length; i++) matches[i].remove();
        continue;
      }
      const el = document.createElement('div');
      el.id = id;
      el.className = 'gilded-eleven-node';
      el.setAttribute('aria-hidden', 'true');
      el.style.cssText = 'position:absolute;display:none;pointer-events:none;z-index:35;width:min(20vw,210px);height:min(42vh,360px);left:50%;top:48%;transform:translate(-50%,-50%);background:linear-gradient(90deg,transparent 5%,rgba(17,13,9,.98) 22%,rgba(93,68,28,.95) 50%,rgba(17,13,9,.98) 78%,transparent 95%);clip-path:polygon(35% 0,65% 0,78% 12%,76% 30%,90% 42%,82% 100%,18% 100%,10% 42%,24% 30%,22% 12%);filter:drop-shadow(0 0 15px rgba(201,157,65,.35));';
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

  onSpecialTime(event, ctx) {
    if (!event || event.id !== 'eleven-awakens' || Number(event.night) !== 6) return;
    this.specialAwakened = true;
    this.state = 'ACTIVE';
    this.phase = 'ROAMING';
    this.stage = 0;
    this.currentNodeIndex = 1;
    this.timer = this.config.timings.roam;
    this.hideAll(ctx);
    this.showNode('stage', ctx);
  }

  update(dt, ctx) {
    if (!ctx || !ctx.isGameRunning()) return;
    this.ensureVisualNodes(ctx);
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
      const node = this.path[this.currentNodeIndex] || 'mainHall';
      this.showNode(node, ctx);
      this.timer -= dt;
      if (this.timer <= 0) {
        if (!this.canTakeAction()) {
          this.timer = this.config.timings.roam;
          return;
        }
        this.stage += 1;
        this.currentNodeIndex = Math.min(this.currentNodeIndex + 1, this.path.length - 1);
        this.timer = this.config.timings.roam;
        if (this.stage >= this.config.maxStages) {
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
