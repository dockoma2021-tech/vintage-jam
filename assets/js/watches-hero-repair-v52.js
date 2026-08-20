(() => {
  'use strict';

  function findWatchCard() {
    const data = window.VINTAGE_JAM_DATA;
    if (!data || !Array.isArray(data.categories) || !Array.isArray(data.products)) return null;
    const published = data.products.filter(p => p.publication_status === 'published');
    const used = data.categories.filter(c => published.some(p => p.category === c.id));
    const index = used.findIndex(c => c.id === 'watches');
    if (index < 0) return null;
    return document.querySelectorAll('.showcase-stack .showcase-card')[index] || null;
  }

  function watchImages() {
    const data = window.VINTAGE_JAM_DATA;
    if (!data || !Array.isArray(data.products)) return [];
    const products = data.products
      .filter(p => p.publication_status === 'published' && p.category === 'watches' && Array.isArray(p.media?.images) && p.media.images.length)
      .sort((a,b) => String(b.date_added || '').localeCompare(String(a.date_added || '')));

    const out = [];
    for (const p of products) {
      for (const src of p.media.images.slice(0,2)) {
        if (src && !out.includes(src)) out.push(src);
        if (out.length >= 5) return out;
      }
    }
    return out;
  }

  function ensureStyle() {
    let style = document.getElementById('vjWatchesRepair52Style');
    if (!style) {
      style = document.createElement('style');
      style.id = 'vjWatchesRepair52Style';
      document.head.append(style);
    }
    style.textContent = `
      .showcase-card.vj-watches-fixed52{min-height:auto!important;background:linear-gradient(180deg,#f5f7fa 0%,#edf1f6 52%,#f7f4ef 100%)!important}
      .showcase-card.vj-watches-fixed52 .showcase-card-inner{padding-bottom:12px!important}
      .showcase-card.vj-watches-fixed52 .showcase-card-visual{position:relative!important;inset:auto!important;height:auto!important;width:100%!important;margin-top:24px!important;padding:0 14px 18px!important;display:block!important}
      .showcase-card.vj-watches-fixed52 .showcase-card-visual:before{display:none!important}
      .vj-watches-hero52{position:relative;width:min(92vw,1000px);height:min(42vw,430px);margin:0 auto;cursor:pointer}
      .vj-watches-hero52 .w52{position:absolute;display:block;overflow:hidden;background:#f8f8f8;border-radius:22px;box-shadow:0 22px 48px rgba(25,35,48,.14);border:1px solid rgba(0,0,0,.045)}
      .vj-watches-hero52 img{width:100%;height:100%;object-fit:contain;display:block;background:linear-gradient(180deg,#fafafa,#f1f3f5)}
      .vj-watches-hero52 .w52:nth-child(1){left:0;top:18%;width:30%;height:66%;transform:rotate(-4deg)}
      .vj-watches-hero52 .w52:nth-child(2){left:22%;top:3%;width:31%;height:82%;transform:rotate(-1deg);z-index:2}
      .vj-watches-hero52 .w52:nth-child(3){right:22%;top:4%;width:31%;height:80%;transform:rotate(1deg);z-index:3}
      .vj-watches-hero52 .w52:nth-child(4){right:0;top:18%;width:30%;height:66%;transform:rotate(4deg)}
      .vj-watches-hero52 .w52:nth-child(5){left:35%;bottom:0;width:30%;height:50%;z-index:4;transform:translateY(7%)}
      @media(max-width:700px){
        .showcase-card.vj-watches-fixed52 .showcase-card-inner{padding-bottom:8px!important}
        .showcase-card.vj-watches-fixed52 .showcase-card-visual{margin-top:20px!important;padding:0 8px 8px!important}
        .vj-watches-hero52{width:100%;height:64vw;min-height:250px;max-height:340px}
        .vj-watches-hero52 .w52{border-radius:14px;box-shadow:0 12px 28px rgba(25,35,48,.13)}
      }
    `;
  }

  function apply() {
    const card = findWatchCard();
    const visual = card?.querySelector('.showcase-card-visual');
    const images = watchImages();
    if (!card || !visual || !images.length) return;

    ensureStyle();
    card.classList.remove('has-vj-collage','has-custom-hero');
    card.classList.add('vj-watches-fixed52');

    const hero = document.createElement('div');
    hero.className = 'vj-watches-hero52';
    hero.setAttribute('role','button');
    hero.setAttribute('tabindex','0');

    images.slice(0,5).forEach(src => {
      const item = document.createElement('span');
      item.className = 'w52';
      const img = document.createElement('img');
      img.src = src;
      img.alt = '';
      img.loading = 'eager';
      img.decoding = 'async';
      img.onerror = () => item.remove();
      item.append(img);
      hero.append(item);
    });

    const open = () => card.querySelector('.showcase-action')?.click();
    hero.addEventListener('click', open);
    hero.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        open();
      }
    });

    visual.replaceChildren(hero);
  }

  const run = () => requestAnimationFrame(() => requestAnimationFrame(apply));
  window.addEventListener('DOMContentLoaded', run);
  window.addEventListener('load', run);
  document.getElementById('languageButton')?.addEventListener('click', () => setTimeout(run, 80));
})();
