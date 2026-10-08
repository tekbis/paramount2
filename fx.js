/* Paramount — shared motion layer: page transitions, scroll parallax, touch feedback */
(()=>{
  const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
  /* page transition curtain */
  let cur=document.querySelector(".page-curtain");if(!cur){cur=document.createElement("div");cur.className="page-curtain";cur.innerHTML='<img src="assets/official-logo.png" alt="">';document.body.prepend(cur)}
  const lift=()=>document.documentElement.classList.add("page-in");setTimeout(lift,reduce?0:1050);   // let the logo draw in, then reveal the page
  addEventListener("pageshow",e=>{if(e.persisted){document.documentElement.classList.remove("page-out");document.documentElement.classList.add("page-in");const n=document.querySelector(".site-nav");n&&n.classList.remove("open","closing","fade","leaving");document.body.classList.remove("menu-open")}});
  document.addEventListener("click",e=>{
    const a=e.target.closest("a[href]");if(!a||reduce||e.defaultPrevented||e.metaKey||e.ctrlKey||a.target==="_blank")return;
    const href=a.getAttribute("href");if(!href||href.startsWith("#")||/^(https?:|mailto:|tel:)/.test(href))return;
    const url=new URL(href,location.href);if(url.origin!==location.origin)return;
    const norm=p=>p.replace(/\/$/,"/index.html").replace(/\.html$/,"");if(norm(url.pathname)===norm(location.pathname)&&url.hash){return}   // same page (also "/" vs "/index.html" on Netlify)
    e.preventDefault();document.documentElement.classList.add("page-out");setTimeout(()=>location.href=url.href,420);
  });
  if(reduce)return;
  /* scroll parallax for photos & clips (cheap: one transform per element, only while on screen) */
  const items=[...document.querySelectorAll(".intro-image img,.corporate-image img,.xp-img img,.visit-map img,.reel-frame video,.lp-intro-img img,.res-img img,.closing-photo,.welcome-bg .amb")];
  items.forEach(el=>el.classList.add("plx"));
  const vis=new Set();const io=new IntersectionObserver(es=>es.forEach(en=>en.isIntersecting?vis.add(en.target):vis.delete(en.target)),{rootMargin:"100px 0px"});
  items.forEach(el=>io.observe(el));
  let raf=0;const tick=()=>{raf=0;const h=innerHeight;vis.forEach(el=>{const r=el.parentElement.getBoundingClientRect();const k=((r.top+r.height/2)-h/2)/h;el.style.setProperty("--plx",(k*-6).toFixed(2)+"%")})};
  addEventListener("scroll",()=>{if(!raf)raf=requestAnimationFrame(tick)},{passive:true});tick();
  /* touch feedback */
  document.addEventListener("touchstart",e=>{const t=e.target.closest(".button,.pill,.map-act,.loc-cities a,.room-enquire,.bb-submit,.res-submit,.slide-media,.xp-card,.visit-card,.room-card,.near-card,.stay-link,.outline-btn,.nav-enquire,.round-arrow,.slider-arrow,.xp-arrow");if(!t)return;t.classList.add("pressed");const off=()=>{t.classList.remove("pressed");removeEventListener("touchend",off);removeEventListener("touchcancel",off)};addEventListener("touchend",off,{passive:true});addEventListener("touchcancel",off,{passive:true})},{passive:true});
})();
