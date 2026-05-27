function loadVideo(videoEl,sourceEl){
  const nextSrc=sourceEl.dataset.src||videoEl.dataset.fallbackSrc||'';
  if(!nextSrc||sourceEl.getAttribute('src')===nextSrc) return;

  sourceEl.setAttribute('src',nextSrc);
  videoEl.dataset.loaded='true';
  videoEl.load();
  void videoEl.play().catch(()=>{});
}

export function initAboutMedia(){
  const videoEl=document.querySelector('.about-logo-frame video');
  const sourceEl=videoEl?.querySelector('source');
  if(!videoEl||!sourceEl) return;

  const fallbackSrc=videoEl.dataset.fallbackSrc||sourceEl.dataset.src||'';

  videoEl.addEventListener('error',()=>{
    const currentSrc=sourceEl.getAttribute('src')||'';
    if(!fallbackSrc||currentSrc===fallbackSrc) return;

    sourceEl.dataset.src=fallbackSrc;
    loadVideo(videoEl,sourceEl);
  });

  if(!('IntersectionObserver' in window)){
    loadVideo(videoEl,sourceEl);
    return;
  }

  const observer=new IntersectionObserver(entries=>{
    const visible=entries.some(entry=>entry.isIntersecting);
    if(!visible) return;

    loadVideo(videoEl,sourceEl);
    observer.disconnect();
  },{
    rootMargin:'240px 0px',
    threshold:0.15,
  });

  observer.observe(videoEl);
}
