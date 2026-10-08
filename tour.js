/* Immersive drone walk-through (Khaira Gali page). Starts loading only when the section comes near. */
(()=>{
const $=(s,c=document)=>c.querySelector(s),$$=(s,c=document)=>[...c.querySelectorAll(s)];
const reduceMotion=matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer=matchMedia("(hover: hover) and (pointer: fine)").matches;
const nav=$(".site-nav")||document.createElement("nav");
/* ================= SCROLL-DRIVEN 3D DRONE FLIGHT =================
   You fly the drone with the scroll. Clips are encoded with every frame as a keyframe,
   so jumping to any moment is instant and scrubbing stays smooth in both directions.
   aerial → 3D dive into the house → bedroom → (turn) kitchen → (turn) balcony & view      */
function startTour(){
  const tour=$("#tour"); if(!tour) return;
  const stage=$(".tour-stage"),camera=$(".tour-camera"),scenes=$$(".tour-scene"),videos=scenes.map(s=>s.querySelector("video"));
  const header=$(".site-header"),loaderEl=$("#tour-loader"),bar=$("#tour-loader-bar"),fill=$(".tour-progress-fill");
  const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
  const range=(p,a,b)=>clamp((p-a)/(b-a));
  const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
  const easeOut=t=>1-Math.pow(1-t,3);
  const smoothstep=t=>t*t*(3-2*t);
  const damp=(a,b,k,dt)=>a+(b-a)*(1-Math.exp(-k*dt));
  const small=innerWidth<800||(navigator.connection&&navigator.connection.saveData);
  /* Phones/tablets: draw pre-cut portrait frames on a canvas instead of seeking a video.
     Mobile browsers can't seek video smoothly; swapping images is instant, so the flight stays fluid. */
  const MOB=matchMedia("(max-width:820px), (pointer:coarse)").matches;
  const SEQ=true;   // desktop now uses HD frame sequences too: instant, perfectly smooth scrubbing
  const SEQ_N=[150,150,150,150], SEQ_NAMES=["aerial","bedroom","kitchen","terrace"], SEQ_DIR=MOB?"seq":"seq-d";

  const PLAY=[[0,.29],[.235,.53],[.485,.77],[.725,1]];   // where each clip plays along the scroll
  const T=[[.235,.30],[.485,.545],[.725,.785]];          // transitions: dive, turn, turn
  const VIS=[[0,T[0][1]],[T[0][0],T[1][1]],[T[1][0],T[2][1]],[T[2][0],1.01]];
  const dur=[10,10,10,8.4];

  // the window the drone dives toward (fractions of the aerial frame)
  const WIN={l:.536,r:.63,t:.509,b:.685};let org={x:.583,y:.597};
  const mapWin=()=>{if(MOB){org={x:.5,y:.597};scenes[0].style.transformOrigin="50% 59.7%";return}const r=scenes[0].getBoundingClientRect(),fa=r.width/r.height,va=16/9;
    const fx=x=>fa<va?.5+(x-.5)*(va/fa):x,fy=y=>fa>va?.5+(y-.5)*(fa/va):y;
    org={x:(fx(WIN.l)+fx(WIN.r))/2,y:(fy(WIN.t)+fy(WIN.b))/2};scenes[0].style.transformOrigin=`${org.x*100}% ${org.y*100}%`};
  addEventListener("resize",mapWin);requestAnimationFrame(mapWin);

  /* load each clip fully into memory (first one first) so every scroll position is instant */
  const got=[0,0,0,0],tot=[1,1,1,1];
  const paint=()=>{bar.style.transform=`scaleX(${got.reduce((a,b)=>a+b)/tot.reduce((a,b)=>a+b)})`};
  async function load(i){
    const v=videos[i],url=v.dataset.src+(small?"-sm.mp4":"-hd.mp4");
    try{const r=await fetch(url);if(!r.ok||!r.body)throw 0;tot[i]=+r.headers.get("content-length")||6e6;
      const rd=r.body.getReader(),parts=[];for(;;){const {done,value}=await rd.read();if(done)break;parts.push(value);got[i]+=value.length;paint()}
      v.src=URL.createObjectURL(new Blob(parts,{type:"video/mp4"}));}
    catch(e){v.src=url;v.preload="auto";got[i]=tot[i];paint()}
    v.load();await new Promise(r=>{if(v.readyState>=2)r();else{v.addEventListener("loadeddata",r,{once:true});setTimeout(r,9000)}});
    if(v.duration)dur[i]=v.duration-.04;
  }
  const ready=()=>document.body.classList.add("ready");setTimeout(ready,4500);   // never hold the page longer than this
  /* ---- frame-sequence mode (phones) ---- */
  const frames=[[],[],[],[]],canv=[],ctxs=[],shown=[-1,-1,-1,-1];
  function sizeCanvas(i){const c=canv[i],r=scenes[i].getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2,Math.max(1,(MOB?1280:1920)/Math.max(1,MOB?r.height:r.width)));   // never larger than the frames themselves
    const w=Math.round(r.width*d),h=Math.round(r.height*d);if(c.width!==w||c.height!==h){c.width=w;c.height=h;shown[i]=-1}}
  const okImg=im=>im&&im.complete&&im.naturalWidth>0;
  function paintImg(i,img){const c=canv[i],g=ctxs[i],cw=c.width,ch=c.height,iw=img.naturalWidth,ih=img.naturalHeight,s=Math.max(cw/iw,ch/ih);
    g.drawImage(img,(cw-iw*s)/2,(ch-ih*s)/2,iw*s,ih*s)}
  /* f can fall between two frames: the next frame is blended in, so motion stays fluid even on slow scrolls */
  function draw(i,f){const k0=Math.floor(f),a=f-k0,A=frames[i][k0];if(!okImg(A))return false;
    paintImg(i,A);const B=frames[i][k0+1];
    if(a>.03&&okImg(B)){const g=ctxs[i];g.globalAlpha=a;paintImg(i,B);g.globalAlpha=1}
    shown[i]=f;return true}
  const state=[0,0,0,0];   // 0 = not loaded, 1 = loading, 2 = ready
  function ensure(i){if(i<0||i>3||state[i])return;state[i]=1;loadSeq(i).then(()=>{if(state[i]===1)state[i]=2})}
  function release(i){if(!state[i])return;frames[i].forEach(im=>{im.onload=im.onerror=null;im.src=""});frames[i]=[];state[i]=0;shown[i]=-1}
  function manage(p){let a=0;for(let i=0;i<4;i++)if(p>=PLAY[i][0])a=i;
    for(let i=0;i<4;i++){if(Math.abs(i-a)<=1)ensure(i);else release(i)}}
  function loadSeq(i,onCoarse){return new Promise(res=>{let left=SEQ_N[i],coarse=Math.ceil(SEQ_N[i]/16);
    const order=[];for(const step of [16,8,4,2,1])for(let k=0;k<SEQ_N[i];k+=step)if(!order.includes(k))order.push(k);
    for(const k of order){const im=new Image();im.decoding="async";if(k%16===0)im.fetchPriority="high";
      im.onload=im.onerror=()=>{if(frames[i][k]!==im)return;if(im.decode&&im.naturalWidth)im.decode().catch(()=>{});if(k===0&&shown[i]<0)draw(i,0);if(k%16===0&&--coarse===0&&onCoarse)onCoarse();if(--left===0)res();bar.style.transform=`scaleX(${(i+1-left/SEQ_N[i])/4})`};
      im.src=`assets/tour/${SEQ_DIR}/${SEQ_NAMES[i]}/${String(k+1).padStart(3,"0")}.webp`;frames[i][k]=im}})}
  if(SEQ){
    scenes.forEach((s,i)=>{const v=videos[i];const c=document.createElement("canvas");c.className="tour-canvas";c.setAttribute("aria-hidden","true");
      s.insertBefore(c,v);v.removeAttribute("src");v.remove();canv[i]=c;ctxs[i]=c.getContext("2d");sizeCanvas(i)});
    addEventListener("resize",()=>canv.forEach((c,i)=>sizeCanvas(i)));
    (async()=>{state[0]=1;await loadSeq(0,()=>{ready();ensure(1)});state[0]=2;ready();ensure(1);loaderEl.classList.add("done")})();   // show the hero once the first rough pass is in
  }else{
    (async()=>{await load(0);ready();for(let i=1;i<4;i++)await load(i);loaderEl.classList.add("done")})();
  }
  if(!SEQ)addEventListener("touchstart",()=>videos.forEach(v=>v.play().then(()=>v.pause()).catch(()=>{})),{once:true,passive:true});

  let progress=0,smooth=0,mx=0,my=0,cx=0,cy=0,last=performance.now();
  const measure=()=>{const r=tour.getBoundingClientRect();progress=clamp(-r.top/Math.max(1,tour.offsetHeight-innerHeight))};
  addEventListener("scroll",measure,{passive:true});addEventListener("resize",measure);measure();smooth=progress;
  if(finePointer&&!reduceMotion)addEventListener("pointermove",e=>{mx=e.clientX/innerWidth-.5;my=e.clientY/innerHeight-.5},{passive:true});

  const P="perspective(1200px)";
  const dolly=(i,p)=>1+range(p,PLAY[i][0],PLAY[i][1])*.035;   // starts at 1:1 so footage stays pixel-sharp
  function scrub(i,p){
    if(SEQ){const f=Math.round(range(p,PLAY[i][0],PLAY[i][1])*(SEQ_N[i]-1)*16)/16;if(f===shown[i])return;
      if(!draw(i,f)){const k=Math.round(f);for(let d=1;d<SEQ_N[i];d++){if(draw(i,k-d)||draw(i,k+d))break}shown[i]=-1}return}   // stand-in frame: retry next tick
    const v=videos[i];if(v.readyState<1||v.seeking)return;const t=range(p,PLAY[i][0],PLAY[i][1])*dur[i];if(Math.abs(v.currentTime-t)>1/50)v.currentTime=t}

  function frame(now){
    const dt=Math.min(.05,(now-last)/1000);last=now;
    smooth=reduceMotion?progress:damp(smooth,progress,MOB?14:8,dt);
    const p=smooth;

    scenes.forEach((el,i)=>{
      const on=p>=VIS[i][0]&&p<=VIS[i][1];el.style.visibility=on?"visible":"hidden";
      if(!on)return;
      el.style.zIndex=2;el.style.opacity=1;el.style.filter="none";
      el.style.transform=`scale(${dolly(i,p).toFixed(4)})`;     // flat 2D at rest = no 3D resampling blur
      scrub(i,p);
    });

    /* 1 · dive: camera pushes forward and pitches into the house; bedroom resolves from the blur */
    const k0=range(p,T[0][0],T[0][1]);
    if(k0>0&&k0<1){
      const A=scenes[0],N=scenes[1],e=ease(k0);
      A.style.zIndex=3;N.style.zIndex=2;
      A.style.transform=`${P} translateZ(${(e*820).toFixed(1)}px) rotateX(${(-e*7).toFixed(3)}deg) rotateZ(${(e*1.2).toFixed(3)}deg) scale(${dolly(0,p).toFixed(4)})`;
      A.style.filter=`blur(${(e*e*12).toFixed(2)}px) brightness(${(1+e*.3).toFixed(3)})`;
      A.style.opacity=(1-smoothstep(clamp((k0-.42)/.5))).toFixed(3);
      const land=easeOut(clamp((k0-.3)/.7));
      N.style.transform=`${P} rotateX(${((1-land)*5).toFixed(3)}deg) scale(${(1.22-land*.2).toFixed(4)})`;
      N.style.filter=land<1?`blur(${((1-land)*9).toFixed(2)}px)`:"none";
    }
    /* 2 & 3 · walk through to the next room: the camera keeps moving forward,
       the room you leave pushes past you while the next one arrives in front */
    [[1,2,T[1]],[2,3,T[2]]].forEach(([a,n,w])=>{
      const k=range(p,w[0],w[1]);if(!(k>0&&k<1))return;
      const A=scenes[a],N=scenes[n],f=ease(k);
      A.style.zIndex=3;N.style.zIndex=2;
      A.style.transform=`scale(${(dolly(a,p)+f*.55).toFixed(4)})`;
      A.style.filter=`blur(${(f*f*6).toFixed(2)}px) brightness(${(1+f*.15).toFixed(3)})`;
      A.style.opacity=(1-smoothstep(clamp((k-.12)/.42))).toFixed(3);
      const land=easeOut(k);
      N.style.transform=`scale(${(1.14-land*.14+dolly(n,p)-1).toFixed(4)})`;
      N.style.filter=land<.97?`blur(${((1-land)*4).toFixed(2)}px)`:"none";
    });
    /* POV feel inside: a soft footstep sway on the walking shots (bedroom, kitchen, terrace) */
    if(!reduceMotion)[1,2,3].forEach(i=>{const s=scenes[i];if(s.style.visibility!=="visible"||s.style.filter!=="none")return;
      const lp=range(p,PLAY[i][0],PLAY[i][1]);s.style.transform+=` translate3d(${(Math.sin(lp*40)*.25).toFixed(3)}%,${(Math.abs(Math.sin(lp*40))*-.35).toFixed(3)}%,0)`});

    if(MOB)scenes.forEach(s=>{if(s.style.filter!=="none")s.style.filter="none"});if(SEQ)manage(p)   // blur is costly on phones
    /* gentle look-around with the mouse (translation only, so the picture stays crisp) */
    cx=damp(cx,mx,2.5,dt);cy=damp(cy,my,2.5,dt);
    if(!reduceMotion)camera.style.transform=`translate3d(${(-cx*14).toFixed(1)}px,${(-cy*9).toFixed(1)}px,0)`;

    stage.style.setProperty("--intro",(1-smoothstep(range(p,0,.05))).toFixed(3));
    stage.classList.toggle("show-copy",p<.05);
    fill.style.transform=`scaleY(${p.toFixed(4)})`;
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

}


const sec=$("#tour");if(!sec)return;
let started=false;const go=()=>{if(started)return;started=true;startTour()};
if("IntersectionObserver" in window){const io=new IntersectionObserver(es=>{if(es.some(e=>e.isIntersecting)){io.disconnect();go()}},{rootMargin:"150% 0px 150% 0px"});io.observe(sec)}else go();
})();
