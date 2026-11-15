class TaningAI {
  constructor(config) {
    this.config = config;
    this.name = config.name;
    this.quote = config.quote;
    this.footstepTimer = 0;
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
    const el = this.getVisualElement(node, ctx);
    if (el) {
      el.style.setProperty('display', 'block', 'important');
      el.style.setProperty('visibility', 'visible', 'important');
      el.style.setProperty('opacity', '1', 'important');
      el.classList.add('show');
      const sprite = el.querySelector('.tannin-pixel-sprite');
      if (sprite) {
        sprite.style.setProperty('display', 'block', 'important');
        sprite.style.setProperty('visibility', 'visible', 'important');
        sprite.style.setProperty('opacity', '1', 'important');
      }
      if (this.state === 'MOVE_HALL' && (node === 'cam3' || node === 'cam4')) {
        el.classList.add('taning-moving');
      } else {
        el.classList.remove('taning-moving');
      }
      el.style.opacity = '1';
      el.style.zIndex = '20';
    }
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
        if (!ctx.isWatchingCam(camId)) this.timer -= dt;
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

        const defended = ctx.isDoorClosed(this.dir) ||
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
            this.state = 'ATTACKED';
            ctx.triggerJumpscare(this.name, this.quote);
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
