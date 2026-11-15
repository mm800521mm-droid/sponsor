const TANING_CONFIG = {
  name: '塔宁 (Taning)',
  quote: '我就是进来探个路，谁也没想过会留在这儿。',
  routes: {
    L: ['cam5', 'cam4', 'doorL'],
    R: ['cam5', 'cam3', 'doorR']
  },
  visualMap: {
    cam5: 'taning-cam5',
    cam4: 'taning-cam4',
    cam3: 'taning-cam3',
    doorL: 'taningL',
    doorR: 'taningR'
  },
  timings: {
    wander: 8,
    moveHall: 3.5,
    doorWait: 1.5,
    feint: 2.0,
    charge: 1.8,
    cooldown: 3.0
  },
  feintChance: 0.4
};
TANING_CONFIG.baseTimings = { ...TANING_CONFIG.timings };

const taning = new TaningAI(TANING_CONFIG);
