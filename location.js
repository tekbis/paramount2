/* Paramount — shared script for the location pages */
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const reduceMotion=matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer=matchMedia("(hover: hover) and (pointer: fine)").matches;
const WA="923331226656", EMAIL="info@phg.world", PLACE=document.body.dataset.location||"Paramount Hospitality";

/* smooth scrolling */
var lenis=null;
if(window.Lenis&&!reduceMotion&&!matchMedia("(pointer:coarse)").matches){
  lenis=new Lenis({duration:1.3,easing:t=>Math.min(1,1.001-Math.pow(2,-10*t)),wheelMultiplier:.9});
  const raf=t=>{lenis.raf(t);requestAnimationFrame(raf)};requestAnimationFrame(raf);
}
const goTo=t=>lenis?lenis.scrollTo(t,{offset:-80,duration:1.5}):t.scrollIntoView({behavior:reduceMotion?"instant":"smooth"});
document.addEventListener("click",e=>{const a=e.target.closest('a[href^="#"]');if(!a)return;const t=document.querySelector(a.getAttribute("href"));if(!t)return;e.preventDefault();goTo(t);nav.classList.remove("open")});

/* header, menu, dropdown */
const header=$(".site-header"),menu=$(".menu-toggle"),nav=$(".site-nav"),drop=$(".nav-drop"),dropBtn=$(".nav-drop-toggle");
menu.addEventListener("click",()=>{const o=nav.classList.toggle("open");menu.setAttribute("aria-expanded",String(o));document.body.classList.toggle("menu-open",o)});
dropBtn.addEventListener("click",e=>{e.stopPropagation();const o=drop.classList.toggle("open");dropBtn.setAttribute("aria-expanded",String(o))});
document.addEventListener("click",e=>{if(!drop.contains(e.target)){drop.classList.remove("open");dropBtn.setAttribute("aria-expanded","false")}});
document.addEventListener("keydown",e=>{if(e.key==="Escape"){drop.classList.remove("open");closeLB()}});
let prevY=scrollY;
addEventListener("scroll",()=>{
  const y=scrollY;header.classList.toggle("scrolled",y>innerHeight*.6);
  header.classList.toggle("hidden",innerWidth>820&&y>innerHeight&&y>prevY+2&&!nav.classList.contains("open"));if(y<prevY-2)header.classList.remove("hidden");prevY=y;
  document.documentElement.style.setProperty("--page-progress",Math.min(1,y/Math.max(1,document.documentElement.scrollHeight-innerHeight)).toFixed(4));
  const hero=$(".lp-hero-media");if(hero&&!reduceMotion&&y<innerHeight*1.2)hero.style.transform=`translate3d(0,${(y*.3).toFixed(1)}px,0) scale(${(1.06+y/innerHeight*.06).toFixed(4)})`;
},{passive:true});
$("#year").textContent=new Date().getFullYear();

/* reveal + word-by-word headings */
$$(".section h2,.lp-gallery h2,.newsletter h2").forEach(h=>{let i=0;const walk=n=>[...n.childNodes].forEach(c=>{if(c.nodeType===3){const f=document.createDocumentFragment();c.textContent.split(/(\s+)/).forEach(p=>{if(!p)return;if(/^\s+$/.test(p)){f.append(p);return}const w=document.createElement("span");w.className="w";const s=document.createElement("span");s.textContent=p;s.style.setProperty("--i",i++);w.append(s);f.append(w)});c.replaceWith(f)}else if(c.nodeType===1&&c.tagName!=="BR")walk(c)});walk(h);h.classList.add("split")});
if("IntersectionObserver" in window){const io=new IntersectionObserver(es=>es.forEach(en=>{if(en.isIntersecting){en.target.classList.add("visible");io.unobserve(en.target)}}),{threshold:.1});$$(".reveal,.split").forEach(el=>io.observe(el))}else $$(".reveal").forEach(el=>el.classList.add("visible"));
requestAnimationFrame(()=>document.body.classList.add("loaded"));

