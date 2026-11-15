
/* Tannin 8-bit sprite renderer: visual layer only; TaningAI keeps control of movement. */
(function () {
  'use strict';
  const palette = {
    o:'#211714', d:'#39251f', b:'#704638', l:'#ad8068',
    c:'#d0b39a', r:'#762e2d', rl:'#c34b39',
    blue:'#343b4b', m:'#77716d', md:'#373a3b',
    gold:'#d99a43', black:'#100e0e'
  };
  const targets = ['taning-cam5','taning-cam4','taning-cam3','taningL','taningR'];
  const sprites = [];
  let tick = 0;

  function rect(ctx,x,y,w,h,color) {
    ctx.fillStyle = color;
    ctx.fillRect(x,y,w,h);
  }

  function paint(canvas, redEye, bob) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0,0,40,60);
    ctx.save();
    ctx.translate(0,bob);

    // striped mechanical tail behind the body
    rect(ctx,24,30,7,5,palette.d);
    rect(ctx,27,28,5,5,palette.b);
    rect(ctx,30,31,5,5,palette.c);
    rect(ctx,28,35,7,5,palette.d);
    rect(ctx,25,38,8,4,palette.b);
    rect(ctx,24,41,7,2,palette.c);

    // ears, kept visible above the head
    rect(ctx,10,7,7,10,palette.o); rect(ctx,11,7,5,8,palette.b);
    rect(ctx,12,8,3,5,palette.d); rect(ctx,13,9,1,3,palette.r);
    rect(ctx,23,7,7,10,palette.o); rect(ctx,24,7,5,8,palette.b);
    rect(ctx,25,8,3,5,palette.d); rect(ctx,26,9,1,3,palette.r);

    // explorer hat and star
    rect(ctx,11,3,18,7,palette.o);
    rect(ctx,13,2,14,7,palette.b);
    rect(ctx,14,3,11,2,palette.l);
    rect(ctx,9,9,22,2,palette.d);
    rect(ctx,12,8,16,2,palette.r);
    rect(ctx,23,4,2,2,palette.gold);
    rect(ctx,22,5,4,1,palette.gold);
    rect(ctx,24,6,1,2,palette.gold);

    // smaller raccoon head and dark face markings
    rect(ctx,10,11,20,14,palette.o);
    rect(ctx,12,11,16,12,palette.b);
    rect(ctx,11,15,18,7,palette.l);
    rect(ctx,11,15,6,5,palette.d);
    rect(ctx,23,15,6,5,palette.d);
    rect(ctx,13,18,5,3,palette.c);
    rect(ctx,22,18,5,3,palette.c);
    rect(ctx,18,20,5,3,palette.o);
    rect(ctx,19,20,3,1,palette.black);
    rect(ctx,17,23,7,1,palette.o);
    rect(ctx,18,24,5,2,palette.c);

    // eyes: one glowing eye, one stitched X mark
    rect(ctx,13,16,4,4,palette.black);
    rect(ctx,14,17,2,2,redEye ? palette.rl : '#f5c879');
    rect(ctx,14,17,1,1,'#fff0bd');
    rect(ctx,24,16,4,4,palette.black);
    rect(ctx,24,16,1,1,palette.l); rect(ctx,27,16,1,1,palette.l);
    rect(ctx,25,17,1,1,palette.l); rect(ctx,24,19,1,1,palette.l);
    rect(ctx,27,19,1,1,palette.l);

    // neck bow and explorer outfit
    rect(ctx,17,26,7,3,palette.d);
    rect(ctx,12,28,7,5,palette.r); rect(ctx,23,28,7,5,palette.r);
    rect(ctx,19,29,5,4,palette.rl); rect(ctx,20,29,2,2,palette.gold);
    rect(ctx,12,32,17,14,palette.o);
    rect(ctx,14,32,13,13,palette.b);
    rect(ctx,18,33,5,12,palette.blue);
    rect(ctx,14,35,4,7,palette.r);
    rect(ctx,23,35,4,7,palette.c);
    rect(ctx,20,36,2,2,palette.gold);
    rect(ctx,19,37,4,1,palette.gold);
    rect(ctx,20,38,2,2,palette.gold);
    rect(ctx,13,33,2,8,palette.d);
    rect(ctx,26,33,2,8,palette.d);

    // exposed mechanical arms and fingers
    rect(ctx,9,33,4,3,palette.o); rect(ctx,7,36,4,6,palette.md);
    rect(ctx,6,41,5,3,palette.m);
    rect(ctx,6,44,1,3,palette.md); rect(ctx,8,44,1,3,palette.md); rect(ctx,10,44,1,3,palette.md);
    rect(ctx,28,33,4,3,palette.o); rect(ctx,30,36,4,6,palette.md);
    rect(ctx,29,41,5,3,palette.m);
    rect(ctx,29,44,1,3,palette.md); rect(ctx,31,44,1,3,palette.md); rect(ctx,33,44,1,3,palette.md);

    // longer lower body, mechanical legs and boots
    rect(ctx,11,44,20,4,palette.o);
    rect(ctx,12,45,18,5,palette.r);
    rect(ctx,15,46,12,3,palette.blue);
    rect(ctx,15,49,5,5,palette.c); rect(ctx,16,50,3,4,palette.md);
    rect(ctx,24,49,5,5,palette.c); rect(ctx,25,50,3,4,palette.md);
    rect(ctx,15,53,5,2,palette.m); rect(ctx,24,53,5,2,palette.m);
    rect(ctx,13,55,8,4,palette.o); rect(ctx,14,56,6,2,palette.b);
    rect(ctx,23,55,8,4,palette.o); rect(ctx,24,56,6,2,palette.b);
    rect(ctx,16,56,2,1,palette.gold); rect(ctx,26,56,2,1,palette.gold);

    ctx.restore();
  }

  // Reuse the exact in-game pixel model for the jumpscare close-up.
  window.drawTanninJumpscareFace = function (targetCanvas, redEye = true) {
    if (!targetCanvas) return;
    const source = document.createElement('canvas');
    source.width = 40; source.height = 60;
    paint(source, redEye, 0);
    const out = targetCanvas.getContext('2d');
    out.clearRect(0, 0, targetCanvas.width, targetCanvas.height);
    out.imageSmoothingEnabled = false;
    // Crop hat, ears and full raccoon face from the actual sprite model.
    out.drawImage(source, 7, 0, 27, 30, 0, 0, targetCanvas.width, targetCanvas.height);
  };

  function init() {
    targets.forEach(id => {
      const host = document.getElementById(id);
      if (!host) return;
      host.classList.add('tannin-pixel-host');
      // Give every host deterministic geometry instead of relying on the old
      // silhouette's clip-path and dimensions.
      host.style.position = 'absolute';
      host.style.display = 'block';
      host.style.background = 'transparent';
      host.style.clipPath = 'none';
      host.style.overflow = 'visible';
      host.style.pointerEvents = 'none';
      host.style.zIndex = '30';
      if (id === 'taning-cam5') {
        host.style.width = '24%'; host.style.height = '82%';
        host.style.right = '16%'; host.style.left = 'auto';
        host.style.bottom = '3%'; host.style.top = 'auto';
      } else if (id === 'taning-cam4') {
        host.style.width = '24%'; host.style.height = '82%';
        host.style.left = '25%'; host.style.right = 'auto';
        host.style.bottom = '3%'; host.style.top = 'auto';
      } else if (id === 'taning-cam3') {
        host.style.width = '24%'; host.style.height = '82%';
        host.style.right = '25%'; host.style.left = 'auto';
        host.style.bottom = '3%'; host.style.top = 'auto';
      }
      const canvas = document.createElement('canvas');
      canvas.width = 40;
      canvas.height = 60;
      canvas.className = 'tannin-pixel-sprite';
      canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;visibility:visible;opacity:1;image-rendering:pixelated;pointer-events:none;';
      canvas.setAttribute('aria-label','塔宁 8-bit 像素角色');
      host.appendChild(canvas);
      sprites.push(canvas);
    });
    function loop() {
      tick++;
      const red = Math.floor(tick / 18) % 2 === 1;
      const bob = Math.floor(tick / 8) % 2;
      sprites.forEach(canvas => paint(canvas, red, bob));
      requestAnimationFrame(loop);
    }
    loop();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, {once:true});
  } else {
    init();
  }
})();
