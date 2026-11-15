const GILDED_ELEVEN_CONFIG = {
  name: '十一 (Gilded Eleven)',
  quote: '……',
  routes: {
    MAIN: ['behind', 'stage', 'storage', 'workshop', 'props', 'mainHall']
  },
  visualMap: {
    behind: 'gilded-eleven-behind',
    stage: 'gilded-eleven-stage',
    storage: 'gilded-eleven-storage',
    workshop: 'gilded-eleven-workshop',
    props: 'gilded-eleven-props',
    mainHall: 'gilded-eleven-main-hall'
  },
  timings: {
    stage: 7.5,
    roam: 5.5,
    attack: 2.2,
    cooldown: 3.0
  },
  maxStages: 4
};
GILDED_ELEVEN_CONFIG.baseTimings = { ...GILDED_ELEVEN_CONFIG.timings };

const gildedEleven = new GildedElevenAI(GILDED_ELEVEN_CONFIG);
