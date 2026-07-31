(() => {
'use strict';
const data=window.VINTAGE_JAM_FALLBACK||{products:[],categories:[]};
const byId=id=>document.getElementById(id);
let lang=localStorage.getItem('language')==='en'?'en':'uk';
let index=0;
const id=new URLSearchParams(location.search).get('id');
const product=(data.products||[]).find(p=>p.id===id);
const category=(data.categories||[]).find(c=>c.id===product?.category);
const local=v=>v&&typeof v==='object'?(v[lang]||v.uk||v.en||''):(v||'');
function price(){if(product?.price?.type!=='fixed')return lang==='uk'?'Ціна за запитом':'Price on request';const n=Number(product.price.value);try{return new Intl.NumberFormat(lang==='uk'?'uk-UA':'en-US',{style:'currency',currency:product.price.currency||'UAH',maximumFractionDigits:0}).format(n)}catch{return `${n} ${product.price.currency||'UAH'}`}}
function images(){return product?.media?.images?.length?product.media.images:['assets/images/no-image.webp']}
function showImage(){const list=images();index=(index+list.length)%list.length;const img=byId('mainProductImage');img.src=list[index];img.alt=local(product.title);byId('galleryCounter').textContent=`${index+1} / ${list.length}`;document.querySelectorAll('.gallery-thumbnail').forEach((b,i)=>b.classList.toggle('active',i===index));}
function renderThumbs(){const box=byId('galleryThumbnails');box.replaceChildren();images().forEach((src,i)=>{const b=document.createElement('button');b.type='button';b.className='gallery-thumbnail';const im=document.createElement('img');im.src=src;im.alt='';b.append(im);b.onclick=()=>{index=i;showImage()};box.append(b)});}
function renderAttributes(){const dl=byId('attributes');dl.replaceChildren();const labels={brand:['Бренд','Brand'],model:['Модель','Model'],year:['Рік','Year'],country:['Країна','Country'],movement:['Механізм','Movement'],artist:['Художник','Artist'],material:['Матеріал','Material'],dimensions:['Розмір','Dimensions'],condition:['Стан','Condition'],signature:['Підпис','Signature']};Object.entries(product.attributes||{}).forEach(([k,v])=>{const dt=document.createElement('dt');const dd=document.createElement('dd');dt.textContent=labels[k]?.[lang==='uk'?0:1]||k;dd.textContent=local(v);dl.append(dt,dd)});byId('attributesSection').hidden=!dl.children.length;}
function labels(){document.documentElement.lang=lang;byId('languageSwitcher').textContent=lang.toUpperCase();byId('backLink').textContent=lang==='uk'?'← До каталогу':'← Back to catalog';byId('descriptionHeading').textContent=lang==='uk'?'Опис':'Description';byId('attributesHeading').textContent=lang==='uk'?'Характеристики':'Details';byId('storyHeading').textContent=lang==='uk'?'Історія предмета':'Item story';byId('contactButtonText').textContent=lang==='uk'?'Зв’язатися':'Contact';}
function render(){if(!product){byId('productStateMessage').textContent=lang==='uk'?'Товар не знайдено':'Product not found';return;}labels();byId('productCategory').textContent=local(category?.title)||product.category;byId('productTitle').textContent=local(product.title);byId('productShortDescription').textContent=local(product.short_description);byId('productPrice').textContent=price();byId('productDescription').textContent=local(product.description);const story=local(product.story);byId('productStory').textContent=story;byId('storySection').hidden=!story;renderAttributes();renderThumbs();showImage();byId('productState').hidden=true;byId('productPage').hidden=false;document.title=`${local(product.title)} — Vintage Jam`;}
byId('galleryPrevious')?.addEventListener('click',()=>{index--;showImage()});
byId('galleryNext')?.addEventListener('click',()=>{index++;showImage()});
byId('languageSwitcher')?.addEventListener('click',()=>{lang=lang==='uk'?'en':'uk';localStorage.setItem('language',lang);render()});
byId('contactButton')?.addEventListener('click',e=>{e.preventDefault();location.href='tel:+380983219801'});
render();
})();