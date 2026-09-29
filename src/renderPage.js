import editorial from './sections/editorial.html?raw';

export function renderPage(){
  document.getElementById('app').innerHTML=editorial;
}
