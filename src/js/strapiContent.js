const STRAPI_URL=(import.meta.env.VITE_STRAPI_URL||'').replace(/\/$/,'');
const STRAPI_TOKEN=import.meta.env.VITE_STRAPI_TOKEN||'';
const CACHE_TTL=10*60*1000;
const CACHE_PREFIX='inad:strapi:';

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
  const cacheKey=`${CACHE_PREFIX}${STRAPI_URL}:${path}`;
  const cached=readCache(cacheKey);
  if(cached) return cached;

  try{
    const response=await fetch(`${STRAPI_URL}/api/${path}`,{headers:headers()});
    if(!response.ok) throw new Error(`Strapi request failed: ${path}`);
    const data=await response.json();
    writeCache(cacheKey,data);
    return data;
  }catch(error){
    const stale=readCache(cacheKey,{allowExpired:true});
    if(stale){
      console.warn(`[Strapi] Using cached ${path} after request failure.`,error);
      return stale;
    }
    throw error;
  }
}

function readCache(key,{allowExpired=false}={}){
  try{
    const raw=sessionStorage.getItem(key);
    if(!raw) return null;

    const cached=JSON.parse(raw);
    const expired=Date.now()-cached.savedAt>CACHE_TTL;
    if(expired&&!allowExpired) return null;

    return cached.data;
  }catch{
    return null;
  }
}

function writeCache(key,data){
  try{
    sessionStorage.setItem(key,JSON.stringify({
      savedAt:Date.now(),
      data,
    }));
  }catch{
    // Storage may be disabled or full. The live request already succeeded.
  }
}

function setText(selector,value){
  if(value===undefined||value===null||value==='') return;
  const el=document.querySelector(selector);
  if(el) el.textContent=value;
}

function hydrateAbout(about){
  const source=document.querySelector('.about-logo-frame video source');
  const videoEl=document.querySelector('.about-logo-frame video');
  if(!source||!videoEl) return;

  const fallback=videoEl.dataset.fallbackSrc||source.src;
  let usingFallback=source.getAttribute('src')===fallback;

  videoEl.addEventListener('error',()=>{
    if(usingFallback) return;
    usingFallback=true;
    source.src=fallback;
    videoEl.load();
  },{once:false});

  if(!about) return;

  const video=mediaUrl(about.video);
  if(video){
    usingFallback=false;
    source.src=video;
    videoEl.load();
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
