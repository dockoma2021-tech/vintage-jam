(() => {
  'use strict';

  const HERO_SVG = 'assets/images/categories/watches-category-final-v64.svg?v=6.6.0';
  let objectUrl = '';

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
      .vj-watches-final52{display:block;width:min(96vw,1120px);max-width:100%;height:auto;aspect-ratio:1672/941;object-fit:cover;border-radius:18px;box-shadow:0 24px 54px rgba(25,35,48,.14);cursor:pointer;background:#eef2f6}
      @media(max-width:700px){
        .showcase-card.vj-watches-fixed52 .showcase-card-inner{padding:30px 0 0!important}
        .showcase-card.vj-watches-fixed52 .showcase-card-visual{margin-top:22px!important;padding:0 0 10px!important}
        .vj-watches-final52{width:100%;max-width:none;border-radius:0;box-shadow:none;aspect-ratio:1672/941;object-fit:cover}
      }
    `;
  }

  async function getHeroObjectUrl() {
    const response = await fetch(HERO_SVG, { cache: 'no-store' });
    if (!response.ok) throw new Error(`hero fetch ${response.status}`);
    const svgText = await response.text();
    const match = svgText.match(/data:image\/jpeg;base64,([^\"']+)/i);
    if (!match || !match[1]) throw new Error('embedded jpeg not found');

    const binary = atob(match[1].replace(/\s/g, ''));
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);

    if (objectUrl) URL.revokeObjectURL(objectUrl);
    objectUrl = URL.createObjectURL(new Blob([bytes], { type: 'image/jpeg' }));
    return objectUrl;
  }

  function bindOpen(img, card) {
    const open = () => card.querySelector('.showcase-action')?.click();
    img.addEventListener('click', open);
    img.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        open();
      }
    });
  }

  async function apply() {
    const card = findWatchCard();
    const visual = card?.querySelector('.showcase-card-visual');
    if (!card || !visual) return;

    ensureStyle();
    card.classList.remove('has-vj-collage','has-custom-hero');
    card.classList.add('vj-watches-fixed52');

    const img = document.createElement('img');
    img.className = 'vj-watches-final52';
    img.alt = '';
    img.loading = 'eager';
    img.decoding = 'async';
    img.setAttribute('role','button');
    img.setAttribute('tabindex','0');
    bindOpen(img, card);
    visual.replaceChildren(img);

    try {
      img.src = await getHeroObjectUrl();
    } catch (error) {
      console.warn('Vintage Jam watches hero fallback:', error);
      img.src = 'images/products/vj-000001/01.webp';
    }
  }

  const run = () => requestAnimationFrame(() => requestAnimationFrame(() => { apply(); }));
  window.addEventListener('DOMContentLoaded', run);
  window.addEventListener('load', run);
  document.getElementById('languageButton')?.addEventListener('click', () => setTimeout(run, 100));
})();
