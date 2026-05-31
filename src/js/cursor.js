export function initCursor(){
  const dot=document.getElementById('cur-dot'),ring=document.getElementById('cur-ring');
  const prefersReducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasFinePointer=window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if(!dot || !ring || prefersReducedMotion || !hasFinePointer)return;

  document.body.classList.add('has-custom-cursor');
  let mx=0,my=0,rx=0,ry=0;
  document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;dot.style.cssText=`left:${mx}px;top:${my}px;`;});
  (function raf(){rx+=(mx-rx)*.12;ry+=(my-ry)*.12;ring.style.left=rx+'px';ring.style.top=ry+'px';requestAnimationFrame(raf);})();
  const interactiveSelector='a,button,.svc-item,.why-card,.tcard,.wcard,.ind-item,.astat,.cdetail,.pstep';
  document.addEventListener('mouseover',event=>{
    if(event.target.closest(interactiveSelector)) document.body.classList.add('hovering');
  });
  document.addEventListener('mouseout',event=>{
    const fromInteractive=event.target.closest(interactiveSelector);
    const toInteractive=event.relatedTarget?.closest?.(interactiveSelector);
    if(fromInteractive&&!toInteractive) document.body.classList.remove('hovering');
  });
}