/* room photo strips */
$$("[data-strip]").forEach(strip=>{
  const track=strip.querySelector(".rs-track"),dots=[...strip.querySelectorAll(".rs-dots i")];
  const idx=()=>Math.round(track.scrollLeft/track.clientWidth);
  const paint=()=>dots.forEach((d,k)=>d.classList.toggle("on",k===idx()));
  strip.querySelector(".prev")?.addEventListener("click",()=>track.scrollBy({left:-track.clientWidth,behavior:"smooth"}));
  strip.querySelector(".next")?.addEventListener("click",()=>track.scrollBy({left:track.clientWidth,behavior:"smooth"}));
  track.addEventListener("scroll",paint,{passive:true});paint();
});

/* horizontal gallery: drag + inertia + scrollbar */
(()=>{const g=$("[data-gallery]");if(!g)return;const bar=$(".gallery-scroll"),th=bar.querySelector("span");
  const sync=()=>{const max=g.scrollWidth-g.clientWidth,w=g.clientWidth/g.scrollWidth;th.style.width=w*100+"%";th.style.transform=`translateX(${max>0?g.scrollLeft/max*(1/w-1)*100:0}%)`};
  g.addEventListener("scroll",sync,{passive:true});addEventListener("resize",sync);g.querySelectorAll("img").forEach(i=>i.addEventListener("load",sync));sync();
  let down=false,sx=0,sl=0,moved=0,vx=0,lx=0,raf=0;
  g.addEventListener("pointerdown",e=>{if(e.pointerType!=="mouse")return;cancelAnimationFrame(raf);down=true;moved=0;sx=lx=e.clientX;sl=g.scrollLeft;g.classList.add("dragging")});
  addEventListener("pointermove",e=>{if(!down)return;const dx=e.clientX-sx;moved=Math.max(moved,Math.abs(dx));vx=e.clientX-lx;lx=e.clientX;g.scrollLeft=sl-dx});
  addEventListener("pointerup",()=>{if(!down)return;down=false;g.classList.remove("dragging");const glide=()=>{vx*=.94;g.scrollLeft-=vx;if(Math.abs(vx)>.4)raf=requestAnimationFrame(glide)};glide()});
  g.addEventListener("click",e=>{if(moved>6){e.stopPropagation();e.preventDefault();moved=0}},true);
  bar.addEventListener("click",e=>{const r=bar.getBoundingClientRect();g.scrollTo({left:(e.clientX-r.left)/r.width*(g.scrollWidth-g.clientWidth),behavior:"smooth"})});
})();

/* lightbox (full, uncropped photos) */
const lb=$("#lightbox"),lbImg=lb.querySelector("img"),lbCount=lb.querySelector(".lb-count");let set=[],at=0;
function showLB(i){at=(i+set.length)%set.length;lbImg.classList.add("swap");const src=set[at];const im=new Image();im.onload=()=>{lbImg.src=src;lbImg.classList.remove("swap")};im.src=src;lbCount.textContent=`${at+1} / ${set.length}`;lb.querySelectorAll(".lb-nav").forEach(b=>b.hidden=set.length<2)}
function closeLB(){if(lb.hidden)return;lb.classList.remove("open");setTimeout(()=>lb.hidden=true,350);lenis&&lenis.start()}
document.addEventListener("click",e=>{const b=e.target.closest("[data-lightbox]");if(!b)return;const group=b.dataset.lightbox;const all=$$(`[data-lightbox="${group}"]`);set=[...new Set(all.map(x=>x.dataset.src))];lb.hidden=false;requestAnimationFrame(()=>lb.classList.add("open"));lenis&&lenis.stop();showLB(set.indexOf(b.dataset.src))});
lb.querySelector(".lb-close").addEventListener("click",closeLB);
lb.addEventListener("click",e=>{if(e.target===lb)closeLB()});
lb.querySelector(".prev").addEventListener("click",()=>showLB(at-1));lb.querySelector(".next").addEventListener("click",()=>showLB(at+1));
document.addEventListener("keydown",e=>{if(lb.hidden)return;if(e.key==="ArrowRight")showLB(at+1);if(e.key==="ArrowLeft")showLB(at-1)});

