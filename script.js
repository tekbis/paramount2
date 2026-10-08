if("scrollRestoration" in history)history.scrollRestoration="manual";if(!location.hash)window.scrollTo(0,0);
const stays=[
  {city:"KHAIRA GALI · PAKISTAN",name:"Mountain Terrace Collection",description:"A change of pace among pine-lined hills, open skies and the quiet of the mountains.",images:["assets/khaira-gali.jpg"],alt:"Mountain Terrace Collection, Khaira Gali"},
  {city:"KARACHI · PAKISTAN",name:"Central Residence",description:"A calm city base with welcoming spaces to relax, gather and settle in.",images:["assets/karachi-exterior.webp","assets/karachi-patio.webp","assets/karachi-lounge.webp"],alt:"Exterior of Central Residence, Karachi"},
  {city:"ISLAMABAD · E-7",name:"Hillside Residence",description:"Comfortable interiors and an easy sense of home in the capital.",images:["assets/islamabad-residence.jpg"],alt:"Guest room at Hillside Residence, Islamabad"},
  {city:"LAHORE · DHA PHASE 3",name:"The Residence",description:"A graceful setting for work, discovery and time together in Lahore.",images:["assets/lahore-residence.jpg"],alt:"Exterior of The Residence, Lahore"}
];
const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
const reduceMotion=matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer=matchMedia("(hover: hover) and (pointer: fine)").matches;

/* ---------- residence dialog ---------- */
const dialog=$("#location-dialog");
const STAY_PAGES=["khaira-gali.html","karachi.html","islamabad.html","lahore.html"];
function openStay(index){location.href=STAY_PAGES[index];return;
  const stay=stays[index],image=$("#dialog-image"),thumbs=$("#dialog-thumbs");
  $("#stay").selectedIndex=index;
  image.src=stay.images[0];image.alt=stay.alt;
  $("#dialog-city").textContent=stay.city;
  $("#dialog-title").textContent=stay.name;
  $("#dialog-description").textContent=stay.description;
  thumbs.replaceChildren();
  if(stay.images.length>1) stay.images.forEach((src,i)=>{
    const b=document.createElement("button"),t=document.createElement("img");
    b.type="button";b.className=i===0?"active":"";b.setAttribute("aria-label",`Photo ${i+1} of ${stay.name}`);
    t.src=src;t.alt="";b.append(t);
    b.addEventListener("click",()=>{image.src=src;$$(".dialog-thumbs button").forEach(x=>x.classList.remove("active"));b.classList.add("active")});
    thumbs.append(b);
  });
  dialog.showModal();
}
$$("[data-open]").forEach(b=>b.addEventListener("click",()=>openStay(Number(b.dataset.open))));
$(".dialog-close").addEventListener("click",()=>dialog.close());
dialog.addEventListener("click",e=>{if(e.target===dialog)dialog.close()});
$("#dialog-enquire").addEventListener("click",()=>{dialog.close();const t=$("#book-bar");window.lenis?lenis.scrollTo(t,{offset:-72}):t.scrollIntoView({behavior:reduceMotion?"instant":"smooth"})});

/* ---------- booking ---------- */
const arrival=$("#arrival"),departure=$("#departure");
const localISO=d=>new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10);
arrival.min=localISO(new Date());departure.min=arrival.min;
arrival.addEventListener("change",()=>{
  if(!arrival.value)return;
  const next=new Date(arrival.value+"T12:00:00");next.setDate(next.getDate()+1);
  departure.min=localISO(next);
  if(departure.value<=arrival.value)departure.value="";
  departure.setCustomValidity("");
});
$("#booking-form").addEventListener("submit",e=>{
  e.preventDefault();
  if(departure.value<=arrival.value){departure.setCustomValidity("Check out must be after check in");departure.reportValidity();return}
  const msg=`Hello Paramount Hospitality, I would like to enquire about ${$("#stay").value} from ${arrival.value} to ${departure.value} for ${$("#guests").value}. Please let me know availability.`;
  window.open("https://wa.me/923331226656?text="+encodeURIComponent(msg),"_blank","noopener");
});
departure.addEventListener("change",()=>departure.setCustomValidity(""));

