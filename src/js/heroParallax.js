export function initHeroParallax(){
  document.addEventListener('mousemove',e=>{
    const glow=document.querySelector('.hero-glow');
    if(!glow)return;
    const x=(e.clientX/innerWidth-.5)*30,y=(e.clientY/innerHeight-.5)*30;
    glow.style.transform=`translate(calc(-50% + ${x}px),calc(-50% + ${y}px))`;
  });
}
