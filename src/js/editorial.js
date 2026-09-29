const printMethods=[
  ['Large format','Billboards, banners and event backdrops, printed at scale.','#3fb9e3','solid'],
  ['UV printing','Direct print on rigid boards, glass and acrylic.','#3fb9e3','dots'],
  ['DTF printing','Full-colour transfers for apparel and team kits.','#2e347d','solid'],
  ['Screen printing','Bold, durable runs on fabric and more.','#2e347d','dots'],
  ['Digital printing','Short runs and fast turnaround for everyday collateral.','#f8b53b','solid'],
  ['Sublimation','Full colour on polyester, mugs and hard goods.','#f8b53b','dots'],
  ['Heat transfer','Uniforms, caps and bags, branded to last.','#eb3694','solid'],
  ['Laser engraving','Wood, metal and leather, marked with precision.','#eb3694','dots'],
  ['Laser cutting','Acrylic signage and custom shapes, cut clean.','#060809','solid'],
  ['Laser marking','Permanent marks on metal gifts and tools.','#060809','dots'],
  ['Epoxy doming','Raised, glossy badges and labels you want to touch.','#f4f1ea','gloss'],
];
const printCodes=['C 100','C 50','I 100','I 50','G 100','G 50','M 100','M 50','K 100','K 40','Gloss'];

const reviews=[
  ['Working with INAD is like having a world-class creative team that actually understands your market, your audience, and your business goals — all in one place, right here in Addis Ababa.','— Client review · via Google'],
  ['INAD delivered an exceptional corporate event. Every detail was handled professionally, and the branding materials and execution were truly outstanding.','— Client review · via Google'],
  ['The team at INAD understands marketing in a way very few agencies do. Their BTL campaigns drove genuine, measurable engagement. The branded gifts they sourced for us were absolutely premium quality — I couldn’t recommend them more.','— Client review · via Google'],
  ['From large-format printing to a full corporate rebrand, INAD has been our trusted marketing partner for years.','— Client review · via Facebook'],
];

function initMenu(){
  const button=document.querySelector('.mast__menu');
  const menu=document.getElementById('mobileNav');
  if(!button||!menu) return;
  const close=()=>{button.setAttribute('aria-expanded','false');menu.hidden=true;document.body.classList.remove('menu-open');};
  button.addEventListener('click',()=>{
    const open=button.getAttribute('aria-expanded')!=='true';
    button.setAttribute('aria-expanded',String(open));
    menu.hidden=!open;
    document.body.classList.toggle('menu-open',open);
  });
  menu.querySelectorAll('a').forEach(link=>link.addEventListener('click',close));
  document.addEventListener('keydown',event=>{if(event.key==='Escape') close();});
}

function initProgress(){
  const bar=document.querySelector('.mast__progress');
  if(!bar) return;
  const update=()=>{
    const max=document.documentElement.scrollHeight-innerHeight;
    bar.style.width=`${max>0?Math.min(100,scrollY/max*100):0}%`;
  };
  addEventListener('scroll',update,{passive:true});
  update();
}

function initRegistration(){
  const cover=document.querySelector('.cover');
  if(!cover||matchMedia('(pointer: coarse)').matches) return;
  const plates=[...cover.querySelectorAll('.plate:not(.plate--key)')];
  cover.addEventListener('pointermove',event=>{
    const x=(event.clientX/innerWidth-.5)*8;
    const y=(event.clientY/innerHeight-.5)*8;
    const factors=[.9,-.7,.6,-.8];
    plates.forEach((plate,index)=>{plate.style.translate=`${x*factors[index]}px ${y*factors[(index+1)%4]}px`;});
  });
  cover.addEventListener('pointerleave',()=>plates.forEach(plate=>{plate.style.translate='0 0';}));
}

function initServices(){
  document.querySelectorAll('.service-row button').forEach(button=>{
    button.addEventListener('click',()=>{
      const row=button.closest('.service-row');
      const open=!row.classList.contains('is-open');
      row.classList.toggle('is-open',open);
      button.setAttribute('aria-expanded',String(open));
    });
  });
}

