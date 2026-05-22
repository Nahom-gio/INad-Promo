import about from './sections/about.html?raw';
import contact from './sections/contact.html?raw';
import footer from './sections/footer.html?raw';
import hero from './sections/hero.html?raw';
import industries from './sections/industries.html?raw';
import mobileMenu from './sections/mobile-menu.html?raw';
import navigation from './sections/navigation.html?raw';
import process from './sections/process.html?raw';
import services from './sections/services.html?raw';
import testimonials from './sections/testimonials.html?raw';
import ticker from './sections/ticker.html?raw';
import why from './sections/why.html?raw';
import work from './sections/work.html?raw';

const sections=[
  mobileMenu,
  navigation,
  hero,
  about,
  ticker,
  services,
  process,
  work,
  why,
  testimonials,
  industries,
  contact,
  footer,
];

export function renderPage(){
  document.getElementById('app').innerHTML=sections.join('\n');
}
