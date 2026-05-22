export function initReveal(){
  const obs=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)e.target.classList.add('on');}),{threshold:0.08});
  document.querySelectorAll('.rv').forEach(el=>obs.observe(el));
}
