import { initContactForm } from './js/contactForm.js';
import { initCmsContent } from './js/editorialCms.js';
import { initEditorial } from './js/editorial.js';
import { initWorkFilter, refreshWorkFilter } from './js/editorialWork.js';
import { renderPage } from './renderPage.js';

function boot(){
  renderPage();
  initEditorial();
  initWorkFilter();
  initContactForm();
  document.addEventListener('inad:projects-hydrated',refreshWorkFilter);
  void initCmsContent();
}

boot();