/* ---------- reviews: card rail + spotlight hover ---------- */
(()=>{
  const track=$("#review-track");if(!track)return;
  const step=()=>{const c=track.querySelector(".rcard");return c?c.getBoundingClientRect().width+28:400};
  $("#review-prev").addEventListener("click",()=>track.scrollBy({left:-step(),behavior:"smooth"}));
  $("#review-next").addEventListener("click",()=>track.scrollBy({left:step(),behavior:"smooth"}));
  $$(".rcard").forEach(c=>c.addEventListener("pointermove",e=>{const r=c.getBoundingClientRect();c.style.setProperty("--mx",(e.clientX-r.left)+"px");c.style.setProperty("--my",(e.clientY-r.top)+"px")}));
})();

/* ---------- menu, reveal, year ---------- */
const menu=$(".menu-toggle"),nav=$(".site-nav");
menu.addEventListener("click",()=>{const open=nav.classList.toggle("open");menu.setAttribute("aria-expanded",String(open));document.body.classList.toggle("menu-open",open)});
$$(".site-nav a").forEach(a=>a.addEventListener("click",()=>{nav.classList.remove("open");menu.setAttribute("aria-expanded","false")}));
if("IntersectionObserver" in window){const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("visible");io.unobserve(e.target)}}),{threshold:.08});$$(".reveal").forEach(el=>io.observe(el))}else $$(".reveal").forEach(el=>el.classList.add("visible"));
$("#year").textContent=new Date().getFullYear();

/* ================= SMOOTH SCROLL (Lenis) ================= */
var lenis=null;
if(window.Lenis&&!reduceMotion&&!matchMedia("(pointer:coarse)").matches){
  lenis=new Lenis({duration:1.35,easing:t=>Math.min(1,1.001-Math.pow(2,-10*t)),smoothWheel:true,wheelMultiplier:.9});
  const raf=t=>{lenis.raf(t);requestAnimationFrame(raf)};requestAnimationFrame(raf);
  document.addEventListener("click",e=>{
    const a=e.target.closest('a[href^="#"]');if(!a)return;
    const id=a.getAttribute("href");if(id.length<2)return;
    const t=document.querySelector(id);if(!t)return;
    e.preventDefault();lenis.scrollTo(t,{offset:id==="#tour"?0:-72,duration:1.6});
  });
  dialog.addEventListener("close",()=>lenis.start());
  const open=dialog.showModal.bind(dialog);dialog.showModal=()=>{lenis.stop();open()};
}

/* ================= HEADER (home) ================= */
(()=>{const header=$(".site-header");if(!header)return;let prevY=scrollY;
  const upd=()=>{const y=scrollY;header.classList.toggle("scrolled",y>innerHeight*.55);
    header.classList.toggle("hidden",innerWidth>820&&y>innerHeight&&y>prevY+2&&!nav.classList.contains("open"));if(y<prevY-2)header.classList.remove("hidden");prevY=y};
  addEventListener("scroll",upd,{passive:true});upd();
})();

/* ================= INTERACTIONS ================= */
$$(".section h2, .closing h2").forEach(h=>{
  let i=0;
  const walk=node=>[...node.childNodes].forEach(n=>{
    if(n.nodeType===3){
      const frag=document.createDocumentFragment();
      n.textContent.split(/(\s+)/).forEach(part=>{
        if(!part)return;
        if(/^\s+$/.test(part)){frag.append(part);return}
        const w=document.createElement("span");w.className="w";const s=document.createElement("span");s.textContent=part;s.style.setProperty("--i",i++);w.append(s);frag.append(w);
      });
      n.replaceWith(frag);
    }else if(n.nodeType===1&&n.tagName!=="BR")walk(n);
  });
  walk(h);h.classList.add("split");
});

