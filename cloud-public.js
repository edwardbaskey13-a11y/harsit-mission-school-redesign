(async function(){
  const url=window.HMS_SUPABASE_URL,key=window.HMS_SUPABASE_ANON_KEY;
  if(!url||!key||!window.supabase) return;
  try{
    const client=window.supabase.createClient(url,key);
    const {data,rowError}=await client.from('school_state').select('data').eq('id','00000000-0000-0000-0000-000000000001').eq('published',true).maybeSingle();
    if(rowError||!data?.data) return;
    const d=data.data;
    // Core school/contact content
    const s=d.school||{}, w=d.website||{};
    document.querySelectorAll('a[href^="mailto:"]').forEach(a=>{if(s.email){a.href='mailto:'+s.email;a.textContent=s.email;}});
    document.querySelectorAll('a[href^="tel:"]').forEach(a=>{if(s.phone)a.href='tel:+91'+String(s.phone).replace(/\D/g,'');});
    const ticker=document.getElementById('tickerText'); if(ticker&&d.notices?.length){const n=d.notices.filter(x=>x.published!==false).sort((a,b)=>String(b.date).localeCompare(String(a.date)))[0]; if(n)ticker.textContent=n.title+(n.text?' — '+n.text:'');}
    // Managed notices
    const noticeGrid=document.querySelector('#notices .notice-grid');
    if(noticeGrid && Array.isArray(d.notices) && d.notices.length){
      const ns=d.notices.filter(x=>x.published!==false).sort((a,b)=>String(b.date).localeCompare(String(a.date))).slice(0,12);
      noticeGrid.innerHTML=ns.map((n,i)=>`<article class="notice-card ${i===0?'highlight':''}"><span class="notice-tag">${esc(n.category||'NOTICE')}</span><time>${esc(n.date||'')}</time><h3>${esc(n.title||'Notice')}</h3><p>${esc(n.text||'')}</p></article>`).join('');
    }
    // Managed events
    const eventGrid=document.querySelector('.events-grid');
    if(eventGrid && Array.isArray(d.events) && d.events.length){
      const es=d.events.filter(x=>x.published!==false).sort((a,b)=>String(a.date).localeCompare(String(b.date))).slice(0,8);
      eventGrid.innerHTML=es.map(e=>`<article class="event-card"><div class="event-body"><span class="pill">${esc(e.date||'')}</span><h3>${esc(e.title||'Event')}</h3><p>${esc(e.description||'')}</p>${e.link?`<a class="text-link" href="${esc(e.link)}" target="_blank" rel="noopener">Open event link ↗</a>`:''}</div></article>`).join('');
    }
    // Managed gallery: cloud media is available to every visitor.
    const mg=document.getElementById('managed-gallery');
    if(mg && Array.isArray(d.gallery) && d.gallery.length){
      const gs=d.gallery.filter(x=>x.image||x.video).sort((a,b)=>(Number(a.sort)||0)-(Number(b.sort)||0));
      mg.innerHTML=gs.map(g=>{const video=g.mediaType==='video';const src=video?(g.video||g.image):(g.image||g.video);return `<button class="gallery-item ${g.cover?'large':''}" data-full="${esc(src)}">${video?`<video src="${esc(src)}" muted playsinline preload="metadata"></video>`:`<img src="${esc(src)}" alt="${esc(g.alt||g.title||'School gallery')}" loading="lazy">`}<span>${esc(g.title||g.event||'School Gallery')}${g.date?' · '+esc(g.date):''}${g.highlight?' ★':''}</span></button>`}).join('');
      mg.querySelectorAll('[data-full]').forEach(b=>b.addEventListener('click',()=>{const lb=document.querySelector('.lightbox');if(lb){const img=lb.querySelector('img');if(img){img.src=b.dataset.full;img.alt=b.innerText;lb.setAttribute('aria-hidden','false');lb.classList.add('open');}}}));
    }
    if(w.heroTitle){const h=document.querySelector('.hero h1');if(h)h.textContent=w.heroTitle;}
    if(w.heroText){const p=document.querySelector('.hero .hero-content p');if(p)p.textContent=w.heroText;}
    if(w.aboutText){const p=document.querySelector('#about .lead');if(p)p.textContent=w.aboutText;}
  }catch(e){console.warn('Cloud public sync unavailable',e)}
  function esc(s=''){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
})();
