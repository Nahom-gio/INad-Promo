function fwork(btn,cat){
  document.querySelectorAll('.wf').forEach(b=>b.classList.remove('on'));
  btn.classList.add('on');
  document.querySelectorAll('.wcard').forEach(c=>{
    c.style.display=cat==='all'||c.dataset.cat===cat?'':'none';
  });
}

export function initWorkFilter(){
  document.querySelectorAll('[data-work-filter]').forEach(btn=>{
    btn.addEventListener('click',()=>fwork(btn,btn.dataset.workFilter));
  });

  window.fwork=fwork;
}