if(finePointer&&!reduceMotion){
  $$("[data-tilt]").forEach(el=>{
    const g=document.createElement("span");g.className="glare";el.append(g);
    el.addEventListener("pointermove",e=>{
      const r=el.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
      el.style.transition="transform .12s linear";
      el.style.transform=`perspective(1000px) rotateX(${(.5-y)*6}deg) rotateY(${(x-.5)*8}deg) translateY(-6px)`;
      el.style.setProperty("--gx",x*100+"%");el.style.setProperty("--gy",y*100+"%");
    });
    el.addEventListener("pointerleave",()=>{el.style.transition="";el.style.transform=""});
  });
  $$(".magnetic").forEach(el=>{
    el.addEventListener("pointermove",e=>{const r=el.getBoundingClientRect();el.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.25}px,${(e.clientY-r.top-r.height/2)*.35}px)`});
    el.addEventListener("pointerleave",()=>{el.style.transform=""});
  });
  const cursor=$(".cursor"),dot=$(".cursor-dot"),ring=$(".cursor-ring"),label=$(".cursor-ring em");
  document.body.classList.add("has-cursor");
  let cx=-100,cy=-100,rx=-100,ry=-100;
  addEventListener("pointermove",e=>{cx=e.clientX;cy=e.clientY;dot.style.setProperty("--x",cx+"px");dot.style.setProperty("--y",cy+"px")},{passive:true});
  (function loop(){rx+=(cx-rx)*.18;ry+=(cy-ry)*.18;ring.style.setProperty("--x",rx+"px");ring.style.setProperty("--y",ry+"px");requestAnimationFrame(loop)})();
  document.addEventListener("pointerover",e=>{
    const lab=e.target.closest("[data-cursor]"),link=e.target.closest("a,button,input,select,label");
    cursor.classList.toggle("label",!!lab);label.textContent=lab?lab.dataset.cursor:"";
    cursor.classList.toggle("link",!!link&&!lab);
  });
}

/* scroll progress + closing parallax */
if(!reduceMotion){
  const closing=$(".closing");let raf=0;
  const upd=()=>{raf=0;
    document.documentElement.style.setProperty("--page-progress",Math.min(1,scrollY/Math.max(1,document.documentElement.scrollHeight-innerHeight)).toFixed(4));
    if(!closing)return;const b=closing.getBoundingClientRect();
    if(b.bottom>0&&b.top<innerHeight)closing.style.setProperty("--closing-shift",Math.max(-24,Math.min(24,(innerHeight/2-(b.top+b.height/2))/innerHeight*36)).toFixed(1)+"px");
  };
  addEventListener("scroll",()=>{if(!raf)raf=requestAnimationFrame(upd)},{passive:true});upd();
}

/* ---------- Locations dropdown ---------- */
(()=>{
  const drop=$(".nav-drop"),toggle=$(".nav-drop-toggle");if(!drop)return;
  toggle.addEventListener("click",e=>{e.stopPropagation();const o=drop.classList.toggle("open");toggle.setAttribute("aria-expanded",String(o))});
  document.addEventListener("click",e=>{if(!drop.contains(e.target)){drop.classList.remove("open");toggle.setAttribute("aria-expanded","false")}});
  document.addEventListener("keydown",e=>{if(e.key==="Escape"){drop.classList.remove("open");toggle.setAttribute("aria-expanded","false")}});
  $$(".nav-drop-menu button").forEach(b=>b.addEventListener("click",()=>{drop.classList.remove("open");nav.classList.remove("open");menu.setAttribute("aria-expanded","false")}));
})();

/* ---------- Residence slider: arrows, drag, progress ---------- */
$$("[data-slider]").forEach(slider=>{
  const track=slider.querySelector(".slider-track"),prev=slider.querySelector(".prev"),next=slider.querySelector(".next");
  const bar=slider.parentElement.querySelector(".slider-bar span");
  const step=()=>{const s=track.querySelector(".slide");return s?s.getBoundingClientRect().width+32:400};
  prev.addEventListener("click",()=>track.scrollBy({left:-step()}));
  next.addEventListener("click",()=>track.scrollBy({left:step()}));
  const update=()=>{
    const max=track.scrollWidth-track.clientWidth;
    prev.disabled=track.scrollLeft<4;next.disabled=track.scrollLeft>max-4;
    if(bar){const w=Math.max(.12,track.clientWidth/track.scrollWidth);bar.style.width=w*100+"%";bar.style.transform=`translateX(${max>0?track.scrollLeft/max*(1/w-1)*100:0}%)`}
  };
  track.addEventListener("scroll",update,{passive:true});addEventListener("resize",update);
  track.querySelectorAll("img").forEach(i=>i.complete?0:i.addEventListener("load",update));
  update();
  // mouse drag to scroll
  let down=false,startX=0,startL=0,moved=0;
  track.addEventListener("pointerdown",e=>{if(e.pointerType!=="mouse")return;down=true;moved=0;startX=e.clientX;startL=track.scrollLeft});
  addEventListener("pointermove",e=>{if(!down)return;const dx=e.clientX-startX;moved=Math.max(moved,Math.abs(dx));if(moved>4){track.classList.add("dragging");track.scrollLeft=startL-dx}});
  addEventListener("pointerup",()=>{if(!down)return;down=false;track.classList.remove("dragging");});
  track.addEventListener("click",e=>{if(moved>6){e.stopPropagation();e.preventDefault();moved=0}},true);
  track.addEventListener("keydown",e=>{if(e.key==="ArrowRight")next.click();if(e.key==="ArrowLeft")prev.click()});
});


/* ---------- Welcome gallery: drag, keys, scrollbar ---------- */
(()=>{
  const g=$("[data-gallery]");if(!g)return;
  const bar=$(".gallery-scroll"),thumb=bar.querySelector("span");
  const sync=()=>{const max=g.scrollWidth-g.clientWidth,w=g.clientWidth/g.scrollWidth;thumb.style.width=w*100+"%";thumb.style.transform=`translateX(${max>0?g.scrollLeft/max*(1/w-1)*100:0}%)`};
  g.addEventListener("scroll",sync,{passive:true});addEventListener("resize",sync);g.querySelectorAll("img").forEach(i=>i.addEventListener("load",sync));sync();
  let down=false,sx=0,sl=0,moved=0,vx=0,lastX=0,raf=0;
  g.addEventListener("pointerdown",e=>{if(e.pointerType!=="mouse")return;cancelAnimationFrame(raf);down=true;moved=0;sx=lastX=e.clientX;sl=g.scrollLeft;g.classList.add("dragging")});
  addEventListener("pointermove",e=>{if(!down)return;const dx=e.clientX-sx;moved=Math.max(moved,Math.abs(dx));vx=e.clientX-lastX;lastX=e.clientX;g.scrollLeft=sl-dx});
  addEventListener("pointerup",()=>{if(!down)return;down=false;g.classList.remove("dragging");
    const glide=()=>{vx*=.94;g.scrollLeft-=vx;if(Math.abs(vx)>.4)raf=requestAnimationFrame(glide)};glide()});   // inertia
  g.addEventListener("keydown",e=>{if(e.key==="ArrowRight")g.scrollBy({left:g.clientWidth*.6,behavior:"smooth"});if(e.key==="ArrowLeft")g.scrollBy({left:-g.clientWidth*.6,behavior:"smooth"})});
  bar.addEventListener("click",e=>{const r=bar.getBoundingClientRect();g.scrollTo({left:(e.clientX-r.left)/r.width*(g.scrollWidth-g.clientWidth),behavior:"smooth"})});
})();

/* ---------- Google Map in Locations ---------- */
(()=>{
  const frame=$("#gmap"),open=$("#gmap-open");if(!frame)return;
  const btns=$$(".map-loc");
  btns.forEach(b=>b.addEventListener("click",()=>{
    if(b.classList.contains("on"))return;
    btns.forEach(x=>x.classList.toggle("on",x===b));
    frame.classList.add("swap");
    setTimeout(()=>{frame.src=`https://maps.google.com/maps?q=${b.dataset.q}&z=${b.dataset.z}&output=embed`},250);
    open.href=`https://www.google.com/maps/search/?api=1&query=${b.dataset.q}`;
    $("#gmap-dir").href=`https://www.google.com/maps/dir/?api=1&destination=${b.dataset.q}`;
    $("#gmap-page").href=b.dataset.page;
    const mf=$(".gmap-frame .mf-card");if(mf){mf.href=`https://www.google.com/maps/search/?api=1&query=${b.dataset.q}`;mf.querySelector("b").textContent=decodeURIComponent(b.dataset.q).replace(/, Pakistan$/,"")}
  }));
  frame.addEventListener("load",()=>frame.classList.remove("swap"));
})();

