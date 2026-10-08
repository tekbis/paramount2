/* Paramount booking pop-up for pages without one built in (home, about, contact). Opens from any "Book Now". */
(()=>{if(document.getElementById("book-modal"))return;   // residence pages already have theirs
  const LOCS=[{"v": "Hillside Residence, Islamabad", "t": "Islamabad · Hillside Residence", "rooms": ["Family Room", "Twin Room", "King Room", "Suite Room"]}, {"v": "Central Residence, Karachi", "t": "Karachi · Central Residence", "rooms": ["King Room", "Family Room", "Queen Room", "Twin Room"]}, {"v": "The Residence, Lahore", "t": "Lahore · The Residence", "rooms": ["King Room", "Twin Room", "Family Room", "Suite Room"]}, {"v": "Mountain Terrace Collection, Khaira Gali", "t": "Khaira Gali · Mountain Terrace Collection", "rooms": ["Mountain Terrace Villa", "The Cottage"]}],WA="923331226656";
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const d=document.createElement("dialog");d.className="bk-modal";d.id="book-modal";d.setAttribute("aria-labelledby","bk-title");d.setAttribute("data-lenis-prevent","");
  d.innerHTML=`<form class="bk-card" id="bk-form"><button type="button" class="bk-close" aria-label="Close booking form">×</button>
    <div class="bk-head"><p class="eyebrow">Reservations</p><h2 id="bk-title">Book your stay</h2><p class="bk-note">Choose your dates and our team will confirm availability on WhatsApp.</p></div>
    <div class="bk-grid">
      <label class="bb-field bk-wide"><span>Location</span><select name="stay" required>${LOCS.map(l=>`<option value="${esc(l.v)}">${esc(l.t)}</option>`).join("")}</select></label>
      <label class="bb-field"><span>Check in</span><input name="in" type="date" required></label>
      <label class="bb-field"><span>Check out</span><input name="out" type="date" required></label>
      <label class="bb-field"><span>Rooms and guests</span><select name="guests"><option>1 room, 1 Adult</option><option selected>1 room, 2 Adults</option><option>1 room, 3 Adults</option><option>2 rooms, 4 Adults</option><option>Group (5+)</option></select></label>
      <label class="bb-field"><span>Room type</span><select name="room"></select></label>
      <label class="bb-field"><span>Full name</span><input name="name" required autocomplete="name"></label>
      <label class="bb-field"><span>Phone</span><input name="phone" type="tel" required autocomplete="tel"></label>
    </div><button class="bb-submit bk-submit" type="submit">Book now</button></form>`;
  document.body.append(d);
  const f=d.querySelector("form"),nav=document.querySelector(".site-nav"),menu=document.querySelector(".menu-toggle");
  const fillRooms=()=>{const l=LOCS.find(x=>x.v===f.stay.value)||LOCS[0];f.room.innerHTML="<option>Any room</option>"+l.rooms.map(r=>`<option>${esc(r)}</option>`).join("")};fillRooms();
  f.stay.addEventListener("change",fillRooms);
  const today=new Date(Date.now()-new Date().getTimezoneOffset()*60000).toISOString().slice(0,10);f.in.min=today;f.out.min=today;
  f.in.addEventListener("change",()=>{if(!f.in.value)return;const n=new Date(f.in.value+"T12:00:00");n.setDate(n.getDate()+1);f.out.min=n.toISOString().slice(0,10);if(f.out.value&&f.out.value<=f.in.value)f.out.value="";f.out.setCustomValidity("")});
  f.out.addEventListener("change",()=>f.out.setCustomValidity(""));
  const L=()=>window.lenis||null;
  const open=()=>{if(typeof d.showModal==="function"){if(!d.open)d.showModal()}else d.setAttribute("open","");document.documentElement.classList.add("bk-lock");L()&&L().stop();requestAnimationFrame(()=>d.classList.add("show"))};
  const close=()=>{d.classList.remove("show");setTimeout(()=>{if(d.open)d.close();document.documentElement.classList.remove("bk-lock");L()&&L().start()},320)};
  document.addEventListener("click",e=>{const a=e.target.closest('a[href="#reserve"],[data-book]');if(!a)return;e.preventDefault();e.stopImmediatePropagation();
    if(nav&&nav.classList.contains("open")&&menu)menu.click();setTimeout(open,nav&&nav.classList.contains("open")?380:0)},true);
  d.querySelector(".bk-close").addEventListener("click",close);d.addEventListener("click",e=>{if(e.target===d)close()});d.addEventListener("cancel",e=>{e.preventDefault();close()});
  f.addEventListener("submit",e=>{e.preventDefault();if(f.out.value<=f.in.value){f.out.setCustomValidity("Check out must be after check in");f.out.reportValidity();return}
    const msg=`Hello Paramount Hospitality, I would like to book ${f.stay.value}.\nCheck in: ${f.in.value}\nCheck out: ${f.out.value}\nRooms and guests: ${f.guests.value}\nRoom type: ${f.room.value}\nName: ${f.name.value}\nPhone: ${f.phone.value}`;
    window.open(`https://wa.me/${WA}?text=${encodeURIComponent(msg)}`,"_blank","noopener");close()});
})();
