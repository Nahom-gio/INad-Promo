const STRAPI_URL=(import.meta.env.VITE_STRAPI_URL||'').replace(/\/$/,'');
const CACHE_TTL=10*60*1000;
const CACHE_PREFIX='inad:strapi:';
const PROJECT_CATEGORY_IDS=new Set(['btl','events','branding','print']);

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

function mediaUrl(media,formats=[]){
  return mediaInfo(media,formats).url;
}

function mediaInfo(media,formats=[]){
  const item=media?.data ? attrs(media.data) : attrs(media);
  const variant=formats.map(format=>item?.formats?.[format]).find(Boolean);
  const selected=variant||item;
  const url=selected?.url||item?.url;
  return {
    url:url ? (url.startsWith('http') ? url : `${STRAPI_URL}${url}`) : '',
    width:selected?.width||item?.width||'',
    height:selected?.height||item?.height||'',
  };
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
    const response=await fetch(`${STRAPI_URL}/api/${path}`);
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

function setStatus(selector,value,{hidden=false}={}){
  const el=document.querySelector(selector);
  if(!el) return;
  el.textContent=value;
  el.hidden=hidden;
}

function showProjectsUnavailable(message='Our project gallery is being updated. Contact us to request a relevant portfolio.'){
  const grid=document.getElementById('wGrid');
  const filters=document.querySelector('.work-filters');
  const back=document.getElementById('workBack');

  if(grid){
    grid.innerHTML='';
    grid.hidden=true;
  }
  if(filters) filters.hidden=true;
  if(back) back.hidden=true;
  setStatus('.work-status','',{hidden:true});
  setStatus('.work-fallback-message',message);
  document.querySelector('.work-fallback')?.removeAttribute('hidden');
}

function showProjects(){
  const grid=document.getElementById('wGrid');
  const filters=document.querySelector('.work-filters');

  if(grid) grid.hidden=false;
  if(filters) filters.hidden=false;
  document.querySelector('.work-fallback')?.setAttribute('hidden','');
}

function hydrateAbout(about){
  const source=document.querySelector('.about-logo-frame video source');
  if(!source) return;

  if(!about) return;

  const video=mediaUrl(about.video);
  if(!video) return;

  source.dataset.src=video;
  if(source.hasAttribute('src')&&source.getAttribute('src')!==video){
    const videoEl=source.closest('video');
    source.setAttribute('src',video);
    videoEl?.load();
    void videoEl?.play().catch(()=>{});
  }
}

function projectCard({category,brand,folderLabel,brandLabel,title,image,alt,showInAll=false,delay='d1'}){
  const dataAll=showInAll ? '' : ' data-all="false"';
  const media=image
    ? `<img class="wphoto" src="${escapeHtml(image)}" alt="${escapeHtml(alt||title)}" loading="lazy" decoding="async">`
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
  const grid=document.getElementById('wGrid');
  if(!grid) return;

  const cards=[];
  brands.forEach((brand,index)=>{
    const category=brand.category;
    const slug=brand.slug;
    if(!slug||!PROJECT_CATEGORY_IDS.has(category)){
      console.warn('[Strapi] Skipping project brand with an invalid required slug or category.',brand);
      return;
    }

    const folderLabel=brand.folderLabel||brand.name||brand.brandLabel||slug;
    const items=Array.isArray(brand.items) ? brand.items.map(attrs) : [];
    const cover=mediaUrl(brand.coverImage,['large','medium','small'])||mediaUrl(items[0]?.image,['large','medium','small']);
    const visibleInAll=Boolean(brand.showInAll);

    if(items.length){
      items.forEach((item,itemIndex)=>{
        cards.push(projectCard({
          category,
          brand:slug,
          folderLabel,
          brandLabel:brand.brandLabel||folderLabel,
          title:item.title||brand.campaignTitle||folderLabel,
          image:mediaUrl(item.image,['large','medium','small'])||cover,
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

  if(!cards.length){
    showProjectsUnavailable();
    return;
  }

  showProjects();
  grid.innerHTML=cards.join('\n');
  setStatus('.work-status','',{hidden:true});
  document.dispatchEvent(new CustomEvent('inad:projects-hydrated',{detail:{root:grid}}));
}

function clientLogoCard(logo,{hidden=false,priority=false}={}){
  const name=logo.name||logo.alt||'Client logo';
  const image=mediaInfo(logo.logo,['small','thumbnail']);
  if(!image.url) return '';
  const dimensions=[
    image.width ? ` width="${escapeHtml(image.width)}"` : '',
    image.height ? ` height="${escapeHtml(image.height)}"` : '',
  ].join('');

  return `
    <div class="ind-item"${hidden ? ' aria-hidden="true"' : ''}>
      <img src="${escapeHtml(image.url)}" alt="${hidden ? '' : escapeHtml(logo.alt||name)}"${dimensions}${priority ? ' data-logo-priority="true" fetchpriority="high"' : ''} loading="${priority ? 'eager' : 'lazy'}" decoding="async">
    </div>`;
}

function readyClientLogoTrack(track){
  const priorityImages=[...track.querySelectorAll('img[data-logo-priority="true"]')];
  const images=priorityImages.length ? priorityImages : [...track.querySelectorAll('.ind-item:not([aria-hidden="true"]) img')];
  if(!images.length){
    track.classList.add('is-ready');
    return;
  }

  Promise.allSettled(images.map(image=>{
    if(image.complete) return Promise.resolve();
    return image.decode ? image.decode() : new Promise(resolve=>{
      image.addEventListener('load',resolve,{once:true});
      image.addEventListener('error',resolve,{once:true});
    });
  })).then(()=>track.classList.add('is-ready'));
}

function hydrateClientLogos(logos){
  const track=document.querySelector('.client-track');
  if(!track) return;

  track.classList.remove('is-ready');

  const visible=logos.map((logo,index)=>clientLogoCard(logo,{priority:index<12})).filter(Boolean);
  const duplicate=logos.map(logo=>clientLogoCard(logo,{hidden:true})).filter(Boolean);
  if(!visible.length){
    setStatus('.clients-status','Client logos are currently unavailable.');
    return;
  }

  track.innerHTML=[...visible,...duplicate].join('\n');
  readyClientLogoTrack(track);
  setStatus('.clients-status','',{hidden:true});
}

export async function initStrapiContent(){
  if(!STRAPI_URL){
    showProjectsUnavailable();
    setStatus('.clients-status','Client logos are currently unavailable.');
    return;
  }

  void get('client-logos?populate=logo&sort=order:asc&pagination[pageSize]=100')
    .then(response=>hydrateClientLogos(many(response)))
    .catch(error=>{
      console.warn('[Strapi] logos content unavailable.',error);
      setStatus('.clients-status','Client logos are currently unavailable.');
    });

  void get('about-section?populate=*')
    .then(response=>hydrateAbout(one(response)))
    .catch(error=>console.warn('[Strapi] about content unavailable.',error));

  void get('project-brands?populate[coverImage]=true&populate[items][populate][image]=true&sort=order:asc&pagination[pageSize]=100')
    .then(response=>hydrateProjects(many(response)))
    .catch(error=>{
      console.warn('[Strapi] projects content unavailable.',error);
      showProjectsUnavailable();
    });
}
