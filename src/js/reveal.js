let observer=null;

export function observeRevealElements(root=document){
  if(!observer) return;
  root.querySelectorAll('.rv:not([data-reveal-observed])').forEach(el=>{
    el.dataset.revealObserved='true';
    observer.observe(el);
  });
}

export function initReveal(){
  observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(!entry.isIntersecting) return;
    entry.target.classList.add('on');
    observer.unobserve(entry.target);
  }),{threshold:0.08});
  observeRevealElements();
}
