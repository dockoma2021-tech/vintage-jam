(() => {
  'use strict';

  const data = window.VINTAGE_JAM_DATA;
  if (!data || !Array.isArray(data.categories) || !Array.isArray(data.products)) return;

  const allowedCategoryIds = new Set([
    'paintings','art_objects','icons','watches','orders_medals',
    'silver','coins','books','porcelain','electronics','miscellaneous'
  ]);

  const customHeroImages = {
    icons: 'assets/images/categories/icons-category-v1.jpg?v=1'
  };

  const published = data.products.filter(p => p.publication_status === 'published');
  const usedCategories = data.categories.filter(c => published.some(p => p.category === c.id));

  function collectImages(categoryId) {
    const products = published
      .filter(p => p.category === categoryId && Array.isArray(p.media?.images) && p.media.images.length)
      .sort((a,b) => String(b.date_added || '').localeCompare(String(a.date_added || '')));

    const images = [];
    for (const product of products) {
      const first = product.media.images[0];
      if (first && !images.includes(first)) images.push(first);
      if (images.length >= 4) break;
    }
    if (images.length < 3 && products[0]) {
      for (const image of products[0].media.images.slice(1)) {
        if (image && !images.includes(image)) images.push(image);
        if (images.length >= 4) break;
      }
    }
    return images.slice(0, 4);
  }

  function installStyles() {
    if (document.getElementById('vjCategoryCollageStyles')) return;
    const style = document.createElement('style');
    style.id = 'vjCategoryCollageStyles';
    style.textContent = `
      .vj-category-collage{position:relative;width:min(92vw,980px);height:min(38vw,390px);margin:0 auto;cursor:pointer}
      .vj-category-collage .vj-collage-item{position:absolute;display:block;overflow:hidden;border-radius:14px;background:#fff;box-shadow:0 18px 42px rgba(0,0,0,.14);border:1px solid rgba(0,0,0,.06)}
      .vj-category-collage .vj-collage-item img{display:block;width:100%;height:100%;object-fit:contain;background:#fff}
      .vj-category-collage.count-1 .vj-collage-item:nth-child(1){inset:0 12%}
      .vj-category-collage.count-2 .vj-collage-item:nth-child(1){left:8%;top:10%;width:48%;height:82%;transform:rotate(-3deg)}
      .vj-category-collage.count-2 .vj-collage-item:nth-child(2){right:8%;top:5%;width:48%;height:86%;transform:rotate(3deg)}
      .vj-category-collage.count-3 .vj-collage-item:nth-child(1){left:4%;top:17%;width:35%;height:70%;transform:rotate(-4deg)}
      .vj-category-collage.count-3 .vj-collage-item:nth-child(2){left:32%;top:2%;width:36%;height:88%;z-index:3}
      .vj-category-collage.count-3 .vj-collage-item:nth-child(3){right:4%;top:18%;width:35%;height:69%;transform:rotate(4deg)}
      .vj-category-collage.count-4 .vj-collage-item:nth-child(1){left:2%;top:20%;width:30%;height:66%;transform:rotate(-5deg)}
      .vj-category-collage.count-4 .vj-collage-item:nth-child(2){left:24%;top:6%;width:31%;height:78%;transform:rotate(-1.5deg);z-index:2}
      .vj-category-collage.count-4 .vj-collage-item:nth-child(3){right:24%;top:5%;width:31%;height:80%;transform:rotate(1.5deg);z-index:3}
      .vj-category-collage.count-4 .vj-collage-item:nth-child(4){right:2%;top:20%;width:30%;height:66%;transform:rotate(5deg)}
      .showcase-card.has-vj-collage .showcase-card-visual{height:58%;padding-bottom:12px}
      .showcase-card.has-vj-collage .showcase-card-visual:before{display:none}
      .vj-category-hero-image{display:block;width:min(92vw,1100px);height:auto;max-height:430px;object-fit:contain;margin:0 auto;cursor:pointer;border:0;filter:none}
      .showcase-card.has-custom-hero .showcase-card-visual{height:58%;padding:0 12px 10px;display:flex;align-items:flex-end;justify-content:center}
      .showcase-card.has-custom-hero .showcase-card-visual:before{display:none}
      @media(max-width:700px){
        .showcase-card.has-vj-collage,.showcase-card.has-custom-hero{min-height:auto!important}
        .showcase-card.has-vj-collage .showcase-card-inner,.showcase-card.has-custom-hero .showcase-card-inner{padding-bottom:14px}
        .showcase-card.has-vj-collage .showcase-card-visual,.showcase-card.has-custom-hero .showcase-card-visual{position:relative!important;inset:auto!important;height:auto!important;width:100%!important;margin-top:24px!important;padding:0 8px!important;display:block!important}
        .vj-category-collage{width:100%;height:58vw;max-height:330px;min-height:230px}
        .vj-category-collage .vj-collage-item{border-radius:10px;box-shadow:0 12px 28px rgba(0,0,0,.13)}
        .vj-category-hero-image{width:100%;max-width:100%;max-height:none;height:auto;margin:0 auto}
      }
    `;
    document.head.append(style);
  }

  function bindOpen(element, card) {
    const open = () => card.querySelector('.showcase-action')?.click();
    element.setAttribute('role','button');
    element.setAttribute('tabindex','0');
    element.addEventListener('click', open);
    element.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        open();
      }
    });
  }

  function activateCard(card, category) {
    if (!card || !allowedCategoryIds.has(category.id) || category.id === 'paintings') return;

    const visual = card.querySelector('.showcase-card-visual');
    if (!visual) return;

    if (customHeroImages[category.id]) {
      card.classList.remove('has-vj-collage');
      card.classList.add('has-custom-hero');
      const img = document.createElement('img');
      img.className = 'vj-category-hero-image';
      img.src = customHeroImages[category.id];
      img.alt = '';
      img.loading = 'lazy';
      img.decoding = 'async';
      visual.replaceChildren(img);
      bindOpen(img, card);
      return;
    }

    const images = collectImages(category.id);
    if (!images.length) return;

    card.classList.add('has-vj-collage');
    const collage = document.createElement('div');
    collage.className = `vj-category-collage count-${images.length}`;

    images.forEach(src => {
      const item = document.createElement('span');
      item.className = 'vj-collage-item';
      const img = document.createElement('img');
      img.src = src;
      img.alt = '';
      img.loading = 'lazy';
      img.decoding = 'async';
      item.append(img);
      collage.append(item);
    });

    visual.replaceChildren(collage);
    bindOpen(collage, card);
  }

  function apply() {
    installStyles();
    const cards = [...document.querySelectorAll('.showcase-stack .showcase-card')];
    if (!cards.length) return;
    usedCategories.forEach((category, index) => activateCard(cards[index], category));
  }

  const run = () => requestAnimationFrame(() => requestAnimationFrame(apply));
  window.addEventListener('DOMContentLoaded', run);
  document.getElementById('languageButton')?.addEventListener('click', () => setTimeout(run, 0));
})();