/* forms: reservation → WhatsApp, contact & newsletter → email */
const res=$("#res-form");
if(res){
  const today=new Date(Date.now()-new Date().getTimezoneOffset()*60000).toISOString().slice(0,10);
  res.in.min=today;res.out.min=today;
  res.in.addEventListener("change",()=>{res.out.min=res.in.value;if(res.out.value&&res.out.value<=res.in.value)res.out.value=""});
  res.addEventListener("submit",e=>{e.preventDefault();
    if(res.out.value<=res.in.value){res.out.setCustomValidity("Check-out must be after check-in");res.out.reportValidity();return}res.out.setCustomValidity("");
    const f=res.elements;const msg=`Hello Paramount Hospitality, I would like to book ${PLACE}.\nName: ${f.name.value}\nPhone: ${f.phone.value}\nCheck-in: ${f.in.value}\nCheck-out: ${f.out.value}\nRoom type: ${f.room.value}\nRooms: ${f.rooms.value}\nGuests: ${f.guests.value}${f.email.value?"\nEmail: "+f.email.value:""}`;
    window.open(`https://wa.me/${WA}?text=${encodeURIComponent(msg)}`,"_blank","noopener")});
  res.out.addEventListener("change",()=>res.out.setCustomValidity(""));
}
$$(".room-enquire").forEach(b=>b.addEventListener("click",()=>{res.room.value=b.dataset.room;goTo($("#reserve"));setTimeout(()=>res.name.focus({preventScroll:true}),900)}));
$("#contact-form")?.addEventListener("submit",e=>{e.preventDefault();const f=e.target.elements;
  const body=`Name: ${f.first.value} ${f.last.value}\nEmail: ${f.email.value}\nPhone: ${f.phone.value}\n\n${f.msg.value}`;
  location.href=`mailto:${EMAIL}?subject=${encodeURIComponent("Enquiry: "+PLACE)}&body=${encodeURIComponent(body)}`});
$("[data-newsletter]")?.addEventListener("submit",e=>{e.preventDefault();const em=e.target.querySelector("input").value;
  location.href=`mailto:${EMAIL}?subject=${encodeURIComponent("Newsletter subscription")}&body=${encodeURIComponent("Please subscribe "+em+" to the Paramount newsletter.")}`;
  e.target.classList.add("done");e.target.querySelector("button").textContent="Thank you"});

/* reviews rail + spotlight */
(()=>{const t=$("#review-track");if(!t)return;const step=()=>(t.querySelector(".rcard")?.getBoundingClientRect().width||400)+28;
  $("#review-prev").addEventListener("click",()=>t.scrollBy({left:-step(),behavior:"smooth"}));$("#review-next").addEventListener("click",()=>t.scrollBy({left:step(),behavior:"smooth"}));
  $$(".rcard").forEach(c=>c.addEventListener("pointermove",e=>{const r=c.getBoundingClientRect();c.style.setProperty("--mx",(e.clientX-r.left)+"px");c.style.setProperty("--my",(e.clientY-r.top)+"px")}));
})();

