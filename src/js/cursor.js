export function initCursor(){
  const dot=document.getElementById('cur-dot'),ring=document.getElementById('cur-ring');
  let mx=0,my=0,rx=0,ry=0;
  document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;dot.style.cssText=`left:${mx}px;top:${my}px;`;});
  (function raf(){rx+=(mx-rx)*.12;ry+=(my-ry)*.12;ring.style.left=rx+'px';ring.style.top=ry+'px';requestAnimationFrame(raf);})();
  const inters=['a','button','.svc-item','.why-card','.tcard','.wcard','.ind-item','.astat','.cdetail','.pstep'];
  document.querySelectorAll(inters.join(',')).forEach(el=>{
    el.addEventListener('mouseenter',()=>document.body.classList.add('hovering'));
    el.addEventListener('mouseleave',()=>document.body.classList.remove('hovering'));
  });
}
