(() => {
  'use strict';

  const data = window.VINTAGE_JAM_DATA;
  if (!data || !Array.isArray(data.categories) || !Array.isArray(data.products)) return;

  const restricted = new Set(['daggers']);
  const informational = new Set(['knives']);
  let internalCategoryClick = false;

  const titleMatches = (category, text) => {
    const normalized = String(text || '').trim();
    return normalized === String(category?.title?.uk || '').trim()
      || normalized === String(category?.title?.en || '').trim();
  };

  const categoryIdFromButton = button => {
    if (!button) return null;
    if (button.dataset.categoryId) return button.dataset.categoryId;
    const container = document.getElementById('categories');
    if (container && button === container.querySelector('.category-button')) return 'all';
    return data.categories.find(category => titleMatches(category, button.textContent))?.id || null;
  };

  const findCategoryButton = id => {
    const buttons = [...document.querySelectorAll('#categories .category-button')];
    if (id === 'all') return buttons.find(button => button.dataset.categoryId === 'all') || buttons[0] || null;
    return buttons.find(button => button.dataset.categoryId === id)
      || buttons.find(button => titleMatches(data.categories.find(category => category.id === id), button.textContent))
      || null;
  };

  const updateUrl = (category = 'all', replace = false) => {
    const url = new URL(window.location.href);
    url.searchParams.set('view', 'catalog');
    if (category && category !== 'all') url.searchParams.set('category', category);
    else url.searchParams.delete('category');
    history[replace ? 'replaceState' : 'pushState']({ view: 'catalog', category }, '', url);
  };

  const clearCatalogUrl = (replace = false) => {
    const url = new URL(window.location.href);
    url.searchParams.delete('view');
    url.searchParams.delete('category');
    history[replace ? 'replaceState' : 'pushState']({ view: 'showcase' }, '', url);
  };

  const showCatalogView = (category = 'all', { push = true } = {}) => {
    if (restricted.has(category)) return false;
    document.body.classList.add('vj-catalog-open');
    document.body.classList.remove('vj-new-open', 'vj-sold-open');
    if (push) updateUrl(category, false);
    requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: 'auto' }));
    return true;
  };

  const showShowcaseView = ({ push = true } = {}) => {
    document.body.classList.remove('vj-catalog-open', 'vj-new-open', 'vj-sold-open');
    if (push) clearCatalogUrl(false);
    requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: 'auto' }));
  };

  const selectCategory = (id, { push = true } = {}) => {
    if (!showCatalogView(id, { push })) return;
    const button = findCategoryButton(id);
    if (!button) return;
    internalCategoryClick = true;
    button.click();
    internalCategoryClick = false;
  };

  const markCategoryUi = () => {
    document.querySelectorAll('#categories .category-button').forEach(button => {
      const id = categoryIdFromButton(button);
      if (id) button.dataset.categoryId = id;
      if (restricted.has(id)) button.dataset.vjRestricted = '1';
      else delete button.dataset.vjRestricted;
      if (informational.has(id)) button.dataset.vjInformational = '1';
      else delete button.dataset.vjInformational;
    });

    document.querySelectorAll('.showcase-stack .showcase-card').forEach(card => {
      const id = card.dataset.categoryId;
      if (restricted.has(id)) card.dataset.vjRestricted = '1';
      else delete card.dataset.vjRestricted;
      if (informational.has(id)) card.dataset.vjInformational = '1';
      else delete card.dataset.vjInformational;
    });
  };

  const hideRestrictedProducts = () => {
    const restrictedTitles = new Set();
    data.categories.filter(category => restricted.has(category.id)).forEach(category => {
      if (category.title?.uk) restrictedTitles.add(String(category.title.uk).trim());
      if (category.title?.en) restrictedTitles.add(String(category.title.en).trim());
    });
    document.querySelectorAll('.product-card').forEach(card => {
      const category = card.querySelector('.product-category')?.textContent?.trim();
      card.hidden = restrictedTitles.has(category);
    });
  };

  const markInformationalUi = () => {
    const lang = document.documentElement.lang === 'en' ? 'en' : 'uk';
    const archiveLabel = lang === 'en' ? 'Archive · information only' : 'Архів · інформаційний перегляд';
    const heroText = lang === 'en'
      ? 'Archive and reference materials about collectible knives. Not offered for sale on this site.'
      : 'Архівні та довідкові матеріали про колекційні ножі. Продаж через сайт не пропонується.';
    const heroEyebrow = lang === 'en' ? 'Archive' : 'Архів';
    const heroAction = lang === 'en' ? 'View archive' : 'Переглянути архів';
    const informationalTitles = new Set();

    data.categories.filter(category => informational.has(category.id)).forEach(category => {
      if (category.title?.uk) informationalTitles.add(String(category.title.uk).trim());
      if (category.title?.en) informationalTitles.add(String(category.title.en).trim());
    });

    document.querySelectorAll('.product-card').forEach(card => {
      const category = card.querySelector('.product-category')?.textContent?.trim();
      const isInformational = informationalTitles.has(category);
      if (!isInformational) {
        delete card.dataset.vjInformational;
        return;
      }
      card.dataset.vjInformational = '1';
      const price = card.querySelector('.product-price');
      if (price && price.textContent !== archiveLabel) price.textContent = archiveLabel;
    });

    const hero = document.querySelector('.showcase-card[data-category-id="knives"]');
    if (hero) {
      hero.dataset.vjInformational = '1';
      const eyebrow = hero.querySelector('.showcase-card-eyebrow');
      const paragraph = hero.querySelector('.showcase-card-copy p');
      const action = hero.querySelector('.showcase-action');
      if (eyebrow && eyebrow.textContent !== heroEyebrow) eyebrow.textContent = heroEyebrow;
      if (paragraph && paragraph.textContent !== heroText) paragraph.textContent = heroText;
      if (action && action.textContent !== heroAction) action.textContent = heroAction;
    }
  };

  document.addEventListener('click', event => {
    const categoryButton = event.target.closest('#categories .category-button');
    if (categoryButton) {
      const id = categoryIdFromButton(categoryButton);
      if (restricted.has(id)) {
        event.preventDefault();
        event.stopImmediatePropagation();
        return;
      }
      if (internalCategoryClick) return;
      showCatalogView(id || 'all', { push: true });
      return;
    }

    if (event.target.closest('.vj-back-showcase')) {
      event.preventDefault();
      event.stopImmediatePropagation();
      showShowcaseView({ push: true });
      return;
    }

    if (event.target.closest('#mobileCatalog')) showCatalogView('all', { push: true });
    if (event.target.closest('.header-search-toggle') || event.target.closest('#mobileSearch')) {
      showCatalogView(new URL(location.href).searchParams.get('category') || 'all', { push: true });
    }
  }, true);

  const applyRouteFromUrl = ({ replace = false } = {}) => {
    const params = new URL(window.location.href).searchParams;
    if (params.get('view') !== 'catalog') {
      showShowcaseView({ push: false });
      return;
    }
    const requested = params.get('category') || 'all';
    const category = restricted.has(requested) ? 'all' : requested;
    selectCategory(category, { push: false });
    if (replace && category !== requested) updateUrl(category, true);
  };

  window.addEventListener('DOMContentLoaded', () => {
    markCategoryUi();
    hideRestrictedProducts();
    markInformationalUi();
    requestAnimationFrame(() => applyRouteFromUrl({ replace: true }));

    const categories = document.getElementById('categories');
    if (categories) new MutationObserver(() => {
      markCategoryUi();
      hideRestrictedProducts();
      markInformationalUi();
    }).observe(categories, { childList: true, subtree: true });

    document.querySelectorAll('.product-grid').forEach(grid => {
      new MutationObserver(() => {
        hideRestrictedProducts();
        markInformationalUi();
      }).observe(grid, { childList: true, subtree: true });
    });

    const stack = document.querySelector('.showcase-stack');
    if (stack) new MutationObserver(() => {
      markCategoryUi();
      markInformationalUi();
    }).observe(stack, { childList: true, subtree: true });

    document.getElementById('languageButton')?.addEventListener('click', () => requestAnimationFrame(() => {
      markCategoryUi();
      hideRestrictedProducts();
      markInformationalUi();
    }));
  });

  window.addEventListener('popstate', () => requestAnimationFrame(() => applyRouteFromUrl()));
})();
