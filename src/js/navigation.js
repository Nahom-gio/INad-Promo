export function initNavigation(){
  const nav=document.getElementById('nav');
  window.addEventListener('scroll',()=>nav.classList.toggle('scrolled',scrollY>60),{passive:true});
}