function initPrint(){
  const root=document.querySelector('.swatches');
  const panel=document.querySelector('.swatch-panel');
  if(!root||!panel) return;
  let active=0;
  let fanned=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let userInteracted=false;
  let fanHeight=400;
  let panelReady=false;
  root.innerHTML=printMethods.map(([name,,color,finish],index)=>{
    return `<button class="swatch${index===0?' is-on':''}" type="button" role="tab" aria-selected="${index===0}" aria-controls="swatch-panel" tabindex="${index===0?'0':'-1'}" style="--swatch:${color}" data-swatch="${index}" data-finish="${finish}" aria-label="${String(index+1).padStart(2,'0')} ${name}, ${printCodes[index]}"><span class="swatch__chip"></span><span class="swatch__strip"><span class="swatch__n">${String(index+1).padStart(2,'0')}</span><span class="swatch__code">${printCodes[index]}</span><span class="swatch__name">${name}</span></span></button>`;
  }).join('')+'<span class="fan__rivet" aria-hidden="true"></span>';

  const geometry=()=>{
    const width=root.clientWidth||700;
    const compact=width<560;
    const spread=compact?92:112;
    const cardWidth=Math.round(compact?Math.max(40,width*.12):Math.min(96,width*.13));
    const cardHeight=Math.round(Math.min(compact?330:470,(width-cardWidth-8)/(2*Math.sin(spread/2*Math.PI/180))));
    return {width,compact,spread,cardWidth,cardHeight,height:cardHeight+70};
  };
  const rotationFor=(index,spread)=>{
    const base=-spread/2+spread*index/(printMethods.length-1);
    const distance=index-active;
    if(!distance) return base;
    return base+Math.sign(distance)*5*Math.max(0,1-(Math.abs(distance)-1)*.25);
  };
  const renderFan=(stagger=false)=>{
    const {compact,spread,cardWidth,cardHeight,height}=geometry();
    fanHeight=height;
    root.style.height=`${height}px`;
    root.querySelectorAll('.swatch').forEach((button,index)=>{
      const angle=fanned?rotationFor(index,spread):-spread/2+2;
      const radians=angle*Math.PI/180;
      const lift=index===active?34:0;
      button.style.width=`${cardWidth}px`;
      button.style.height=`${cardHeight}px`;
      button.style.left=`calc(50% - ${cardWidth/2}px)`;
      button.style.bottom='12px';
      button.style.transformOrigin=`50% ${cardHeight-22}px`;
      button.style.zIndex=String(index===active?30:index+1);
      button.style.transitionDelay=stagger?`${index*.05}s`:'0s';
      button.style.transform=`translate(${Math.sin(radians)*lift}px, ${-Math.cos(radians)*lift}px) rotate(${angle}deg)`;
      button.querySelector('.swatch__code').hidden=compact;
      button.querySelector('.swatch__name').hidden=compact;
    });
  };
  const select=(index,manual=true)=>{
    const next=Math.max(0,Math.min(printMethods.length-1,index));
    if(manual) userInteracted=true;
    if(panelReady&&next===active) return;
    active=next;
    const [name,description,color,finish]=printMethods[active];
    root.querySelectorAll('.swatch').forEach((button,buttonIndex)=>{
      const selected=buttonIndex===active;
      button.classList.toggle('is-on',selected);
      button.setAttribute('aria-selected',String(selected));
      button.tabIndex=selected?0:-1;
    });
    panel.style.setProperty('--swatch',color);
    panel.dataset.finish=finish;
    panel.dataset.index=String(active);
    panel.querySelector('.swatch-panel__code').textContent=`INAD ${String(active+1).padStart(2,'0')} · ${printCodes[active]}`;
    panel.querySelector('.swatch-panel__count').textContent=`${String(active+1).padStart(2,'0')} / ${String(printMethods.length).padStart(2,'0')}`;
    panel.querySelector('h3').textContent=name;
    panel.querySelector('p').textContent=description;
    panel.classList.remove('is-changing');
    void panel.offsetWidth;
    panel.classList.add('is-changing');
    panelReady=true;
    renderFan();
  };
  root.addEventListener('click',event=>{
    const button=event.target.closest('[data-swatch]');
    if(button) select(Number(button.dataset.swatch));
  });
  const selectFromPointer=event=>{
    const bounds=root.getBoundingClientRect();
    const {spread}=geometry();
    const horizontal=event.clientX-(bounds.left+bounds.width/2);
    const vertical=bounds.top+fanHeight-34-event.clientY;
    if(vertical<-10) return;
    const angle=Math.atan2(horizontal,vertical)*180/Math.PI;
    const index=Math.round((angle+spread/2)/spread*(printMethods.length-1));
    select(index);
  };
  root.addEventListener('pointermove',selectFromPointer);
  root.addEventListener('pointerdown',selectFromPointer);
  root.addEventListener('keydown',event=>{
    const direction={ArrowRight:1,ArrowDown:1,ArrowLeft:-1,ArrowUp:-1}[event.key];
    if(direction==null&&!['Home','End'].includes(event.key)) return;
    event.preventDefault();
    const next=event.key==='Home'?0:event.key==='End'?printMethods.length-1:Math.max(0,Math.min(printMethods.length-1,active+direction));
    root.querySelector(`[data-swatch="${next}"]`)?.focus();
    select(next);
  });
  root.querySelectorAll('.swatch').forEach(button=>button.addEventListener('focus',()=>select(Number(button.dataset.swatch))));
  new ResizeObserver(()=>renderFan()).observe(root);
  const reveal=()=>{
    if(fanned) return;
    fanned=true;
    renderFan(true);
    if(matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    setTimeout(()=>{
      const sequence=[...Array(printMethods.length).keys()].slice(1).concat([...Array(printMethods.length-1).keys()].reverse());
      let step=0;
      const demo=setInterval(()=>{
        if(userInteracted||step>=sequence.length){clearInterval(demo);return;}
        select(sequence[step++],false);
      },85);
    },1400);
  };
  if('IntersectionObserver' in window){
    const observer=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting)){observer.disconnect();reveal();}},{threshold:.35});
    observer.observe(root);
  }else reveal();
  select(0,false);
  renderFan();
}