/* ---------- inside a preview frame Google Maps is blocked: show the residence instead of a blank box ---------- */
const MAP_PHOTO={"islamabad.html":"assets/islamabad-residence.jpg","karachi.html":"assets/karachi-exterior.webp","lahore.html":"assets/lahore-residence.jpg","khaira-gali.html":"assets/khaira-gali.jpg"};
if(window.top!==window.self){const f=$("#gmap");if(f){const box=f.parentElement;box.classList.add("map-preview");
  const paint=()=>{const on=$(".map-loc.on");box.style.setProperty("--ph",`url("${MAP_PHOTO[on?.dataset.page]||"assets/islamabad-residence.jpg"}")`);box.dataset.addr=on?.querySelector("small")?.textContent||""};
  paint();$$(".map-loc").forEach(b=>b.addEventListener("click",()=>setTimeout(paint,10)))}}

/* ---------- ambient video loops: load + play only while on screen ---------- */
(()=>{
  const vids=$$("video.amb");if(!vids.length)return;
  const io=new IntersectionObserver(es=>es.forEach(e=>{
    const v=e.target;
    if(e.isIntersecting){if(!v.src){v.src=v.dataset.src;v.load()}if(!reduceMotion){const p=v.play();p&&p.catch(()=>{})}}
    else v.pause();
  }),{rootMargin:"200px 0px"});
  vids.forEach(v=>{v.muted=true;io.observe(v)});
})();

