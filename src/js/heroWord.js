const TYPE_WORDS=['Alive','Seen','Experienced','Remembered','Amplified'];

export function initHeroWord(){
  const word=document.querySelector('.hero-word');
  if(!word)return;

  const words=(word.dataset.words || TYPE_WORDS.join(','))
    .split(',')
    .map(item=>item.trim())
    .filter(Boolean);
  let wordIndex=0;
  let charIndex=words[0].length;
  let deleting=false;
  let timer=null;

  function schedule(delay){
    window.clearTimeout(timer);
    if(!document.hidden) timer=window.setTimeout(tick,delay);
  }

  function tick(){
    const current=words[wordIndex];
    word.textContent=current.slice(0,charIndex);

    if(!deleting && charIndex===current.length){
      deleting=true;
      schedule(1400);
      return;
    }

    if(deleting && charIndex===0){
      deleting=false;
      wordIndex=(wordIndex+1)%words.length;
      schedule(180);
      return;
    }

    charIndex+=deleting?-1:1;
    schedule(deleting?55:95);
  }

  document.addEventListener('visibilitychange',()=>{
    if(document.hidden){
      window.clearTimeout(timer);
    }else{
      schedule(180);
    }
  });

  schedule(1000);
}
