function toggleMob(){
  const mm=document.getElementById('mob-menu'),hb=document.getElementById('hbg');
  const open=mm.classList.toggle('open');
  hb.classList.toggle('open',open);
  document.body.style.overflow=open?'hidden':'';
}

function closeMob(){
  document.getElementById('mob-menu').classList.remove('open');
  document.getElementById('hbg').classList.remove('open');
  document.body.style.overflow='';
}

export function initMobileMenu(){
  document.querySelector('[data-toggle-mobile-menu]')?.addEventListener('click',toggleMob);
  document.querySelectorAll('[data-close-mobile-menu]').forEach(link=>{
    link.addEventListener('click',closeMob);
  });

  window.toggleMob=toggleMob;
  window.closeMob=closeMob;
}