function initProcess(){
  const section=document.querySelector('.process');
  const track=section?.querySelector('.process__track');
  if(!section||!track) return;
  const steps=[
    {number:'01',title:'Discovery',ink:'Cyan',color:'var(--cyan)',pieces:['left'],text:'We dive deep into your brand, audience, goals and market landscape to uncover the pulse that drives your business forward.'},
    {number:'02',title:'Strategy',ink:'Indigo',color:'var(--indigo-lift)',pieces:['left','peak','middle'],text:'We map the campaign direction, messaging, channels and visual trajectory to ensure maximum impact and clarity.'},
    {number:'03',title:'Creation',ink:'Gold',color:'var(--gold)',pieces:['left','peak','middle','valley'],text:'Our creative team brings the strategy to life with polished concepts, production detail and precise execution.'},
    {number:'04',title:'Deliver',ink:'Magenta',color:'var(--magenta)',pieces:['left','peak','middle','valley','right'],text:'We launch with precision, monitor every detail and optimise for measurable growth and confident delivery.'},
  ];
  const pieces=[...section.querySelectorAll('[data-piece]')];
  const outlines=[...section.querySelectorAll('[data-outline]')];
  const fills=[...section.querySelectorAll('.process__segments b')];
  const segmentLabels=[...section.querySelectorAll('.process__segments span')];
  const body=section.querySelector('.process__body');
  const svg=section.querySelector('.process__n');
  const fields={
    num:section.querySelector('[data-process-num]'),label:section.querySelector('[data-process-label]'),
    title:section.querySelector('[data-process-title]'),text:section.querySelector('[data-process-text]'),
    plate:section.querySelector('[data-process-plate]'),ink:section.querySelector('[data-process-ink]'),
  };
  let active=-1;
  let ticking=false;
  const renderStep=index=>{
    if(index===active) return;
    active=index;
    const step=steps[index];
    section.dataset.step=String(index+1);
    pieces.forEach(piece=>piece.classList.toggle('is-printed',step.pieces.includes(piece.dataset.piece)));
    outlines.forEach(outline=>outline.classList.toggle('is-hidden',step.pieces.includes(outline.dataset.outline)));
    fields.num.textContent=step.number;
    fields.label.textContent=`Step ${step.number} of 04 · Plate ${step.ink}`;
    fields.title.textContent=step.title;
    fields.text.textContent=step.text;
    fields.plate.textContent=String(index+1);
    fields.ink.textContent=step.ink;
    fields.ink.style.color=step.color;
    svg.setAttribute('aria-label',`The INAD N after plate ${index+1} of 4`);
    segmentLabels.forEach((label,labelIndex)=>label.classList.toggle('is-active',labelIndex===index));
    body.classList.remove('is-changing');
    void body.offsetWidth;
    body.classList.add('is-changing');
  };
  const update=()=>{
    const rect=track.getBoundingClientRect();
    const distance=Math.max(1,track.offsetHeight-innerHeight);
    const progress=Math.max(0,Math.min(1,-rect.top/distance));
    renderStep(Math.min(3,Math.floor(progress*4)));
    fills.forEach((fill,index)=>{
      const local=Math.max(0,Math.min(1,(progress-index/4)*4));
      fill.style.transform=`scaleX(${local})`;
    });
    ticking=false;
  };
  const requestUpdate=()=>{
    if(ticking) return;
    ticking=true;
    requestAnimationFrame(update);
  };
  addEventListener('scroll',requestUpdate,{passive:true});
  addEventListener('resize',requestUpdate);
  update();
}