/* ---------- animated navigation: sliding indicator + staggered entrance ---------- */
(()=>{
  const navEl=$(".site-nav");if(!navEl||matchMedia("(max-width:820px)").matches)return;
  const ink=document.createElement("span");ink.className="nav-ink";navEl.append(ink);
  const links=$$(".site-nav>.nav-link,.site-nav>.nav-drop>.nav-link");
  const move=el=>{const r=el.getBoundingClientRect(),p=navEl.getBoundingClientRect();ink.style.width=r.width-40+"px";ink.style.transform=`translateX(${r.left-p.left+20}px)`;ink.classList.add("on")};
  links.forEach((l,i)=>{l.style.setProperty("--n",i);l.addEventListener("mouseenter",()=>move(l))});
  navEl.addEventListener("mouseleave",()=>ink.classList.remove("on"));
  // highlight the section you're in
  const map={"#about":1,"#locations":2,"#reviews":3,"#contact":4};
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){const k=map["#"+e.target.id];links.forEach((l,i)=>l.classList.toggle("current",i===k))}}),{rootMargin:"-45% 0px -50% 0px"});
  Object.keys(map).forEach(id=>{const s=$(id);s&&io.observe(s)});
})();


/* ---------- Bespoke experiences carousel ---------- */
(()=>{
  const track=$("#xp-track");if(!track)return;
  const cards=[...track.children],dots=$("#xp-dots");let i=0;
  cards.forEach((_,k)=>{const d=document.createElement("button");d.type="button";d.setAttribute("aria-label",`Experience ${k+1}`);d.addEventListener("click",()=>go(k));dots.append(d)});
  function go(k){i=(k+cards.length)%cards.length;const c=cards[i];
    track.style.transform=`translate3d(${-(c.offsetLeft-(track.parentElement.clientWidth-c.offsetWidth)/2)}px,0,0)`;
    cards.forEach((x,n)=>x.classList.toggle("on",n===i));[...dots.children].forEach((d,n)=>d.classList.toggle("on",n===i))}
  $(".xp-arrow.prev").addEventListener("click",()=>{go(i-1);reset()});$(".xp-arrow.next").addEventListener("click",()=>{go(i+1);reset()});
  cards.forEach((c,n)=>c.addEventListener("click",()=>{if(n!==i){go(n);reset()}}));
  let sx=0;track.addEventListener("touchstart",e=>sx=e.touches[0].clientX,{passive:true});
  track.addEventListener("touchend",e=>{const dx=e.changedTouches[0].clientX-sx;if(Math.abs(dx)>40){go(i+(dx<0?1:-1));reset()}});
  let t;const reset=()=>{clearInterval(t);if(!reduceMotion)t=setInterval(()=>go(i+1),6500)};
  addEventListener("resize",()=>go(i));requestAnimationFrame(()=>go(0));reset();
})();
$$(".slider .slide").forEach((s,i)=>s.style.setProperty("--si",i));
/* lock page scroll while the phone menu is open */
(()=>{const t=$(".menu-toggle"),n=$(".site-nav");if(!t)return;new MutationObserver(()=>{const o=n.classList.contains("open");document.body.classList.toggle("menu-open",o);window.lenis&&(o?lenis.stop():lenis.start());t.setAttribute("aria-label",o?"Close menu":"Open menu")}).observe(n,{attributes:true,attributeFilter:["class"]})})();

