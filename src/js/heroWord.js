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

  function tick(){
    const current=words[wordIndex];
    word.textContent=current.slice(0,charIndex);

    if(!deleting && charIndex===current.length){
      deleting=true;
      setTimeout(tick,1400);
      return;
    }

    if(deleting && charIndex===0){
      deleting=false;
      wordIndex=(wordIndex+1)%words.length;
      setTimeout(tick,180);
      return;
    }

    charIndex+=deleting?-1:1;
    setTimeout(tick,deleting?55:95);
  }

  setTimeout(tick,1000);
}
