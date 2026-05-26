import { initContactForm } from './js/contactForm.js';
import { initCursor } from './js/cursor.js';
import { initHeroParallax } from './js/heroParallax.js';
import { initHeroParticles } from './js/heroParticles.js';
import { initHeroWord } from './js/heroWord.js';
import { initMobileMenu } from './js/mobileMenu.js';
import { initNavigation } from './js/navigation.js';
import { initReveal } from './js/reveal.js';
import { initStrapiContent } from './js/strapiContent.js';
import { initWorkFilter } from './js/workFilter.js';
import { renderPage } from './renderPage.js';

async function boot(){
  renderPage();
  await initStrapiContent();
  initCursor();
  initNavigation();
  initMobileMenu();
  initReveal();
  initWorkFilter();
  initContactForm();
  initHeroWord();
  initHeroParallax();
  initHeroParticles();
}

boot();
