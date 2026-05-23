let sliderTimer;

function updateSlider(slider,index){
  const slides=[...slider.querySelectorAll('.project-slide')];
  const current=slider.querySelector('[data-slider-current]');
  slides.forEach(slide=>slide.classList.remove('is-active'));
  slides[index].classList.add('is-active');
  slider.dataset.activeIndex=String(index);
  if(current)current.textContent=String(index+1).padStart(2,'0');
}

function advanceSlider(slider,step=1){
  const slides=[...slider.querySelectorAll('.project-slide')];
  const active=Number(slider.dataset.activeIndex || 0);
  updateSlider(slider,(active+step+slides.length)%slides.length);
}

function startSlider(slider){
  stopSlider();
  sliderTimer=setInterval(()=>advanceSlider(slider,1),4200);
}

function stopSlider(){
  if(sliderTimer)clearInterval(sliderTimer);
}

function showSlider(cat){
  const sliders=document.querySelectorAll('[data-project-slider]');
  let activeSlider=null;

  sliders.forEach(slider=>{
    const active=slider.dataset.projectSlider===cat;
    slider.hidden=!active;
    if(active)activeSlider=slider;
  });

  if(activeSlider){
    updateSlider(activeSlider,Number(activeSlider.dataset.activeIndex || 0));
    startSlider(activeSlider);
  }else{
    stopSlider();
  }
}

function fwork(btn,cat){
  document.querySelectorAll('.wf').forEach(b=>b.classList.remove('on'));
  btn.classList.add('on');

  const grid=document.getElementById('wGrid');
  if(cat==='events'){
    grid.hidden=true;
    showSlider(cat);
    return;
  }

  showSlider(null);
  grid.hidden=false;
  document.querySelectorAll('.wcard').forEach(c=>{
    c.style.display=cat==='all'||c.dataset.cat===cat?'':'none';
  });
}

export function initWorkFilter(){
  document.querySelectorAll('[data-work-filter]').forEach(btn=>{
    btn.addEventListener('click',()=>fwork(btn,btn.dataset.workFilter));
  });

  document.querySelectorAll('[data-project-slider]').forEach(slider=>{
    const total=slider.querySelector('[data-slider-total]');
    const slides=slider.querySelectorAll('.project-slide');
    if(total)total.textContent=String(slides.length).padStart(2,'0');

    slider.querySelector('[data-slider-prev]')?.addEventListener('click',()=>{
      advanceSlider(slider,-1);
      startSlider(slider);
    });
    slider.querySelector('[data-slider-next]')?.addEventListener('click',()=>{
      advanceSlider(slider,1);
      startSlider(slider);
    });
    slider.addEventListener('mouseenter',stopSlider);
    slider.addEventListener('mouseleave',()=>startSlider(slider));
  });

  window.fwork=fwork;
}
