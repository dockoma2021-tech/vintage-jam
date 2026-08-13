(() => {
  'use strict';

  const headerInner = document.querySelector('.site-header-inner');
  const categories = document.getElementById('categories');
  const categoriesSection = document.getElementById('categoriesSection');
  const brand = document.querySelector('.brand');
  const actions = document.querySelector('.header-actions');
  const languageButton = document.getElementById('languageButton');
  if (!headerInner || !categories || !brand || !actions) return;

  if (!brand.querySelector('.brand-mark')) {
    brand.innerHTML = '<span class="brand-mark" aria-hidden="true"><svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 2.7c1.5 0 2.8.8 3.5 2 1.4-.5 3-.2 4.1.9 1.1 1.1 1.4 2.7.9 4.1 1.2.7 2 2 2 3.5s-.8 2.8-2 3.5c.5 1.4.2 3-.9 4.1-1.1 1.1-2.7 1.4-4.1.9-.7 1.2-2 2-3.5 2s-2.8-.8-3.5-2c-1.4.5-3 .2-4.1-.9-1.1-1.1-1.4-2.7-.9-4.1-1.2-.7-2-2-2-3.5s.8-2.8 2-3.5c-.5-1.4-.2-3 .9-4.1 1.1-1.1 2.7-1.4 4.1-.9.7-1.2 2-2 3.5-2Zm0 5.1a4.2 4.2 0 1 0 0 8.4 4.2 4.2 0 0 0 0-8.4Z"/></svg></span><span>Vintage Jam</span>';
  }

  const nav = document.createElement('nav');
  nav.className = 'header-category-nav';
  nav.setAttribute('aria-label', 'Категорії товарів');
  nav.append(categories);
  headerInner.insertBefore(nav, actions);

  if (categoriesSection) categoriesSection.hidden = true;

  const style = document.createElement('style');
  style.textContent = `
    .purchase-nav-link{display:inline-flex;align-items:center;justify-content:center;min-height:32px;padding:0 13px;border-radius:999px;background:#1d1d1f;color:#fff;text-decoration:none;font-size:11.5px;font-weight:620;letter-spacing:-.01em;white-space:nowrap;transition:transform .18s ease,background .18s ease,box-shadow .18s ease}
    .purchase-nav-link:hover{background:#000;box-shadow:0 5px 14px rgba(0,0,0,.14)}
    .purchase-nav-link:active{transform:scale(.97)}
    @media(max-width:760px){.purchase-nav-link{min-height:30px;padding:0 11px;font-size:11px}}
    @media(max-width:390px){.purchase-nav-link{padding:0 9px;font-size:10.5px}}
  `;
  document.head.append(style);

  const purchaseLink = document.createElement('a');
  purchaseLink.className = 'purchase-nav-link';
  purchaseLink.href = 'purchase.html';
  purchaseLink.textContent = document.documentElement.lang === 'en' ? 'How to buy' : 'Як придбати';
  purchaseLink.setAttribute('aria-label', purchaseLink.textContent);
  if (languageButton) actions.insertBefore(purchaseLink, actions.firstChild);
  else actions.prepend(purchaseLink);

  const updatePurchaseLabel = () => {
    const english = document.documentElement.lang === 'en';
    purchaseLink.textContent = english ? 'How to buy' : 'Як придбати';
    purchaseLink.setAttribute('aria-label', purchaseLink.textContent);
  };
  languageButton?.addEventListener('click', () => requestAnimationFrame(updatePurchaseLabel));

  const ensureVisible = button => {
    if (!button) return;
    button.scrollIntoView({behavior:'smooth', block:'nearest', inline:'center'});
  };

  categories.addEventListener('click', event => {
    const button = event.target.closest('.category-button');
    if (button) requestAnimationFrame(() => ensureVisible(button));
  });

  const observer = new MutationObserver(() => {
    const active = categories.querySelector('.category-button.active');
    if (active) ensureVisible(active);
  });
  observer.observe(categories, {childList:true, subtree:true, attributes:true, attributeFilter:['class']});
})();

(() => {
  'use strict';
  const heroAsset = 'assets/images/categories/paintings-collage-v1.svg?v=3';
  const fallback = 'images/products/vj-000002/01.webp';

  const installStyle = () => {
    if (document.getElementById('paintingsHeroFix')) return;
    const style = document.createElement('style');
    style.id = 'paintingsHeroFix';
    style.textContent = `
      .paintings-showcase{min-height:clamp(570px,78vh,760px)!important}
      .paintings-showcase .showcase-card-visual{height:65%!important;padding:0 18px 8px!important}
      .paintings-showcase .showcase-card-visual:before{display:none!important}
      .paintings-showcase .showcase-card-image{content:normal!important;width:min(94vw,1100px)!important;max-width:none!important;max-height:100%!important;height:auto!important;object-fit:contain!important;filter:none!important}
      @media(max-width:700px){
        .paintings-showcase{min-height:570px!important}
        .paintings-showcase .showcase-card-inner{padding:36px 16px 0!important}
        .paintings-showcase .showcase-card-visual{height:auto!important;inset:auto 0 18px!important;padding:0 8px!important;display:block!important}
        .paintings-showcase .showcase-card-image{content:normal!important;width:100%!important;max-height:none!important;height:auto!important}
        .paintings-showcase .showcase-card p{font-size:17px!important}
        .paintings-showcase .showcase-card .showcase-action{margin-top:16px!important}
      }
    `;
    document.head.append(style);
  };

  const apply = () => {
    installStyle();
    const card = document.querySelector('.showcase-stack .showcase-card:first-child');
    if (!card) return;
    card.classList.add('paintings-showcase');
    const img = card.querySelector('.showcase-card-image');
    if (!img) return;
    if (!img.dataset.paintingsHero) {
      img.dataset.paintingsHero = '1';
      img.src = heroAsset;
      img.loading = 'eager';
      img.removeAttribute('srcset');
      img.onerror = function () {
        this.onerror = null;
        this.src = fallback;
      };
    }
  };

  window.addEventListener('DOMContentLoaded', () => {
    apply();
    document.getElementById('languageButton')?.addEventListener('click', () => setTimeout(apply, 0));
  });
})();
