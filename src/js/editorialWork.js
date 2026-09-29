let activeCategory='all';

const allCards=()=>[...document.querySelectorAll('.case-card')];
const cardsForCategory=category=>allCards().filter(card=>card.dataset.cat===category);

function resetCards(){
  allCards().forEach(card=>{
    card.hidden=true;
    card.classList.remove('is-folder');
    card.tabIndex=-1;
    card.onclick=null;
    card.onkeydown=null;
  });
}

function showAll(){
  resetCards();
  allCards().filter(card=>card.dataset.all!=='false').forEach(card=>{card.hidden=false;});
  document.getElementById('workBack').hidden=true;
}

function openBrand(category,brand){
  resetCards();
  allCards().filter(card=>card.dataset.cat===category&&card.dataset.brand===brand).forEach(card=>{card.hidden=false;});
  document.getElementById('workBack').hidden=false;
}

function showFolders(category){
  resetCards();
  const seen=new Set();
  cardsForCategory(category).forEach(card=>{
    if(seen.has(card.dataset.brand)) return;
    seen.add(card.dataset.brand);
    card.hidden=false;
    card.classList.add('is-folder');
    card.tabIndex=0;
    const open=()=>openBrand(category,card.dataset.brand);
    card.onclick=open;
    card.onkeydown=event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();open();}};
  });
  document.getElementById('workBack').hidden=true;
}

function apply(category){
  activeCategory=category;
  document.querySelectorAll('.case-filter').forEach(button=>button.classList.toggle('is-on',button.dataset.workFilter===category));
  if(category==='all') showAll(); else showFolders(category);
}

export function initWorkFilter(){
  document.querySelectorAll('.case-filter').forEach(button=>button.addEventListener('click',()=>apply(button.dataset.workFilter)));
  document.getElementById('workBack')?.addEventListener('click',()=>showFolders(activeCategory));
}

export function refreshWorkFilter(){
  apply(activeCategory);
}
