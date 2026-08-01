(() => {
  'use strict';
  const data = window.VINTAGE_JAM_DATA || {};
  const byId = id => document.getElementById(id);

  function publishedProducts() {
    return Array.isArray(data.products) ? data.products.filter(p => p.publication_status === 'published') : [];
  }

  function hideEmptyCategories() {
    const used = new Set(publishedProducts().map(p => p.category).filter(Boolean));
    const container = byId('categories');
    if (!container) return;
    [...container.querySelectorAll('.category-button')].forEach((button, index) => {
      if (index === 0) return;
      const category = Array.isArray(data.categories)
        ? data.categories.find(item => {
            const title = item?.title || {};
            return button.textContent.trim() === String(title.uk || '').trim() || button.textContent.trim() === String(title.en || '').trim();
          })
        : null;
      if (category && !used.has(category.id)) button.remove();
    });
  }

  const icons = {
    origin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" d="M12 21s6-5.2 6-11a6 6 0 1 0-12 0c0 5.8 6 11 6 11Z"/><circle cx="12" cy="10" r="2.2" fill="currentColor"/></svg>',
    world: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M3 12h18M12 3c2.5 2.5 3.7 5.5 3.7 9S14.5 18.5 12 21c-2.5-2.5-3.7-5.5-3.7-9S9.5 5.5 12 3Z" fill="none" stroke="currentColor" stroke-width="1.7"/></svg>',
    box: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 7 8-4 8 4-8 4-8-4Zm0 0v10l8 4 8-4V7M12 11v10" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>'
  };

  function renderShippingLink() {
    const section = byId('shippingSection');
    if (!section) return;
    const en = document.documentElement.lang === 'en';
    section.className = 'shipping-ribbon';
    section.innerHTML = `<a class="shipping-link" href="shipping.html" aria-label="${en ? 'Shipping and purchase terms' : 'Умови доставки та покупки'}">
      <span class="shipping-mini">${icons.origin}<span>${en ? 'From Odesa' : 'З Одеси'}</span></span>
      <span class="shipping-mini">${icons.world}<span>${en ? 'Ukraine & worldwide' : 'Україна та весь світ'}</span></span>
      <span class="shipping-mini">${icons.box}<span>${en ? 'Secure packaging' : 'Надійне пакування'}</span></span>
      <span class="shipping-arrow" aria-hidden="true">›</span>
    </a>`;
  }

  function removeFavorites() {
    document.querySelectorAll('.favorite-button').forEach(el => el.remove());
    byId('mobileFavorites')?.remove();
  }

  function refresh() {
    hideEmptyCategories();
    renderShippingLink();
    removeFavorites();
  }

  requestAnimationFrame(refresh);
  const observer = new MutationObserver(() => {
    hideEmptyCategories();
    removeFavorites();
  });
  const categories = byId('categories');
  const grids = document.querySelectorAll('.product-grid');
  if (categories) observer.observe(categories, {childList:true});
  grids.forEach(grid => observer.observe(grid, {childList:true, subtree:true}));
  byId('languageButton')?.addEventListener('click', () => requestAnimationFrame(refresh));
})();