/* Shared 8-bit CCTV character renderer. Presentation only; AI and movement remain in their owning systems. */
(() => {
  'use strict';
  const palettes = {
    flux:['#10191c','#42616a','#9fc1c0','#e7f4d8','#f2d56b'],
    lobe:['#18151e','#51445f','#a99ab9','#eee1f3','#75d7e5'],
    gu:['#16110f','#554333','#b18c5c','#e7d4aa','#d74a32'],
    chillo:['#101a22','#426b80','#a9d9e8','#eafaff','#80eaff'],
    noka:['#17120e','#5b3922','#b77d43','#f0c778','#f9e4a0'],
    tannin:['#211714','#704638','#ad8068','#d0b39a','#d99a43'],
    cosmo:['#17132a','#554b83','#a99ee0','#f0eaff','#78e6ff'],
    transfer:['#101014','#3d414b','#9299a6','#e0e2e8','#ff4c48'],
    gildedEleven:['#17100d','#493021','#8b642d','#e0bd70','#ffdc72']
  };
  function pixel(ctx,x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(x,y,w,h);}
  function paint(ctx,id){
    const p=palettes[id]||palettes.gu, [dark,mid,light,pale,glow]=p;
    ctx.clearRect(0,0,48,72);
    // ears / silhouette
    pixel(ctx,8,5,9,17,dark);pixel(ctx,10,4,6,15,mid);
    pixel(ctx,31,5,9,17,dark);pixel(ctx,32,4,6,15,mid);
    if(id==='chillo'){pixel(ctx,7,2,5,9,pale);pixel(ctx,36,2,5,9,pale);}
    if(id==='noka'){pixel(ctx,7,3,8,5,light);pixel(ctx,33,3,8,5,light);}
    // head and face
    pixel(ctx,10,12,28,24,dark);pixel(ctx,12,11,24,25,mid);pixel(ctx,14,14,20,17,light);
    pixel(ctx,15,21,6,4,dark);pixel(ctx,27,21,6,4,dark);
    pixel(ctx,16,22,4,2,glow);pixel(ctx,28,22,4,2,glow);
    pixel(ctx,20,30,8,3,dark);pixel(ctx,22,30,4,1,pale);
    // neck, torso, arms
    pixel(ctx,20,36,8,7,dark);pixel(ctx,13,40,22,22,dark);pixel(ctx,15,40,18,19,mid);
    pixel(ctx,5,42,8,19,dark);pixel(ctx,7,44,5,15,light);
    pixel(ctx,35,42,8,19,dark);pixel(ctx,36,44,5,15,light);
    pixel(ctx,16,61,7,10,dark);pixel(ctx,26,61,7,10,dark);
    pixel(ctx,17,63,5,7,light);pixel(ctx,27,63,5,7,light);
    // signature accessory
    if(id==='flux'){pixel(ctx,18,43,12,4,pale);pixel(ctx,22,42,4,6,glow);}
    if(id==='lobe'){pixel(ctx,8,14,5,13,glow);pixel(ctx,35,14,5,13,glow);pixel(ctx,10,17,3,8,dark);pixel(ctx,35,17,3,8,dark);}
    if(id==='gu'){pixel(ctx,14,17,20,5,dark);pixel(ctx,17,19,14,2,glow);}
    if(id==='chillo'){pixel(ctx,18,39,12,20,pale);pixel(ctx,21,41,6,14,glow);}
    if(id==='noka'){pixel(ctx,14,39,20,6,glow);pixel(ctx,22,40,4,4,dark);}
    if(id==='tannin'){pixel(ctx,12,4,24,5,light);pixel(ctx,20,3,8,3,glow);}
    if(id==='cosmo'){pixel(ctx,20,1,8,8,glow);pixel(ctx,22,3,4,4,pale);}
    if(id==='transfer'){pixel(ctx,13,38,22,5,glow);pixel(ctx,20,43,8,8,dark);}
    if(id==='gildedEleven'){pixel(ctx,7,2,10,12,light);pixel(ctx,31,2,10,12,light);pixel(ctx,14,42,20,5,glow);}
  }
  function mount(container,id){
    if(!container)return null;
    let canvas=container.querySelector('canvas.rift-pixel-figure');
    if(!canvas){canvas=document.createElement('canvas');canvas.className='rift-pixel-figure';canvas.width=48;canvas.height=72;canvas.setAttribute('aria-hidden','true');container.replaceChildren(canvas);}
    paint(canvas.getContext('2d'),id);
    canvas.style.cssText='display:block;width:100%;height:100%;image-rendering:pixelated;filter:drop-shadow(0 0 8px rgba(255,210,120,.35));';
    return canvas;
  }
  window.RIFT_PIXEL_CHARACTERS=Object.freeze({mount,paint});
})();