/* ---------- reviews on touch screens: the card in view lights up as you scroll/swipe ---------- */
(()=>{
  const t=$("#review-track");if(!t||matchMedia("(hover:hover) and (pointer:fine)").matches)return;
  const cards=[...t.querySelectorAll(".rcard")];
  const dots=document.createElement("div");dots.className="review-dots-m";dots.setAttribute("aria-hidden","true");
  cards.forEach(()=>dots.append(document.createElement("i")));t.after(dots);
  let inView=false;
  const pick=()=>{const r=t.getBoundingClientRect(),mid=r.left+r.width/2;let best=0,bd=1e9;
    cards.forEach((c,i)=>{const b=c.getBoundingClientRect(),d=Math.abs(b.left+b.width/2-mid);if(d<bd){bd=d;best=i}});
    cards.forEach((c,i)=>c.classList.toggle("live",inView&&i===best));[...dots.children].forEach((d,i)=>d.classList.toggle("on",i===best))};
  new IntersectionObserver(es=>{inView=es[0].isIntersecting;pick()},{threshold:.45}).observe(t);
  let raf=0;t.addEventListener("scroll",()=>{if(!raf)raf=requestAnimationFrame(()=>{raf=0;pick()})},{passive:true});
  addEventListener("resize",pick);pick();
})();

/* intro: residence exteriors slideshow, synced with the city links */
(()=>{const box=document.getElementById("intro-show");if(!box)return;
  const slides=[...box.querySelectorAll(".is-slide")],bars=[...box.querySelectorAll(".is-bars i")],links=[...document.querySelectorAll(".intro-cities a")];
  const city=box.querySelector(".is-city"),name=box.querySelector(".is-name");let at=0,timer=0;const DUR=5200;
  function go(n){at=(n+slides.length)%slides.length;
    slides.forEach((s,i)=>s.classList.toggle("on",i===at));
    bars.forEach((b,i)=>{b.classList.toggle("done",i<at);b.classList.remove("run");if(i===at){void b.offsetWidth;b.classList.add("run")}});
    links.forEach((l,i)=>l.classList.toggle("on",i===at));
    const l=links[at];if(l){box.classList.add("swap");setTimeout(()=>{city.textContent=l.querySelector("span").textContent;name.textContent=l.querySelector("small").textContent;box.classList.remove("swap")},260)}
    clearTimeout(timer);timer=setTimeout(()=>go(at+1),DUR)}
  links.forEach((l,i)=>l.addEventListener("pointerenter",()=>{if(matchMedia("(hover:hover)").matches)go(i)}));
  const io=new IntersectionObserver(es=>es.forEach(en=>{if(en.isIntersecting){go(at);}else clearTimeout(timer)}),{threshold:.25});io.observe(box);
})();

