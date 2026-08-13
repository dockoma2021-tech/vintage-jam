(() => {
  'use strict';
  const data = window.VINTAGE_JAM_DATA;
  if (!data || !Array.isArray(data.categories) || !Array.isArray(data.products)) return;
  const byId = id => document.getElementById(id);
  const localize = value => {
    const lang = document.documentElement.lang === 'en' ? 'en' : 'uk';
    return value && typeof value === 'object' ? (value[lang] || value.uk || value.en || '') : (value || '');
  };
  const copy = {
    uk: {
      kicker:'VINTAGE JAM · ODESA', title:'Речі з історією.', lead:'Мистецтво, колекційні предмети та вінтажні знахідки — зібрані за категоріями.', all:'Усі предмети', explore:'Дивитися', collection:'Колекція', newTitle:'Нові надходження', newText:'Останні предмети, додані до каталогу.', newButton:'Переглянути новинки', soldTitle:'Архів Vintage Jam', soldText:'Предмети, які вже знайшли нових власників.', soldButton:'Переглянути продані', catalog:'Каталог', back:'До категорій'
    },
    en: {
      kicker:'VINTAGE JAM · ODESA', title:'Objects with a story.', lead:'Art, collectibles and vintage finds — curated by category.', all:'View all objects', explore:'Explore', collection:'Collection', newTitle:'New arrivals', newText:'The latest objects added to the catalogue.', newButton:'View new arrivals', soldTitle:'Vintage Jam archive', soldText:'Objects that have already found new owners.', soldButton:'View sold items', catalog:'Catalog', back:'Back to categories'
    }
  };
  const descriptions = {
    paintings:{uk:'Живопис, графіка та авторські роботи.',en:'Paintings, graphics and original works.'},
    art_objects:{uk:'Скульптура, декоративне мистецтво та незвичайні форми.',en:'Sculpture, decorative art and unusual forms.'},
    icons:{uk:'Сакральне мистецтво та ікони різних періодів.',en:'Sacred art and icons from different periods.'},
    watches:{uk:'Механічні та вінтажні годинники з характером.',en:'Mechanical and vintage watches with character.'},
    knives:{uk:'Колекційні ножі та історичні предмети.',en:'Collectible knives and historical objects.'},
    daggers:{uk:'Колекційні кортики та предмети історії.',en:'Collectible daggers and historical pieces.'},
    orders_medals:{uk:'Нагороди, знаки та фалеристика.',en:'Awards, badges and phaleristics.'},
    silver:{uk:'Срібло, прикраси та предмети сервірування.',en:'Silver, jewellery and tableware.'},
    coins:{uk:'Монети та нумізматичні знахідки.',en:'Coins and numismatic finds.'},
    books:{uk:'Видання з історією, графікою та характером.',en:'Books with history, graphics and character.'},
    porcelain:{uk:'Порцеляна, кераміка та декоративна пластика.',en:'Porcelain, ceramics and decorative sculpture.'},
    electronics:{uk:'Вінтажна техніка та аудіоелектроніка.',en:'Vintage technology and audio electronics.'},
    misc:{uk:'Предмети, що не вкладаються в одну категорію.',en:'Objects that do not fit a single category.'}
  };
  const palettes = [
    ['#eef6ff','#1d1d1f','#6e6e73'],['#f4f0ea','#1d1d1f','#746b62'],['#eff4ef','#1d1d1f','#687268'],['#f5f5f7','#1d1d1f','#6e6e73'],['#eceff3','#1d1d1f','#68707a'],['#f4eee9','#1d1d1f','#7a6c61'],['#f2f0f5','#1d1d1f','#706b78'],['#eef2f2','#1d1d1f','#697273']
  ];
  function currentCopy(){ return copy[document.documentElement.lang === 'en' ? 'en' : 'uk']; }
  function usedCategories(){
    const published = data.products.filter(p => p.publication_status === 'published');
    const used = new Set(published.map(p => p.category));
    return data.categories.filter(c => used.has(c.id));
  }
  function categoryProduct(id){
    return data.products.filter(p => p.publication_status === 'published' && p.category === id && p.media?.images?.[0]).sort((a,b) => String(b.date_added||'').localeCompare(String(a.date_added||'')))[0] || null;
  }
  function categoryButton(category){
    const wanted = localize(category.title).trim();
    return [...document.querySelectorAll('#categories .category-button')].find(b => b.textContent.trim() === wanted) || null;
  }
  function openWorkspace(mode='catalog'){
    document.body.classList.add('vj-catalog-open');
    document.body.classList.toggle('vj-new-open', mode === 'new');
    document.body.classList.toggle('vj-sold-open', mode === 'sold');
    byId('catalogWorkspace')?.scrollIntoView({behavior:'smooth',block:'start'});
  }
  function openAll(){
    openWorkspace('catalog');
    document.querySelector('#categories .category-button')?.click();
  }
  function openCategory(category){
    openWorkspace('catalog');
    categoryButton(category)?.click();
  }
  function closeWorkspace(){
    document.body.classList.remove('vj-catalog-open','vj-new-open','vj-sold-open');
    document.querySelector('.category-showcase')?.scrollIntoView({behavior:'smooth',block:'start'});
  }
  function makeCard(category,index){
    const lang = document.documentElement.lang === 'en' ? 'en' : 'uk';
    const c = currentCopy();
    const product = categoryProduct(category.id);
    const image = product?.media?.images?.[0] || '';
    const p = palettes[index % palettes.length];
    const article = document.createElement('article');
    article.className = `showcase-card${image ? '' : ' no-image'}`;
    article.style.setProperty('--card-bg',p[0]); article.style.setProperty('--card-text',p[1]); article.style.setProperty('--card-muted',p[2]);
    article.innerHTML = `<div class="showcase-card-inner"><div class="showcase-card-copy"><div class="showcase-card-eyebrow">${c.collection}</div><h2>${localize(category.title)}</h2><p>${descriptions[category.id]?.[lang] || (lang==='uk'?'Вінтажні та колекційні предмети.':'Vintage and collectible objects.')}</p><button class="showcase-action" type="button">${c.explore}</button></div><div class="showcase-card-visual">${image ? `<img class="showcase-card-image" src="${image}" alt="" loading="lazy" decoding="async">` : ''}</div></div>`;
    article.querySelector('button').addEventListener('click',()=>openCategory(category));
    return article;
  }
  function renderShowcase(){
    const old = document.querySelector('.category-showcase'); if(old) old.remove();
    const c = currentCopy();
    const section = document.createElement('section'); section.className='category-showcase';
    section.innerHTML = `<div class="showcase-intro"><div class="showcase-intro-inner"><div class="showcase-kicker">${c.kicker}</div><h1>${c.title}</h1><p>${c.lead}</p><div class="showcase-actions"><button class="showcase-action" data-action="all" type="button">${c.all}</button></div></div></div><div class="showcase-stack"></div><div class="showcase-specials"><article class="showcase-special"><h2>${c.newTitle}</h2><p>${c.newText}</p><button class="showcase-action" data-action="new" type="button">${c.newButton}</button></article><article class="showcase-special dark"><h2>${c.soldTitle}</h2><p>${c.soldText}</p><button class="showcase-action secondary" data-action="sold" type="button">${c.soldButton}</button></article></div>`;
    const stack = section.querySelector('.showcase-stack'); usedCategories().forEach((cat,i)=>stack.append(makeCard(cat,i)));
    section.querySelector('[data-action="all"]').addEventListener('click',openAll);
    section.querySelector('[data-action="new"]').addEventListener('click',()=>openWorkspace('new'));
    section.querySelector('[data-action="sold"]').addEventListener('click',()=>openWorkspace('sold'));
    document.querySelector('main')?.prepend(section);
    const title = document.querySelector('.vj-catalog-shell-title'); if(title) title.textContent=c.catalog;
    const back = document.querySelector('.vj-back-showcase'); if(back) back.textContent=c.back;
  }
  function prepareWorkspace(){
    const container = document.querySelector('main > .container');
    if(!container || byId('catalogWorkspace')) return;
    const shell = document.createElement('div'); shell.id='catalogWorkspace'; shell.className='vj-catalog-shell';
    container.parentNode.insertBefore(shell,container); shell.append(container);
    const head=document.createElement('div'); head.className='vj-catalog-shell-close'; head.innerHTML='<strong class="vj-catalog-shell-title"></strong><button class="vj-back-showcase" type="button"></button>';
    container.prepend(head); head.querySelector('button').addEventListener('click',closeWorkspace);
  }
  document.body.classList.add('vj-showcase-home');
  prepareWorkspace(); renderShowcase();
  byId('languageButton')?.addEventListener('click',()=>requestAnimationFrame(renderShowcase));
  byId('mobileCatalog')?.addEventListener('click',()=>document.body.classList.add('vj-catalog-open'),true);
  byId('mobileSearch')?.addEventListener('click',()=>document.body.classList.add('vj-catalog-open'),true);
})();