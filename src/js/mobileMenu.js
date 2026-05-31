function toggleMob(){
  const mm=document.getElementById('mob-menu'),hb=document.getElementById('hbg');
  if(!mm || !hb)return;
  const open=mm.classList.toggle('open');
  hb.classList.toggle('open',open);
  hb.setAttribute('aria-expanded',String(open));
  hb.setAttribute('aria-label',open?'Close navigation menu':'Open navigation menu');
  mm.setAttribute('aria-hidden',String(!open));
  document.body.style.overflow=open?'hidden':'';
}

function closeMob(){
  const mm=document.getElementById('mob-menu');
  const hb=document.getElementById('hbg');
  if(!mm || !hb)return;
  mm.classList.remove('open');
  hb.classList.remove('open');
  hb.setAttribute('aria-expanded','false');
  hb.setAttribute('aria-label','Open navigation menu');
  mm.setAttribute('aria-hidden','true');
  document.body.style.overflow='';
}

export function initMobileMenu(){
  document.querySelector('[data-toggle-mobile-menu]')?.addEventListener('click',toggleMob);
  document.querySelectorAll('[data-close-mobile-menu]').forEach(link=>{
    link.addEventListener('click',closeMob);
  });
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape')closeMob();
  });
}
