const CMS_API=(import.meta.env.VITE_CMS_API_URL||'/wp-json/inad/v1').replace(/\/$/,'');
const CATEGORY_IDS=new Set(['btl','events','branding','print','publication','product-launch-event']);

const escapeHtml=value=>String(value||'').replace(/[&<>"']/g,char=>({
  '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;',
})[char]);

function caseCard({category,brand,folderLabel,brandLabel,title,image,alt,showInAll=false,itemIndex=0}){
  return `<article class="case-card" data-cat="${escapeHtml(category)}" data-brand="${escapeHtml(brand)}" data-folder-label="${escapeHtml(folderLabel)}" data-title="${escapeHtml(title)}" data-item-index="${itemIndex}"${showInAll?'':' data-all="false"'}>
    <div class="case-card__image">${image?`<img src="${escapeHtml(image)}" alt="${escapeHtml(alt||title)}" loading="lazy" decoding="async">`:''}<span class="case-card__tag">${escapeHtml(brandLabel||folderLabel)}</span></div>
    <div class="case-card__meta"><span>${escapeHtml(brandLabel||folderLabel)}</span><span>${escapeHtml(category.replaceAll('-',' '))}</span></div>
    <h3>${escapeHtml(title)}</h3>
  </article>`;
}

function renderProjects(brands=[]){
  const grid=document.getElementById('wGrid');
  const status=document.querySelector('.work-status');
  const fallback=document.querySelector('.work-fallback');
  if(!grid) return;
  const cards=[];
  brands.forEach(brand=>{
    if(!brand.slug||!CATEGORY_IDS.has(brand.category)) return;
    const folderLabel=brand.folderLabel||brand.name||brand.brandLabel||brand.slug;
    const brandLabel=brand.brandLabel||folderLabel;
    const items=Array.isArray(brand.items)?brand.items:[];
    const cover=brand.coverImage?.url||items[0]?.image?.url||'';
    if(items.length){
      items.forEach((item,index)=>cards.push(caseCard({
        category:brand.category,brand:brand.slug,folderLabel,brandLabel,
        title:item.title||brand.campaignTitle||folderLabel,image:item.image?.url||cover,
        alt:item.alt||item.title||brand.campaignTitle,showInAll:Boolean(brand.showInAll)&&index===0,itemIndex:index,
      })));
    }else{
      cards.push(caseCard({category:brand.category,brand:brand.slug,folderLabel,brandLabel,title:brand.campaignTitle||folderLabel,image:cover,alt:brand.campaignTitle||folderLabel,showInAll:Boolean(brand.showInAll)}));
    }
  });
  if(!cards.length){
    status.hidden=true;
    fallback.hidden=false;
    return;
  }
  grid.innerHTML=cards.join('');
  status.hidden=true;
  fallback.hidden=true;
  document.dispatchEvent(new CustomEvent('inad:projects-hydrated',{detail:{root:grid}}));
}

export async function initCmsContent(){
  try{
    const response=await fetch(`${CMS_API}/content`,{headers:{Accept:'application/json'}});
    if(!response.ok) throw new Error(`CMS request failed with ${response.status}`);
    const content=await response.json();
    renderProjects(content.projectBrands);
  }catch(error){
    console.warn('[CMS] Project content unavailable.',error);
    document.querySelector('.work-status')?.setAttribute('hidden','');
    document.querySelector('.work-fallback')?.removeAttribute('hidden');
  }
}
