class TaningAI {
  constructor(config) {
    this.config = config;
    this.name = config.name;
    this.quote = config.quote;
    this.footstepTimer = 0;
    this.reset(null);
  }

  setAILevel(level) {
    const ai = Math.max(0, Math.min(20, Number(level) || 0));
    this.aiLevel = ai;
    // AI 2 keeps the original pace; larger values shorten all decision timers.
    const base = this.config.baseTimings || this.config.timings;
    const factor = ai > 0 ? 2 / ai : 1;
    this.config.timings = Object.fromEntries(Object.entries(base).map(([key, value]) => [key, value * factor]));
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
      if (this.aiLevel === 0) this.showNode('cam5', ctx);
    }
  }

  getVisualElement(node, ctx) {
    if (!ctx) return null;
    const id = this.config.visualMap[node];
    if (!id) return null;
    // GameContext historically exposed camelCase keys while visualMap stores DOM IDs.
    // Resolve by DOM ID as a fallback so camera hosts are not silently skipped.
    // Resolve by exact DOM id first. GameContext keeps both legacy keys and
    // camelCase aliases, but the DOM id is the single source of truth.
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
      // Explicitly restore the host and its canvas. Older silhouette CSS used
      // opacity/visibility on this same node, so class changes alone were not
      // sufficient in every browser cascade.
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
    // AI 0 means the character remains visible at the initial camera position but never moves.
    if (this.aiLevel === 0) { this.showNode('cam5', ctx); return; }
    dt = Math.max(0, Math.min(dt, 0.1));

    switch (this.state) {
      case 'WANDER': {
        this.showNode('cam5', ctx);
        this.timer -= dt;
        if (this.timer <= 0) {
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
        // Watching the matching corridor camera freezes Taning's movement timer.
        if (!ctx.isWatchingCam(camId)) this.timer -= dt;
        if (this.timer <= 0) {
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

        // Correctly facing and illuminating the threatened side repels him.
        // A closed matching door also physically blocks the charge.
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
