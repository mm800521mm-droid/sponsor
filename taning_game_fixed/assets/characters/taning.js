class TaningAI {
  constructor(config) {
    this.config = config;
    this.name = config.name;
    this.quote = config.quote;
    this.footstepTimer = 0;
    this.lastReportedNode = null;
    this.aiLevel = 0;
    this.reset(null);
  }

  setAILevel(level) {
    this.aiLevel = Math.max(0, Math.min(20, Math.floor(Number(level) || 0)));
    // AI 只改变行动判定概率，不改变 timings；检查间隔始终独立。
  }

  canTakeAction() {
    if (this.aiLevel <= 0) return false;
    if (typeof window.riftCanCharacterMove === 'function') {
      return window.riftCanCharacterMove(this.aiLevel);
    }
    // 夜晚配置脚本未加载时的安全回退，保持同一条自定义概率曲线。
    const chances = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 90, 92, 94, 95, 96, 97, 98, 99, 100];
    return Math.random() * 100 < chances[this.aiLevel];
  }

  reset(ctx) {
    this.state = 'WANDER';
    this.timer = this.config.timings.wander;
    this.dir = 'L';
    this.path = [];
    this.currentNodeIndex = 0;
    this.footstepTimer = 0;
    this.lastReportedNode = null;
    window.dispatchEvent(new CustomEvent('rift:tannin-node-change', { detail: { node: null, state: 'WANDER', character: 'tannin' } }));
    if (ctx) {
      this.hideAll(ctx);
    }
  }

  getVisualElement(node, ctx) {
    if (!ctx) return null;
    const id = this.config.visualMap[node];
    if (!id) return null;
    return document.getElementById(id) || (ctx.dom && ctx.dom[id]) || null;
  }

  hideAll(ctx) {
    if (!ctx || !ctx.dom) return;
    for (const key of Object.keys(this.config.visualMap)) {
      const el = this.getVisualElement(key, ctx);
      if (el) {
        el.classList.remove('show', 'taning-moving');
        el.style.setProperty('opacity', '0', 'important');
        el.style.setProperty('visibility', 'hidden', 'important');
      }
    }
    for (const key of ['flashL', 'flashR']) {
      const flash = ctx.dom[key];
      if (flash) flash.style.opacity = '0';
    }
  }

  showNode(node, ctx) {
    if (this.lastReportedNode !== node) {
      this.lastReportedNode = node;
      window.dispatchEvent(new CustomEvent('rift:tannin-node-change', {
        detail: { node, state: this.state, character: 'tannin' }
      }));
    }
    const el = this.getVisualElement(node, ctx);
    if (el) {
      const cameraMatch=/^cam(\\d+)$/.exec(node);
      const feed=cameraMatch&&document.getElementById('feed-'+Number(cameraMatch[1]));
      if(feed && el.parentElement!==feed) feed.appendChild(el);
      // Reassert the host and pixel canvas visibility whenever Tannin occupies a node.
      // Other CCTV effects may hide the host between frames; restore both layers together.
      el.style.setProperty('display', 'block', 'important');
      el.style.setProperty('visibility', 'visible', 'important');
      el.style.setProperty('opacity', '1', 'important');
      el.style.setProperty('z-index', '40', 'important');
      el.style.setProperty('clip-path', 'none', 'important');
      el.style.setProperty('overflow', 'visible', 'important');
      el.classList.add('show');
      const sprite = el.querySelector('.tannin-pixel-sprite');
      if (sprite) {
        sprite.style.setProperty('display', 'block', 'important');
        sprite.style.setProperty('visibility', 'visible', 'important');
        sprite.style.setProperty('opacity', '1', 'important');
        sprite.style.setProperty('z-index', '61', 'important');
        sprite.style.setProperty('clip-path', 'none', 'important');
      }
      if (this.state === 'MOVE_HALL' && (node === 'cam3' || node === 'cam4')) {
        el.classList.add('taning-moving');
      } else {
        el.classList.remove('taning-moving');
      }
      el.style.setProperty('opacity','1','important');
      el.style.setProperty('z-index','40','important');
    }
  }

  skipCurrentRoom(camId, ctx) {
    const nodeToCam = { cam5:5, cam4:4, cam3:3 };
    const currentNode = this.state === 'WANDER' ? 'cam5' : this.path[this.currentNodeIndex];
    if (nodeToCam[currentNode] !== Number(camId) || !ctx) return false;
    if (this.state === 'WANDER') {
      this.dir = Math.random() < 0.5 ? 'L' : 'R';
      this.path = this.config.routes[this.dir].slice();
      this.currentNodeIndex = 1;
      this.state = 'MOVE_HALL';
      this.timer = this.config.timings.moveHall;
    } else if (this.state === 'MOVE_HALL') {
      this.currentNodeIndex += 1;
      const next = this.path[this.currentNodeIndex];
      if (!next) { this.state = 'COOLDOWN'; this.timer = this.config.timings.cooldown; }
      else if (next === 'doorL' || next === 'doorR') { this.state = 'AT_DOOR'; this.timer = this.config.timings.doorWait; }
      else { this.timer = this.config.timings.moveHall; }
    } else return false;
    this.hideAll(ctx);
    const nextNode = this.state === 'WANDER' ? 'cam5' : this.path[this.currentNodeIndex];
    if (nextNode) this.showNode(nextNode, ctx);
    ctx.playFootstep('distant');
    return true;
  }

  update(dt, ctx) {
    if (!ctx || !ctx.isGameRunning()) return;
    if (this.aiLevel === 0) {
      this.hideAll(ctx);
      return;
    }
    dt = Math.max(0, Math.min(dt, 0.1));

    switch (this.state) {
      case 'WANDER': {
        this.showNode('cam5', ctx);
        this.timer -= dt;
        if (this.timer <= 0) {
          // 每隔 wander 秒进行一次行动检查；失败只重置检查计时，不改变 AI 或移动速度。
          if (!this.canTakeAction()) {
            this.timer = this.config.timings.wander;
            break;
          }
          this.dir = Math.random() < 0.5 ? 'L' : 'R';
          this.path = this.config.routes[this.dir].slice();
          this.currentNodeIndex = 1;
          this.state = 'MOVE_HALL';
          this.timer = this.config.timings.moveHall;
          this.hideAll(ctx);
          this.showNode(this.path[this.currentNodeIndex], ctx);
          ctx.playFootstep('distant');
        }
        break;
      }

      case 'MOVE_HALL': {
        const currentNode = this.path[this.currentNodeIndex];
        const camId = currentNode === 'cam4' ? 4 : 3;
        this.timer -= dt; // 摄像头是否被玩家观看，不影响塔宁行动
        if (this.timer <= 0) {
          // 走廊每个节点各自检查一次；未通过则留在当前节点等待下一次检查。
          if (!this.canTakeAction()) {
            this.timer = this.config.timings.moveHall;
            break;
          }
          this.currentNodeIndex += 1;
          this.hideAll(ctx);
          const nextNode = this.path[this.currentNodeIndex];
          if (nextNode) {
            this.showNode(nextNode, ctx);
            if (nextNode === 'doorL' || nextNode === 'doorR') {
              this.state = 'AT_DOOR';
              this.timer = this.config.timings.doorWait;
              ctx.playFootstep('close');
            } else {
              this.timer = this.config.timings.moveHall;
            }
          } else {
            this.state = 'COOLDOWN';
            this.timer = this.config.timings.cooldown;
          }
        }
        break;
      }

      case 'AT_DOOR': {
        this.timer -= dt;
        if (this.timer <= 0) {
          this.hideAll(ctx);
          const isFeint = Math.random() < this.config.feintChance;
          this.state = isFeint ? 'FEINT' : 'CHARGE';
          this.timer = isFeint ? this.config.timings.feint : this.config.timings.charge;
          this.footstepTimer = 0;
          if (!isFeint) this.showNode(this.dir === 'L' ? 'doorL' : 'doorR', ctx);
        }
        break;
      }

      case 'FEINT': {
        const flash = this.dir === 'L' ? ctx.dom.flashL : ctx.dom.flashR;
        if (flash) {
          flash.style.background = 'rgba(255, 50, 50, 0.5)';
          flash.style.opacity = Math.sin((this.config.timings.feint - this.timer) * 20) > 0 ? '1' : '0';
        }
        this.timer -= dt;
        if (this.timer <= 0) {
          if (flash) flash.style.opacity = '0';
          this.state = 'COOLDOWN';
          this.timer = this.config.timings.cooldown;
        }
        break;
      }

      case 'CHARGE': {
        const flash = this.dir === 'L' ? ctx.dom.flashL : ctx.dom.flashR;
        const enemy = this.dir === 'L' ? ctx.dom.taningL : ctx.dom.taningR;
        if (flash) {
          flash.style.opacity = '1';
          flash.style.background = 'rgba(255, 0, 0, 0.8)';
        }
        if (enemy) {
          enemy.classList.add('show');
          enemy.style.opacity = '1';
        }

        this.footstepTimer -= dt;
        if (this.footstepTimer <= 0) {
          ctx.playFootstep('charge');
          this.footstepTimer = 0.42;
        }

        const otherDoor = this.dir === 'L' ? 'R' : 'L';
        // Both office doors share the same door-defense method for Tannin.
        const defended = ctx.isDoorClosed(this.dir) || ctx.isDoorClosed(otherDoor) ||
          (ctx.isPlayerLookingAt(this.dir) && ctx.isLightOn(this.dir));
        if (defended) {
          if (flash) flash.style.opacity = '0';
          if (enemy) {
            enemy.classList.remove('show');
            enemy.style.opacity = '0';
          }
          this.state = 'COOLDOWN';
          this.timer = this.config.timings.cooldown;
          ctx.playFootstep('distant');
        } else {
          this.timer -= dt;
          if (this.timer <= 0) {
            // 门口冲刺在这里是十一制造的假象：即使玩家没有防御，也不会造成伤害。
            // 保留冲刺动画和音效，结束后让角色退回巡游流程。
            this.hideAll(ctx);
            this.state = 'COOLDOWN';
            this.timer = this.config.timings.cooldown;
            ctx.playFootstep('distant');
          }
        }
        break;
      }

      case 'COOLDOWN': {
        this.timer -= dt;
        if (this.timer <= 0) this.reset(ctx);
        break;
      }

      case 'ATTACKED':
        // The host game owns the jumpscare/end state.
        break;
    }
  }
}