function initReviews(){
  const letters=document.getElementById('reviewLetters');
  const live=document.getElementById('reviewLive');
  const count=document.getElementById('reviewCount');
  if(!letters||!count) return;
  let order=reviews.map((_,index)=>index);
  let dragging=false;
  let startX=0;
  let lastX=0;
  let lastTime=0;
  let velocity=0;
  let animating=false;
  const rotations=[-1.6,2.2,-3.2,3.6];
  const escape=value=>String(value).replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
  const stamp='<span class="stamp" aria-hidden="true"><span class="stamp__in"><img src="/inad-logo.svg" alt=""><b>5.0 ★</b></span></span>';
  const postmark='<svg class="postmark" viewBox="0 0 150 70" aria-hidden="true"><circle cx="45" cy="35" r="31"/><circle cx="45" cy="35" r="17"/><text x="45" y="20" text-anchor="middle">ADDIS ABABA</text><text x="45" y="39" text-anchor="middle">2026</text><path d="M80 20q8-5 16 0t16 0t16 0t16 0M80 30q8-5 16 0t16 0t16 0t16 0M80 40q8-5 16 0t16 0t16 0t16 0M80 50q8-5 16 0t16 0t16 0t16 0"/></svg>';
  const render=()=>{
    letters.innerHTML=[...order].reverse().map(reviewIndex=>{
      const depth=order.indexOf(reviewIndex);
      const [quote,source]=reviews[reviewIndex];
      return `<div class="letter-wrap${depth===0?' is-top':''}" data-depth="${depth}" style="--depth:${depth};--tilt:${rotations[depth%rotations.length]}deg;z-index:${10-depth}"><article class="letter" aria-hidden="${depth===0?'false':'true'}"><div class="letter__head"><span class="label">Letter N° ${String(reviewIndex+1).padStart(2,'0')}</span>${stamp}</div>${postmark}<blockquote>“${escape(quote)}”</blockquote><p class="label letter__source">${escape(source)}</p></article></div>`;
    }).join('');
    const current=order[0];
    count.textContent=`${String(current+1).padStart(2,'0')} / ${String(reviews.length).padStart(2,'0')} · Drag the letter away`;
    if(live) live.textContent=`Letter ${current+1} of ${reviews.length}: ${reviews[current][0]}`;
    animating=false;
  };
  const cycle=direction=>{
    order=direction>0?[...order.slice(1),order[0]]:[order[order.length-1],...order.slice(0,-1)];
    render();
  };
  const throwTop=direction=>{
    if(animating) return;
    const top=letters.querySelector('.letter-wrap.is-top');
    if(!top) return;
    if(matchMedia('(prefers-reduced-motion: reduce)').matches){cycle(direction);return;}
    animating=true;
    top.style.setProperty('--throw',`${direction*140}%`);
    top.style.setProperty('--throw-rotate',`${direction*18}deg`);
    top.classList.add('is-thrown');
    setTimeout(()=>cycle(direction),360);
  };
  letters.addEventListener('pointerdown',event=>{
    const top=event.target.closest('.letter-wrap.is-top');
    if(!top||animating||matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    dragging=true;startX=lastX=event.clientX;lastTime=performance.now();velocity=0;
    top.classList.add('is-dragging');top.setPointerCapture(event.pointerId);
  });
  letters.addEventListener('pointermove',event=>{
    if(!dragging) return;
    const top=letters.querySelector('.letter-wrap.is-top');
    if(!top) return;
    const now=performance.now();
    const x=event.clientX-startX;
    velocity=(event.clientX-lastX)/Math.max(1,now-lastTime)*1000;
    lastX=event.clientX;lastTime=now;
    top.style.setProperty('--drag-x',`${x}px`);
    top.style.setProperty('--drag-rotate',`${Math.max(-14,Math.min(14,x/23))}deg`);
  });
  const release=event=>{
    if(!dragging) return;
    dragging=false;
    const top=letters.querySelector('.letter-wrap.is-top');
    if(!top) return;
    const x=event.clientX-startX;
    top.classList.remove('is-dragging');
    if(Math.abs(x)>110||Math.abs(velocity)>600){throwTop(x===0?Math.sign(velocity)||1:Math.sign(x));return;}
    top.style.removeProperty('--drag-x');top.style.removeProperty('--drag-rotate');
  };
  letters.addEventListener('pointerup',release);
  letters.addEventListener('pointercancel',release);
  document.querySelector('[data-review-prev]')?.addEventListener('click',()=>throwTop(-1));
  document.querySelector('[data-review-next]')?.addEventListener('click',()=>throwTop(1));
  render();
}

function initQuoteReveal(){
  const quote=document.querySelector('.editorial-quote');
  if(!quote) return;
  const cite=quote.querySelector('cite');
  const text=[...quote.childNodes]
    .filter(node=>node.nodeType===Node.TEXT_NODE)
    .map(node=>node.textContent)
    .join(' ')
    .replace(/\s+/g,' ')
    .trim();
  if(!text) return;
  [...quote.childNodes].filter(node=>node.nodeType===Node.TEXT_NODE).forEach(node=>node.remove());
  const fragment=document.createDocumentFragment();
  text.split(' ').forEach((word,index,words)=>{
    const span=document.createElement('span');
    span.className='quote-word';
    span.textContent=word;
    fragment.append(span);
    if(index<words.length-1) fragment.append(' ');
  });
  quote.insertBefore(fragment,cite);
  const words=[...quote.querySelectorAll('.quote-word')];
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){
    words.forEach(word=>word.classList.add('is-lit'));
    return;
  }
  let ticking=false;
  const update=()=>{
    const top=quote.getBoundingClientRect().top;
    const progress=Math.max(0,Math.min(1,(innerHeight*.92-top)/(innerHeight*.65)));
    const visible=Math.round(progress*words.length);
    words.forEach((word,index)=>word.classList.toggle('is-lit',index<visible));
    ticking=false;
  };
  const requestUpdate=()=>{
    if(ticking) return;
    ticking=true;
    requestAnimationFrame(update);
  };
  addEventListener('scroll',requestUpdate,{passive:true});
  addEventListener('resize',requestUpdate);
  update();
}

function initGridToggle(){
  const button=document.querySelector('[data-grid-toggle]');
  if(!button) return;
  button.addEventListener('click',()=>{
    const on=document.documentElement.classList.toggle('show-layout-grid');
    button.setAttribute('aria-pressed',String(on));
    button.textContent=on?'Hide the grid':'Show the grid';
  });
}

export function initEditorial(){
  initMenu();
  initProgress();
  initRegistration();
  initServices();
  initPrint();
  initProcess();
  initReviews();
  initQuoteReveal();
  initGridToggle();
}
