/* Gilded Eleven / 十一 — independent character AI, following TaningAI's class structure. */
class GildedElevenAI {
  constructor(config = {}) {
    this.config = {
      name: '十一 (Gilded Eleven)',
      quote: '……',
      timings: { stage: 7.5, roam: 5.5, attack: 2.2 },
      maxStages: 4,
      ...config
    };
    this.aiLevel = 0;
    this.night = 0;
    this.phase = 'INACTIVE';
    this.stage = 0;
    this.timer = this.config.timings.stage;
    this.locationIndex = 0;
    this.locations = ['舞台区域', '人偶存放舱', '维修车间', '道具仓库', '主通道'];
    this.visual = null;
    this.specialAwakened = false;
    this._onNightStart = e => this.startNight(e.detail || {});
    this._onSpecialTime = e => this.onSpecialTime(e.detail || {});
    window.addEventListener('rift:night-start', this._onNightStart);
    window.addEventListener('rift:night-special-time', this._onSpecialTime);
  }

  setAILevel(level) {
    this.aiLevel = Math.max(0, Math.min(20, Math.floor(Number(level) || 0)));
  }

  canTakeAction() {
    if (this.aiLevel <= 0 && !this.specialAwakened) return false;
    if (typeof window.riftCanCharacterMove === 'function') {
      return window.riftCanCharacterMove(this.specialAwakened ? 20 : this.aiLevel);
    }
    const chances = [0,5,10,15,20,25,30,35,40,45,50,55,90,92,94,95,96,97,98,99,100];
    return Math.random() * 100 < chances[this.specialAwakened ? 20 : this.aiLevel];
  }

  ensureVisual() {
    if (this.visual && this.visual.isConnected) return this.visual;
    const host = document.getElementById('game') || document.body;
    const el = document.createElement('div');
    el.id = 'gilded-eleven-presence';
    el.setAttribute('aria-hidden', 'true');
    el.style.cssText = [
      'position:absolute','z-index:180','pointer-events:none','display:none',
      'width:min(24vw,240px)','height:min(48vh,420px)','left:50%','top:50%',
      'transform:translate(-50%,-50%)','filter:drop-shadow(0 0 18px rgba(202,155,55,.18))'
    ].join(';');
    el.innerHTML = '<div class="g11-body" style="position:absolute;inset:0;background:linear-gradient(90deg,transparent 8%,rgba(22,17,10,.96) 20%,rgba(91,68,27,.92) 50%,rgba(18,14,9,.98) 82%,transparent 94%);clip-path:polygon(35% 0,65% 0,78% 12%,76% 30%,90% 42%,82% 100%,18% 100%,10% 42%,24% 30%,22% 12%);border:2px solid rgba(185,143,55,.28);box-shadow:inset 0 0 25px #000"></div><div style="position:absolute;left:32%;top:17%;width:12%;height:3px;background:#e9bd52;box-shadow:0 0 12px #e9bd52"></div><div style="position:absolute;right:32%;top:17%;width:12%;height:3px;background:#e9bd52;box-shadow:0 0 12px #e9bd52"></div>';
    host.appendChild(el);
    this.visual = el;
    return el;
  }

  showBehind() {
    const el = this.ensureVisual();
    el.style.display = 'block';
    el.style.left = '50%';
    el.style.top = '54%';
    el.style.width = 'min(27vw,260px)';
    el.style.height = 'min(55vh,440px)';
    el.style.opacity = '1';
    el.style.filter = 'drop-shadow(0 0 22px rgba(213,168,70,.28))';
    el.style.transform = 'translate(-50%,-50%)';
    const back = document.getElementById('back-view');
    if (back && el.parentElement !== back) back.appendChild(el);
  }

  showRoaming(location) {
    const el = this.ensureVisual();
    const host = document.getElementById('game') || document.body;
    if (el.parentElement !== host) host.appendChild(el);
    const positions = [
      ['20%','48%'], ['76%','46%'], ['50%','30%'], ['64%','62%'], ['34%','58%']
    ];
    const pos = positions[this.locationIndex % positions.length];
    el.style.left = pos[0];
    el.style.top = pos[1];
    el.style.width = 'min(19vw,190px)';
    el.style.height = 'min(39vh,330px)';
    el.style.opacity = '0.92';
    el.style.display = 'block';
    el.style.transform = 'translate(-50%,-50%)';
    el.title = location;
  }

  hide() {
    if (this.visual) this.visual.style.display = 'none';
  }

  reset() {
    this.phase = 'INACTIVE';
    this.stage = 0;
    this.timer = this.config.timings.stage;
    this.locationIndex = 0;
    this.specialAwakened = false;
    this.hide();
  }

  startNight(detail) {
    this.night = Number(detail.night) || 0;
    const settings = detail.settings || {};
    this.setAILevel(Number((settings.characters || {}).gildedEleven || 0));
    this.reset();
    if (this.aiLevel > 0) this.phase = 'BEHIND_STAGE';
  }

  onSpecialTime(event) {
    if (Number(event.night) !== 6 || event.id !== 'eleven-awakens') return;
    this.specialAwakened = true;
    this.phase = 'ROAMING';
    this.stage = 0;
    this.locationIndex = 0;
    this.timer = this.config.timings.roam;
    this.showRoaming(this.locations[this.locationIndex]);
    console.info('[Rift Ash] Gilded Eleven entered roaming phase at 05:40.');
  }

  update(dt, ctx) {
    if (!ctx || !ctx.isGameRunning() || this.phase === 'INACTIVE' || this.phase === 'ATTACKED') return;
    dt = Math.max(0, Math.min(Number(dt) || 0, 0.1));

    if (this.phase === 'BEHIND_STAGE') {
      this.showBehind();
      // Looking directly behind forces Eleven back to its motionless starting state.
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
          this.phase = 'ATTACKED';
          this.hide();
          ctx.triggerJumpscare(this.config.name, this.config.quote);
        }
      }
      return;
    }

    if (this.phase === 'ROAMING') {
      // Night 6 special phase: roam through every playable area except the behind-player zone.
      this.showRoaming(this.locations[this.locationIndex]);
      this.timer -= dt;
      if (this.timer <= 0) {
        if (!this.canTakeAction()) {
          this.timer = this.config.timings.roam;
          return;
        }
        this.stage += 1;
        this.locationIndex = (this.locationIndex + 1) % this.locations.length;
        this.timer = this.config.timings.roam;
        if (this.stage >= this.config.maxStages) {
          this.phase = 'ATTACKED';
          this.hide();
          ctx.triggerJumpscare(this.config.name, this.config.quote);
        }
      }
    }
  }
}

window.GildedElevenAI = GildedElevenAI;
window.gildedEleven = new GildedElevenAI();
