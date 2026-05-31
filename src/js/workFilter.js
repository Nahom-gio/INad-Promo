let activeCategory='all';
let activeBrand=null;

const layoutClasses=['wlayout-1','wlayout-2','wlayout-3','wlayout-4','wlayout-5','wlayout-6','wlayout-7'];

function clearCardState(card){
  card.classList.remove(...layoutClasses,'is-folder','is-open-project');
  card.removeAttribute('aria-label');
  card.removeAttribute('role');
  card.tabIndex=-1;
  card.onclick=null;
  card.onkeydown=null;
}

function applyLayout(cards){
  cards.forEach((card,index)=>{
    card.classList.add(`wlayout-${(index%7)+1}`);
  });
}

function setGridMode(mode){
  const grid=document.getElementById('wGrid');
  if(!grid) return;
  grid.classList.remove('is-folder-view','is-project-view');
  grid.classList.add(mode==='folder' ? 'is-folder-view' : 'is-project-view');
}

function showCards(cards,{mode='project'}={}){
  const allCards=[...document.querySelectorAll('.wcard')];
  setGridMode(mode);

  allCards.forEach(card=>{
    clearCardState(card);
    card.style.display='none';
  });

  cards.forEach(card=>{
    card.style.display='';
  });

  if(mode==='project') applyLayout(cards);
}

function folderCardsFor(category){
  const cards=[...document.querySelectorAll(`.wcard[data-cat="${category}"]`)];
  const seen=new Set();

  return cards.filter(card=>{
    const brand=card.dataset.brand||card.dataset.folderLabel||card.dataset.cat;
    if(seen.has(brand)) return false;
    seen.add(brand);
    return true;
  });
}

function openBrand(category,brand){
  activeCategory=category;
  activeBrand=brand;
  const back=document.getElementById('workBack');
  if(back) back.hidden=false;

  const cards=[...document.querySelectorAll(`.wcard[data-cat="${category}"][data-brand="${brand}"]`)];
  showCards(cards,{mode:'project'});
  cards.forEach(card=>card.classList.add('is-open-project'));
}

function showFolders(category){
  activeCategory=category;
  activeBrand=null;
  const back=document.getElementById('workBack');
  if(back) back.hidden=true;

  const folders=folderCardsFor(category);
  showCards(folders,{mode:'folder'});

  folders.forEach(card=>{
    const label=card.dataset.folderLabel||card.dataset.brand||category;
    card.classList.add('is-folder');
    card.setAttribute('role','button');
    card.tabIndex=0;
    card.setAttribute('aria-label',`Open ${label} projects`);
    card.onclick=()=>openBrand(category,card.dataset.brand);
    card.onkeydown=(event)=>{
      if(event.key==='Enter'||event.key===' '){
        event.preventDefault();
        openBrand(category,card.dataset.brand);
      }
    };
  });
}

function fwork(btn,cat){
  document.querySelectorAll('.wf').forEach(b=>b.classList.remove('on'));
  btn.classList.add('on');

  activeCategory=cat;
  activeBrand=null;

  if(cat==='all'){
    const back=document.getElementById('workBack');
    if(back) back.hidden=true;

    const cards=[...document.querySelectorAll('.wcard')].filter(card=>card.dataset.all!=='false');
    showCards(cards,{mode:'project'});
    return;
  }

  showFolders(cat);
}

export function initWorkFilter(){
  document.querySelectorAll('[data-work-filter]').forEach(btn=>{
    btn.addEventListener('click',()=>fwork(btn,btn.dataset.workFilter));
  });

  const back=document.getElementById('workBack');
  if(back){
    back.addEventListener('click',()=>{
      if(activeCategory&&activeCategory!=='all') showFolders(activeCategory);
    });
  }

  const active=document.querySelector('[data-work-filter].on')||document.querySelector('[data-work-filter]');
  if(active) fwork(active,active.dataset.workFilter);
}

export function refreshWorkFilter(){
  const active=document.querySelector(`[data-work-filter="${activeCategory}"]`)
    ||document.querySelector('[data-work-filter="all"]');
  if(active) fwork(active,active.dataset.workFilter);
}