/* ================= HERO: HD property film ================= */
(()=>{const hero=document.getElementById("hero");if(!hero)return;const v=hero.querySelector(".hc-video");
  const ready=()=>document.body.classList.add("ready");setTimeout(ready,2500);
  const poster=new Image();poster.onload=poster.onerror=ready;poster.src=v.getAttribute("poster");
  const small=matchMedia("(max-width:820px) and (orientation:portrait)").matches;
  v.src=small?v.dataset.m:v.dataset.d;v.muted=true;
  v.addEventListener("playing",()=>hero.classList.add("playing"),{once:true});
  const play=()=>{if(reduceMotion)return;const p=v.play();p&&p.catch(()=>{})};play();
  addEventListener("touchstart",play,{once:true,passive:true});
  document.addEventListener("visibilitychange",()=>{if(document.hidden)v.pause();else play()});
  const io=new IntersectionObserver(es=>es.forEach(e=>e.isIntersecting?play():v.pause()),{threshold:0});io.observe(hero);
  if(!reduceMotion){let raf=0;const upd=()=>{raf=0;const y=scrollY;if(y>innerHeight*1.3)return;hero.style.setProperty("--hs",Math.min(1,y/innerHeight).toFixed(4))};
    addEventListener("scroll",()=>{if(!raf)raf=requestAnimationFrame(upd)},{passive:true});upd()}
})();

/* phone menu: close with a soft fade, then glide to the section (no jump, no white flash) */
(()=>{const n=document.querySelector(".site-nav"),t=document.querySelector(".menu-toggle");if(!n||!t)return;
  const close=()=>{n.classList.add("closing");n.classList.remove("open");t.setAttribute("aria-expanded","false");setTimeout(()=>n.classList.remove("closing"),420)};
  n.addEventListener("click",e=>{if(!n.classList.contains("open"))return;const a=e.target.closest("a[href]");if(!a)return;
    const url=new URL(a.getAttribute("href"),location.href);
    if(url.origin===location.origin&&url.pathname.replace(/\/$/,"/index.html").replace(/\.html$/,"")===location.pathname.replace(/\/$/,"/index.html").replace(/\.html$/,"")&&url.hash){
      const target=document.querySelector(url.hash);if(!target)return;
      if(a.getAttribute("href")==="#reserve")return;   // booking pop-up handles itself
      e.preventDefault();e.stopImmediatePropagation();
      /* keep the menu covering the screen, jump underneath it, then fade the menu away to reveal the section */
      n.classList.add("closing");n.classList.remove("open");t.setAttribute("aria-expanded","false");
      requestAnimationFrame(()=>{const y=target.getBoundingClientRect().top+scrollY-72;
        window.lenis?lenis.scrollTo(y,{immediate:true,force:true}):window.scrollTo({top:y,behavior:"instant"});
        target.querySelectorAll(".reveal").forEach(r=>r.classList.add("visible"));target.classList.add("visible");
        history.replaceState(null,"",url.hash);
        requestAnimationFrame(()=>{n.classList.add("fade");setTimeout(()=>n.classList.remove("closing","fade"),480)})});
    }else if(url.origin===location.origin&&!a.target){e.preventDefault();e.stopImmediatePropagation();
      let played=false;try{played=!!sessionStorage.getItem("phgIntro")}catch(err){}
      if(played){location.href=url.href;return}
      n.classList.add("leaving");document.documentElement.classList.add("page-out");setTimeout(()=>{location.href=url.href},340)}
  },true);
})();
