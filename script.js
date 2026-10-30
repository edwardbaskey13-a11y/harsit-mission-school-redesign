const menu=document.querySelector(".menu-toggle"), nav=document.querySelector(".nav");
menu?.addEventListener("click",()=>{const open=nav.classList.toggle("open");menu.setAttribute("aria-expanded",open)});
document.querySelectorAll(".nav a").forEach(a=>a.addEventListener("click",()=>nav.classList.remove("open")));

const lightbox=document.querySelector(".lightbox"), lightImg=lightbox.querySelector("img");
document.querySelectorAll(".gallery-item").forEach(btn=>{
  btn.addEventListener("click",()=>{
    lightImg.src=btn.dataset.full;
    lightImg.alt=btn.querySelector("img")?.alt || "";
    lightbox.classList.add("open"); lightbox.setAttribute("aria-hidden","false");
  });
});
function closeLightbox(){lightbox.classList.remove("open");lightbox.setAttribute("aria-hidden","true");lightImg.src=""}
document.querySelector(".lightbox-close").addEventListener("click",closeLightbox);
lightbox.addEventListener("click",e=>{if(e.target===lightbox)closeLightbox()});
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeLightbox()});
document.getElementById("year").textContent=new Date().getFullYear();

// Enhanced school portal interactions
(function(){
  const forms = document.querySelectorAll('form[data-netlify="true"]');
  forms.forEach(form => {
    form.addEventListener('submit', function(){
      const btn=form.querySelector('button[type="submit"]');
      if(btn){ btn.dataset.original=btn.textContent; btn.textContent='Submitting…'; btn.disabled=true; }
    });
  });
})();

// Render locally managed gallery media created from the Admin Gallery Manager.
(function(){
  const host=document.getElementById('managed-gallery');
  if(!host) return;
  const KEY='hms_admin_v5', MEDIA_DB='hms_gallery_media_v1';
  let data={}; try{data=JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){}
  const items=(data.gallery||[]).filter(x=>x.highlight||x.cover).sort((a,b)=>Number(a.sort||0)-Number(b.sort||0));
  if(!items.length) return;
  const openDB=()=>new Promise((resolve,reject)=>{const r=indexedDB.open(MEDIA_DB,1);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});
  const getFile=async id=>{if(!id)return null;const db=await openDB();return new Promise((resolve,reject)=>{const r=db.transaction('files','readonly').objectStore('files').get(id);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})};
  (async()=>{for(const x of items){try{let src=x.image||x.video||'';let type=x.mediaType==='video'?'video':'photo';if(x.mediaId){const f=await getFile(x.mediaId);if(f){src=URL.createObjectURL(f.blob);type=f.type.startsWith('video/')?'video':'photo'}}if(!src)continue;const b=document.createElement('button');b.className='managed-media';b.type='button';b.setAttribute('aria-label',x.title||'Gallery media');b.innerHTML=(x.cover?'<span class="managed-tag">Front Cover</span>':'')+(type==='video'?`<video src="${src}" muted playsinline preload="metadata"></video>`:`<img src="${src}" alt="${(x.alt||x.title||'School gallery').replace(/"/g,'&quot;')}">`)+`<span>${x.title||''}${x.event?' • '+x.event:''}${x.date?' • '+x.date:''}</span>`;b.addEventListener('click',()=>{const lb=document.querySelector('.lightbox');if(!lb)return;const img=lb.querySelector('img');if(type==='video'){img.style.display='none';let v=lb.querySelector('video.managed-light-video');if(!v){v=document.createElement('video');v.className='managed-light-video';v.controls=true;v.autoplay=true;v.style.maxWidth='92vw';v.style.maxHeight='82vh';lb.prepend(v)}v.style.display='block';v.src=src}else{const v=lb.querySelector('video.managed-light-video');if(v){v.pause();v.style.display='none'}img.style.display='block';img.src=src;img.alt=x.alt||x.title||''}lb.classList.add('open');lb.setAttribute('aria-hidden','false')});host.appendChild(b)}catch(e){console.warn('Managed gallery media unavailable',e)}}})();
})();


// Three-step admission enquiry. Confirmation is shown only after Netlify accepts the POST.
(function(){
  const form=document.getElementById('admission-form');
  if(!form) return;
  const panels=[...form.querySelectorAll('.wizard-panel')];
  const labels=[...document.querySelectorAll('.wizard-step')];
  const progress=document.getElementById('admissionProgress');
  const success=document.getElementById('admissionSuccess');
  const error=document.getElementById('admissionError');
  const refInput=document.getElementById('admissionReference');
  const submit=document.getElementById('admissionSubmit');
  const visit=document.getElementById('campusVisit');
  const visitDate=document.getElementById('visitDate');
  let current=1;
  const panelFields=n=>panels[n-1].querySelectorAll('input,select,textarea');
  function showStep(n){
    current=n;
    panels.forEach((p,i)=>{const active=i===n-1;p.hidden=!active;p.classList.toggle('active',active)});
    labels.forEach((l,i)=>{l.classList.toggle('active',i===n-1);l.classList.toggle('done',i<n-1)});
    progress.style.width=((n-1)/2*100)+'%';
    error.hidden=true;
  }
  function validateStep(n){
    for(const field of panelFields(n)){
      if(field.disabled) continue;
      if(!field.checkValidity()){field.reportValidity();field.focus();return false;}
    }
    return true;
  }
  form.querySelectorAll('.wizard-next').forEach(b=>b.addEventListener('click',()=>{if(validateStep(current))showStep(Math.min(3,current+1))}));
  form.querySelectorAll('.wizard-back').forEach(b=>b.addEventListener('click',()=>showStep(Math.max(1,current-1))));
  visit?.addEventListener('change',()=>{const enabled=visit.value.startsWith('Yes');visitDate.disabled=!enabled;if(!enabled)visitDate.value=''});
  if(visitDate){const today=new Date();visitDate.min=new Date(today.getTime()-today.getTimezoneOffset()*60000).toISOString().slice(0,10)}
  form.addEventListener('submit',async e=>{
    e.preventDefault();
    if(!validateStep(3)) return;
    error.hidden=true;
    const ref='HMS-'+new Date().getFullYear()+'-'+Math.random().toString(36).slice(2,8).toUpperCase();
    refInput.value=ref;
    const btnText=submit.innerHTML;submit.disabled=true;submit.textContent='Submitting enquiry…';
    try{
      const body=new URLSearchParams(new FormData(form)).toString();
      const response=await fetch('/',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body});
      if(!response.ok) throw new Error('Submission failed');
      form.hidden=true;
      document.getElementById('successReference').textContent=ref;
      success.hidden=false;
      success.scrollIntoView({behavior:'smooth',block:'center'});
    }catch(err){
      error.hidden=false;error.scrollIntoView({behavior:'smooth',block:'center'});
    }finally{submit.disabled=false;submit.innerHTML=btnText;}
  });
  document.getElementById('newEnquiry')?.addEventListener('click',()=>{form.reset();form.hidden=false;success.hidden=true;error.hidden=true;visitDate.disabled=false;showStep(1);form.scrollIntoView({behavior:'smooth',block:'center'})});
  showStep(1);
})();
