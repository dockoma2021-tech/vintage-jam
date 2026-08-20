(() => {
  'use strict';

  const HERO = 'assets/images/categories/watches-category-final-v64.svg?v=6.7.0';

  function findWatchCard() {
    const data = window.VINTAGE_JAM_DATA;
    if (!data || !Array.isArray(data.categories) || !Array.isArray(data.products)) return null;
    const published = data.products.filter(p => p.publication_status === 'published');
    const used = data.categories.filter(c => published.some(p => p.category === c.id));
    const index = used.findIndex(c => c.id === 'watches');
    if (index < 0) return null;
    return document.querySelectorAll('.showcase-stack .showcase-card')[index] || null;
  }

  function ensureStyle() {
    let style = document.getElementById('vjWatchesRepair52Style');
    if (!style) {
      style = document.createElement('style');
      style.id = 'vjWatchesRepair52Style';
      document.head.append(style);
    }
    style.textContent = `
      .showcase-card.vj-watches-fixed52{min-height:auto!important;background:linear-gradient(180deg,#f4f6f9 0%,#e9eef5 54%,#f6f2ec 100%)!important}
      .showcase-card.vj-watches-fixed52 .showcase-card-inner{padding-bottom:0!important}
      .showcase-card.vj-watches-fixed52 .showcase-card-visual{position:relative!important;inset:auto!important;height:auto!important;width:100%!important;margin-top:24px!important;padding:0 16px 18px!important;display:flex!important;justify-content:center!important;align-items:center!important;pointer-events:auto!important}
      .showcase-card.vj-watches-fixed52 .showcase-card-visual:before{display:none!important}
      .vj-watches-final52{position:relative;display:block;width:min(96vw,1120px);max-width:100%;aspect-ratio:1672/941;border-radius:18px;overflow:hidden;box-shadow:0 24px 54px rgba(25,35,48,.14);cursor:pointer;background:#eef2f6}
      .vj-watches-final52 object{display:block;width:100%;height:100%;border:0;pointer-events:none;background:#eef2f6}
      .vj-watches-final52 .fallback{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:-1}
      @media(max-width:700px){
        .showcase-card.vj-watches-fixed52 .showcase-card-inner{padding:30px 0 0!important}
        .showcase-card.vj-watches-fixed52 .showcase-card-visual{margin-top:22px!important;padding:0 0 10px!important}
        .vj-watches-final52{width:100%;max-width:none;border-radius:0;box-shadow:none;aspect-ratio:1672/941}
      }
    `;
  }

  function apply() {
    const card = findWatchCard();
    const visual = card?.querySelector('.showcase-card-visual');
    if (!card || !visual) return;

    ensureStyle();
    card.classList.remove('has-vj-collage','has-custom-hero');
    card.classList.add('vj-watches-fixed52');

    const hero = document.createElement('div');
    hero.className = 'vj-watches-final52';
    hero.setAttribute('role','button');
    hero.setAttribute('tabindex','0');
    hero.setAttribute('aria-label', document.documentElement.lang === 'en' ? 'Open Watches category' : 'Відкрити категорію Годинники');

    const fallback = document.createElement('img');
    fallback.className = 'fallback';
    fallback.src = 'images/products/vj-000001/01.webp';
    fallback.alt = '';

    const object = document.createElement('object');
    object.type = 'image/svg+xml';
    object.data = HERO;
    object.setAttribute('aria-hidden','true');

    hero.append(fallback, object);

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
