import { initAboutMedia } from './js/aboutMedia.js';
import { initContactForm } from './js/contactForm.js';
import { initHeroWord } from './js/heroWord.js';
import { initMobileMenu } from './js/mobileMenu.js';
import { initNavigation } from './js/navigation.js';
import { initReveal, observeRevealElements } from './js/reveal.js';
import { initStrapiContent } from './js/strapiContent.js';
import { initWorkFilter, refreshWorkFilter } from './js/workFilter.js';
import { renderPage } from './renderPage.js';

function loadDeferredContent(){
  const hydrate=()=>void initStrapiContent();
  if('requestIdleCallback' in window){
    window.requestIdleCallback(hydrate,{timeout:800});
  }else{
    window.setTimeout(hydrate,0);
  }
}

function loadDecorativeEffects(){
  const run=()=>{
    void import('./js/cursor.js').then(({ initCursor }) => initCursor());
    void import('./js/heroParallax.js').then(({ initHeroParallax }) => initHeroParallax());
    void import('./js/heroParticles.js').then(({ initHeroParticles }) => initHeroParticles());
  };

  window.setTimeout(run, 1200);
}

function boot(){
  renderPage();
  initAboutMedia();
  initNavigation();
  initMobileMenu();
  initReveal();
  initWorkFilter();
  initContactForm();
  initHeroWord();
  loadDecorativeEffects();
  document.addEventListener('inad:projects-hydrated',event=>{
    refreshWorkFilter();
    observeRevealElements(event.detail.root);
  });
  loadDeferredContent();
}

boot();
