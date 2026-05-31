function loadVideo(videoEl,sourceEl){
  const nextSrc=sourceEl.dataset.src||videoEl.dataset.fallbackSrc||'';
  if(!nextSrc||sourceEl.getAttribute('src')===nextSrc) return;

  sourceEl.setAttribute('src',nextSrc);
  videoEl.dataset.loaded='true';
  videoEl.load();
  void videoEl.play().catch(()=>{});
}

function loadAboutBackground(aboutEl){
  aboutEl.classList.add('has-background');
}

export function initAboutMedia(){
  const aboutEl=document.getElementById('about');
  const videoEl=document.querySelector('.about-logo-frame video');
  const sourceEl=videoEl?.querySelector('source');
  if(!aboutEl||!videoEl||!sourceEl) return;

  const fallbackSrc=videoEl.dataset.fallbackSrc||sourceEl.dataset.src||'';

  videoEl.addEventListener('error',()=>{
    const currentSrc=sourceEl.getAttribute('src')||'';
    if(!fallbackSrc||currentSrc===fallbackSrc) return;

    sourceEl.dataset.src=fallbackSrc;
    loadVideo(videoEl,sourceEl);
  });

  if(!('IntersectionObserver' in window)){
    loadAboutBackground(aboutEl);
    loadVideo(videoEl,sourceEl);
    return;
  }

  const observer=new IntersectionObserver(entries=>{
    const visible=entries.some(entry=>entry.isIntersecting);
    if(!visible) return;

    loadAboutBackground(aboutEl);
    loadVideo(videoEl,sourceEl);
    observer.disconnect();
  },{
    rootMargin:'240px 0px',
    threshold:0.15,
  });

  observer.observe(aboutEl);
}
