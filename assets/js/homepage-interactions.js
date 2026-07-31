(() => {
  'use strict';

  const byId = id => document.getElementById(id);
  const fallback = window.VINTAGE_JAM_FALLBACK || { products: [], categories: [] };
  let selectedCategory = null;
  let searchQuery = '';

  function productIdFromCard(card) {
    const href = card?.querySelector('.product-card-link')?.getAttribute('href') || '';
    try { return new URL(href, location.href).searchParams.get('id'); }
    catch { return null; }
  }

  function productForCard(card) {
    const id = productIdFromCard(card);
    return fallback.products.find(item => item.id === id) || null;
  }

  function applyFilters() {
    const cards = Array.from(document.querySelectorAll('#catalog .product-card'));
    cards.forEach(card => {
      const product = productForCard(card);
      const text = card.textContent.toLowerCase();
      const categoryMatch = !selectedCategory || product?.category === selectedCategory;
      const searchMatch = !searchQuery || text.includes(searchQuery);
      card.hidden = !(categoryMatch && searchMatch);
    });
  }

  function sortCatalog(value) {
    const container = byId('catalog');
    if (!container) return;
    const cards = Array.from(container.querySelectorAll('.product-card'));
    const dateValue = card => new Date(productForCard(card)?.date_added || 0).getTime() || 0;
    const priceValue = card => {
      const product = productForCard(card);
      return product?.price?.type === 'fixed' && Number.isFinite(Number(product.price.value))
        ? Number(product.price.value)
        : Number.POSITIVE_INFINITY;
    };
    cards.sort((a, b) => {
      if (value === 'old') return dateValue(a) - dateValue(b);
      if (value === 'price_up') return priceValue(a) - priceValue(b);
      if (value === 'price_down') return priceValue(b) - priceValue(a);
      return dateValue(b) - dateValue(a);
    });
    cards.forEach(card => container.append(card));
    applyFilters();
  }

  document.addEventListener('click', event => {
    const language = event.target.closest('#languageSwitcher');
    if (language) {
      event.preventDefault();
      event.stopImmediatePropagation();
      const next = document.documentElement.lang === 'en' ? 'uk' : 'en';
      localStorage.setItem('language', next);
      const url = new URL(location.href);
      url.searchParams.set('lang', next);
      url.searchParams.set('reload', Date.now().toString());
      location.assign(url.toString());
      return;
    }

    const categoryButton = event.target.closest('#categories .category-item');
    if (categoryButton) {
      event.preventDefault();
      event.stopImmediatePropagation();
      const buttons = Array.from(document.querySelectorAll('#categories .category-item'));
      const index = buttons.indexOf(categoryButton);
      selectedCategory = index <= 0 ? null : fallback.categories[index - 1]?.id || null;
      buttons.forEach(button => button.classList.toggle('active', button === categoryButton));
      applyFilters();
      byId('catalogSection')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    const catalogButton = event.target.closest('#mobileCatalogButton');
    if (catalogButton) {
      event.preventDefault();
      byId('catalogSection')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    const searchButton = event.target.closest('#mobileSearchButton');
    if (searchButton) {
      event.preventDefault();
      const input = byId('searchInput');
      input?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => input?.focus(), 250);
      return;
    }

    const productLink = event.target.closest('.product-card-link');
    if (productLink) {
      event.preventDefault();
      event.stopImmediatePropagation();
      location.assign(productLink.href);
    }
  }, true);

  byId('searchInput')?.addEventListener('input', event => {
    searchQuery = String(event.target.value || '').trim().toLowerCase();
    applyFilters();
  }, true);

  byId('sortSelect')?.addEventListener('change', event => {
    sortCatalog(event.target.value);
  }, true);

  document.documentElement.classList.add('homepage-interactions-ready');
})();
