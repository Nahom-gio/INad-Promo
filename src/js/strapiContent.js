const STRAPI_URL=(import.meta.env.VITE_STRAPI_URL||'').replace(/\/$/,'');
const STRAPI_TOKEN=import.meta.env.VITE_STRAPI_TOKEN||'';

function headers(){
  return STRAPI_TOKEN ? {Authorization:`Bearer ${STRAPI_TOKEN}`} : {};
}

function attrs(entry){
  return entry?.attributes||entry||{};
}

function one(response){
  return attrs(response?.data);
}

function many(response){
  const data=response?.data;
  return Array.isArray(data) ? data.map(attrs) : [];
}

function mediaUrl(media){
  const item=media?.data ? attrs(media.data) : attrs(media);
  const url=item?.url;
  if(!url) return '';
  return url.startsWith('http') ? url : `${STRAPI_URL}${url}`;
}

function text(value){
  return String(value||'');
}

function escapeHtml(value){
  return text(value).replace(/[&<>"']/g,char=>({
    '&':'&amp;',
    '<':'&lt;',
    '>':'&gt;',
    '"':'&quot;',
    "'":'&#39;',
  })[char]);
}

async function get(path){
  const response=await fetch(`${STRAPI_URL}/api/${path}`,{headers:headers()});
  if(!response.ok) throw new Error(`Strapi request failed: ${path}`);
  return response.json();
}

function setText(selector,value){
  if(value===undefined||value===null||value==='') return;
  const el=document.querySelector(selector);
  if(el) el.textContent=value;
}

function hydrateAbout(about){
  if(!about) return;

  const video=mediaUrl(about.video);
  if(video){
    const source=document.querySelector('.about-logo-frame video source');
    const videoEl=document.querySelector('.about-logo-frame video');
    if(source&&videoEl){
      source.src=video;
      videoEl.load();
    }
  }
}

function projectCard({category,brand,folderLabel,brandLabel,title,image,alt,showInAll=false,delay='d1'}){
  const dataAll=showInAll ? '' : ' data-all="false"';
  const media=image
    ? `<img class="wphoto" src="${escapeHtml(image)}" alt="${escapeHtml(alt||title)}" loading="lazy">`
    : `<div class="wbg" style="background:linear-gradient(135deg,#101522,#172738,#2a1023);"></div>`;

  return `
    <div class="wcard rv ${escapeHtml(delay)}" data-cat="${escapeHtml(category)}" data-brand="${escapeHtml(brand)}" data-folder-label="${escapeHtml(folderLabel)}"${dataAll}>
      ${media}
      <div class="woverlay"></div>
      <div class="winfo">
        <div class="wcat">${escapeHtml(brandLabel||folderLabel)}</div>
        <div class="wtitle">${escapeHtml(title)}</div>
      </div>
    </div>`;
}

function hydrateProjects(brands){
  if(!brands.length) return;

  const grid=document.getElementById('wGrid');
  if(!grid) return;

  const cards=[];
  brands.forEach((brand,index)=>{
    const category=brand.category||'events';
    const slug=brand.slug||brand.name?.toLowerCase().replace(/\s+/g,'-')||`brand-${index}`;
    const folderLabel=brand.folderLabel||brand.name||brand.brandLabel||slug;
    const items=Array.isArray(brand.items) ? brand.items.map(attrs) : [];
    const cover=mediaUrl(brand.coverImage)||mediaUrl(items[0]?.image);
    const visibleInAll=Boolean(brand.showInAll);

    if(items.length){
      items.forEach((item,itemIndex)=>{
        cards.push(projectCard({
          category,
          brand:slug,
          folderLabel,
          brandLabel:brand.brandLabel||folderLabel,
          title:item.title||brand.campaignTitle||folderLabel,
          image:mediaUrl(item.image)||cover,
          alt:item.alt||item.title||brand.campaignTitle,
          showInAll:visibleInAll&&itemIndex===0,
          delay:`d${(itemIndex%4)+1}`,
        }));
      });
      return;
    }

    cards.push(projectCard({
      category,
      brand:slug,
      folderLabel,
      brandLabel:brand.brandLabel||folderLabel,
      title:brand.campaignTitle||folderLabel,
      image:cover,
      alt:brand.campaignTitle||folderLabel,
      showInAll:visibleInAll,
      delay:`d${(index%4)+1}`,
    }));
  });

  grid.innerHTML=cards.join('\n');
}

function clientLogoCard(logo,hidden=false){
  const name=logo.name||logo.alt||'Client logo';
  const image=mediaUrl(logo.logo);
  if(!image) return '';

  return `
    <div class="ind-item"${hidden ? ' aria-hidden="true"' : ''}>
      <img src="${escapeHtml(image)}" alt="${hidden ? '' : escapeHtml(logo.alt||name)}" loading="lazy">
    </div>`;
}

function hydrateClientLogos(logos){
  if(!logos.length) return;

  const track=document.querySelector('.client-track');
  if(!track) return;

  const visible=logos.map(logo=>clientLogoCard(logo,false)).filter(Boolean);
  const duplicate=logos.map(logo=>clientLogoCard(logo,true)).filter(Boolean);
  if(!visible.length) return;

  track.innerHTML=[...visible,...duplicate].join('\n');
}

export async function initStrapiContent(){
  if(!STRAPI_URL) return;

  const requests=[
    ['about',get('about-section?populate=*')],
    ['projects',get('project-brands?populate[coverImage]=true&populate[items][populate][image]=true&sort=order:asc')],
    ['logos',get('client-logos?populate=logo&sort=order:asc')],
  ];

  const results=await Promise.allSettled(requests.map(([,request])=>request));

  results.forEach((result,index)=>{
    const key=requests[index][0];
    if(result.status==='rejected'){
      console.warn(`[Strapi] ${key} content unavailable.`,result.reason);
      return;
    }

    if(key==='about') hydrateAbout(one(result.value));
    if(key==='projects') hydrateProjects(many(result.value));
    if(key==='logos') hydrateClientLogos(many(result.value));
  });
}