/* desktop niceties: tilt, magnetic buttons, cursor */
if(finePointer&&!reduceMotion){
  $$("[data-tilt]").forEach(el=>{const g=document.createElement("span");g.className="glare";el.append(g);
    el.addEventListener("pointermove",e=>{const r=el.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;el.style.transition="transform .12s linear";el.style.transform=`perspective(1000px) rotateX(${(.5-y)*6}deg) rotateY(${(x-.5)*8}deg)`;el.style.setProperty("--gx",x*100+"%");el.style.setProperty("--gy",y*100+"%")});
    el.addEventListener("pointerleave",()=>{el.style.transition="";el.style.transform=""})});
  $$(".magnetic").forEach(el=>{el.addEventListener("pointermove",e=>{const r=el.getBoundingClientRect();el.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.25}px,${(e.clientY-r.top-r.height/2)*.35}px)`});el.addEventListener("pointerleave",()=>el.style.transform="")});
  const cur=$(".cursor"),dot=$(".cursor-dot"),ring=$(".cursor-ring"),lab=$(".cursor-ring em");document.body.classList.add("has-cursor");
  let cx=-100,cy=-100,rx=-100,ry=-100;
  addEventListener("pointermove",e=>{cx=e.clientX;cy=e.clientY;dot.style.setProperty("--x",cx+"px");dot.style.setProperty("--y",cy+"px")},{passive:true});
  (function loop(){rx+=(cx-rx)*.18;ry+=(cy-ry)*.18;ring.style.setProperty("--x",rx+"px");ring.style.setProperty("--y",ry+"px");requestAnimationFrame(loop)})();
  document.addEventListener("pointerover",e=>{const view=e.target.closest("[data-lightbox]"),link=e.target.closest("a,button,input,select,textarea,label");cur.classList.toggle("label",!!view);lab.textContent=view?"View":"";cur.classList.toggle("link",!!link&&!view)});
}

/* inside a preview frame Google Maps is blocked: show the residence photo instead of a blank box */
if(window.top!==window.self){const m=$(".lp-map");if(m){m.classList.add("map-preview");m.style.setProperty("--ph",`url("${$(".lp-intro-img img")?.src||""}")`);m.dataset.addr=$(".lp-address")?.textContent||""}}

/* ambient video, Pakistan-map fallback, nav ink */
(()=>{const io=new IntersectionObserver(es=>es.forEach(e=>{const v=e.target;if(e.isIntersecting){if(!v.src&&v.dataset.src){v.src=v.dataset.src;v.load()}if(!reduceMotion){const p=v.play();p&&p.catch(()=>{})}}else v.pause()}),{rootMargin:"200px 0px"});$$("video.amb").forEach(v=>{v.muted=true;io.observe(v)})})();
(()=>{const n=$(".site-nav");if(!n||matchMedia("(max-width:820px)").matches)return;const ink=document.createElement("span");ink.className="nav-ink";n.append(ink);
  $$(".site-nav>.nav-link,.site-nav>.nav-drop>.nav-link").forEach((l,i)=>{l.style.setProperty("--n",i);l.addEventListener("mouseenter",()=>{const r=l.getBoundingClientRect(),p=n.getBoundingClientRect();ink.style.width=r.width-40+"px";ink.style.transform=`translateX(${r.left-p.left+20}px)`;ink.classList.add("on")})});
  n.addEventListener("mouseleave",()=>ink.classList.remove("on"));document.body.classList.add("ready")})();
(()=>{const t=$(".menu-toggle"),n=$(".site-nav");if(!t)return;new MutationObserver(()=>{const o=n.classList.contains("open");document.body.classList.toggle("menu-open",o);window.lenis&&(o?lenis.stop():lenis.start())}).observe(n,{attributes:true,attributeFilter:["class"]})})();

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

/* amenities: staggered reveal, line-draw icons, cursor spotlight, scroll-active on touch */
(()=>{const cards=[...document.querySelectorAll(".am-card")];if(!cards.length)return;
  const show=c=>{c.classList.add("in");setTimeout(()=>c.classList.add("done"),1300+(parseFloat(c.style.getPropertyValue("--d"))||0)*90)};
  if(!("IntersectionObserver" in window)){cards.forEach(show);return}
  const io=new IntersectionObserver(es=>es.forEach(en=>{if(en.isIntersecting){show(en.target);io.unobserve(en.target)}}),{threshold:.15,rootMargin:"0px 0px -6% 0px"});
  cards.forEach(c=>io.observe(c));
  if(matchMedia("(hover:hover) and (pointer:fine)").matches){
    cards.forEach(c=>c.addEventListener("pointermove",e=>{const r=c.getBoundingClientRect();c.style.setProperty("--mx",(e.clientX-r.left)+"px");c.style.setProperty("--my",(e.clientY-r.top)+"px")}));
  }
  /* touch: tapping a card turns it blue (tap again, or tap another card, to switch) */
  let cur=null;
  cards.forEach(c=>c.addEventListener("click",e=>{
    if(matchMedia("(hover:hover) and (pointer:fine)").matches)return;
    const r=c.getBoundingClientRect();c.style.setProperty("--mx",(e.clientX-r.left)+"px");c.style.setProperty("--my",(e.clientY-r.top)+"px");
    if(cur===c){c.classList.remove("is-on");cur=null;return}
    cur&&cur.classList.remove("is-on");c.classList.add("is-on");cur=c;
  }));
})();

/* nearby experience cards: cinematic reveal as each card scrolls in */
(()=>{const cards=[...document.querySelectorAll(".nx-card")];if(!cards.length)return;
  if(!("IntersectionObserver" in window)){cards.forEach(c=>c.classList.add("in"));return}
  const io=new IntersectionObserver(es=>es.forEach(en=>{if(en.isIntersecting){en.target.classList.add("in");io.unobserve(en.target)}}),{threshold:.2,rootMargin:"0px 0px -8% 0px"});
  cards.forEach(c=>io.observe(c));
})();

/* booking pop-up: every "Book now" on a residence page opens it */
(()=>{const dlg=document.getElementById("book-modal");if(!dlg)return;const f=document.getElementById("bk-form");
  const roomsMap=JSON.parse(f.dataset.rooms||"{}");
  const today=new Date(Date.now()-new Date().getTimezoneOffset()*60000).toISOString().slice(0,10);
  f.in.min=today;f.out.min=today;
  f.in.addEventListener("change",()=>{if(!f.in.value)return;const n=new Date(f.in.value+"T12:00:00");n.setDate(n.getDate()+1);f.out.min=n.toISOString().slice(0,10);if(f.out.value&&f.out.value<=f.in.value)f.out.value="";f.out.setCustomValidity("")});
  f.out.addEventListener("change",()=>f.out.setCustomValidity(""));
  f.stay.addEventListener("change",()=>{const list=roomsMap[f.stay.value]||[];f.room.innerHTML='<option>Any room</option>'+list.map(r=>`<option>${r}</option>`).join("")});
  let lastFocus=null;
  const open=room=>{lastFocus=document.activeElement;if(room){const o=[...f.room.options].find(o=>o.text===room);if(o)f.room.value=o.text}
    if(typeof dlg.showModal==="function"){if(!dlg.open)dlg.showModal()}else dlg.setAttribute("open","");
    document.documentElement.classList.add("bk-lock");lenis&&lenis.stop();requestAnimationFrame(()=>dlg.classList.add("show"));setTimeout(()=>{try{f.in.focus({preventScroll:true})}catch(e){}},420)};
  const close=()=>{dlg.classList.remove("show");setTimeout(()=>{if(dlg.open)dlg.close();document.documentElement.classList.remove("bk-lock");lenis&&lenis.start();lastFocus&&lastFocus.focus&&lastFocus.focus({preventScroll:true})},320)};
  document.addEventListener("click",e=>{
    const a=e.target.closest('a[href="#reserve"]');if(a){e.preventDefault();e.stopImmediatePropagation();if(nav&&nav.classList.contains("open")){menu&&menu.click()}open();return}
    const b=e.target.closest(".room-enquire");if(b){e.preventDefault();e.stopImmediatePropagation();open(b.dataset.room)}
  },true);
  dlg.querySelector(".bk-close").addEventListener("click",close);
  dlg.addEventListener("click",e=>{if(e.target===dlg)close()});
  dlg.addEventListener("cancel",e=>{e.preventDefault();close()});
  f.addEventListener("submit",e=>{e.preventDefault();
    if(f.out.value<=f.in.value){f.out.setCustomValidity("Check out must be after check in");f.out.reportValidity();return}
    const msg=`Hello Paramount Hospitality, I would like to book ${f.stay.value}.\nCheck in: ${f.in.value}\nCheck out: ${f.out.value}\nRooms and guests: ${f.guests.value}\nRoom type: ${f.room.value}\nName: ${f.name.value}\nPhone: ${f.phone.value}`;
    window.open(`https://wa.me/${WA}?text=${encodeURIComponent(msg)}`,"_blank","noopener");close()});
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

/* contact page film: play muted, pause off-screen */
(()=>{const v=document.querySelector(".ct-video");if(!v)return;v.muted=true;const play=()=>{if(reduceMotion)return;const p=v.play();p&&p.catch(()=>{})};play();
  addEventListener("touchstart",play,{once:true,passive:true});
  new IntersectionObserver(es=>es.forEach(e=>e.isIntersecting?play():v.pause())).observe(v)})();

/* stay categories: reveal on scroll, active tab, "view all photos" */
(()=>{const blocks=[...document.querySelectorAll(".st-block")];if(!blocks.length)return;
  const tabs=[...document.querySelectorAll(".st-tab")];
  const io=new IntersectionObserver(es=>es.forEach(en=>{if(en.isIntersecting){en.target.classList.add("in")}}),{threshold:.18});
  blocks.forEach(b=>io.observe(b));
  const act=new IntersectionObserver(es=>es.forEach(en=>{if(en.isIntersecting){const i=blocks.indexOf(en.target);tabs.forEach((t,k)=>t.classList.toggle("on",k===i))}}),{rootMargin:"-45% 0px -45% 0px"});
  blocks.forEach(b=>act.observe(b));
  document.querySelectorAll(".st-gal").forEach(b=>b.addEventListener("click",()=>{const first=document.querySelector(`[data-lightbox="${b.dataset.open}"]`);first&&first.click()}));
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
/* About stats: reveal + count up */
(()=>{const band=document.querySelector(".ab-stats-band");if(!band)return;
  const run=()=>{band.classList.add("in");band.querySelectorAll("[data-count]").forEach((b,k)=>{const to=+b.dataset.count,suf=b.dataset.suffix||"";if(reduceMotion){b.textContent=to+suf;return}
    const t0=performance.now()+300+k*120,D=1400;const step=now=>{const p=Math.min(1,Math.max(0,(now-t0)/D)),e=1-Math.pow(1-p,3);b.textContent=Math.round(to*e)+suf;if(p<1)requestAnimationFrame(step)};b.textContent="0"+suf;requestAnimationFrame(step)})};
  new IntersectionObserver((es,o)=>{if(es.some(e=>e.isIntersecting)){o.disconnect();run()}},{threshold:.35}).observe(band);
})();

/* stays: gentle scroll parallax (numbers + hero photo) */
(()=>{const blocks=[...document.querySelectorAll(".st-block")];if(!blocks.length||reduceMotion)return;let raf=0;
  const upd=()=>{raf=0;const h=innerHeight;blocks.forEach(b=>{const r=b.getBoundingClientRect();if(r.bottom<0||r.top>h)return;const p=((r.top+r.height/2)-h/2)/h;b.style.setProperty("--p",Math.max(-1,Math.min(1,p)).toFixed(3))})};
  addEventListener("scroll",()=>{if(!raf)raf=requestAnimationFrame(upd)},{passive:true});addEventListener("resize",upd);upd();
})();

/* About gallery: reveal, arrows, drag to scroll, progress bar */
(()=>{const t=document.getElementById("pg-track");if(!t)return;const bar=document.querySelector(".pg-bar span");
  new IntersectionObserver((es,o)=>{if(es.some(e=>e.isIntersecting)){t.classList.add("in");o.disconnect()}},{threshold:.15}).observe(t);
  const step=()=>(t.querySelector(".pg-card")?.getBoundingClientRect().width||360)+22;
  document.querySelector(".pg-btn.prev")?.addEventListener("click",()=>t.scrollBy({left:-step(),behavior:"smooth"}));
  document.querySelector(".pg-btn.next")?.addEventListener("click",()=>t.scrollBy({left:step(),behavior:"smooth"}));
  const upd=()=>{const max=t.scrollWidth-t.clientWidth;const vis=t.clientWidth/t.scrollWidth;bar.style.width=(vis*100)+"%";bar.style.transform=`translateX(${max>0?(t.scrollLeft/max)*(1/vis-1)*100:0}%)`};
  t.addEventListener("scroll",upd,{passive:true});addEventListener("resize",upd);upd();
  if(matchMedia("(hover:hover) and (pointer:fine)").matches){let down=false,x0=0,s0=0,moved=false;
    t.addEventListener("pointerdown",e=>{down=true;moved=false;x0=e.clientX;s0=t.scrollLeft;t.classList.add("drag")});
    addEventListener("pointermove",e=>{if(!down)return;const dx=e.clientX-x0;if(Math.abs(dx)>4)moved=true;t.scrollLeft=s0-dx});
    addEventListener("pointerup",()=>{if(!down)return;down=false;t.classList.remove("drag")});
    t.addEventListener("click",e=>{if(moved){e.preventDefault();e.stopImmediatePropagation();moved=false}},true);}
})();
