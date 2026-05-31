import { initAboutMedia } from './js/aboutMedia.js';
import { initContactForm } from './js/contactForm.js';
import { initCursor } from './js/cursor.js';
import { initHeroParallax } from './js/heroParallax.js';
import { initHeroParticles } from './js/heroParticles.js';
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
    window.requestIdleCallback(hydrate,{timeout:1500});
  }else{
    window.setTimeout(hydrate,0);
  }
}

function boot(){
  renderPage();
  initAboutMedia();
  initCursor();
  initNavigation();
  initMobileMenu();
  initReveal();
  initWorkFilter();
  initContactForm();
  initHeroWord();
  initHeroParallax();
  initHeroParticles();
  document.addEventListener('inad:projects-hydrated',event=>{
    refreshWorkFilter();
    observeRevealElements(event.detail.root);
  });
  if(document.readyState==='complete'){
    loadDeferredContent();
  }else{
    window.addEventListener('load',loadDeferredContent,{once:true});
  }
}

boot();
