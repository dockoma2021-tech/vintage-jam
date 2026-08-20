(() => {
  'use strict';

  const data = window.VINTAGE_JAM_DATA;
  if (!data || !Array.isArray(data.categories) || !Array.isArray(data.products)) return;

  const restricted = new Set(['knives', 'daggers']);
  let internalCategoryClick = false;

  const published = data.products.filter(p => p.publication_status === 'published');
  const usedCategories = data.categories.filter(c => published.some(p => p.category === c.id));

  const titleMatches = (category, text) => {
    const normalized = String(text || '').trim();
    return normalized === String(category?.title?.uk || '').trim() || normalized === String(category?.title?.en || '').trim();
  };

  const categoryIdFromButton = button => {
    if (!button) return null;
    const container = document.getElementById('categories');
    if (container && button === container.querySelector('.category-button')) return 'all';
    const category = data.categories.find(c => titleMatches(c, button.textContent));
    return category?.id || null;
  };

  const findCategoryButton = id => {
    const buttons = [...document.querySelectorAll('#categories .category-button')];
    if (id === 'all') return buttons[0] || null;
    const category = data.categories.find(c => c.id === id);
    if (!category) return null;
    return buttons.find(button => titleMatches(category, button.textContent)) || null;
  };

  const suppressCatalogScrollOnce = () => {
    const section = document.getElementById('catalogSection');
    if (!section || section.dataset.vjScrollSuppressed === '1') return;
    section.dataset.vjScrollSuppressed = '1';
    const original = section.scrollIntoView;
    section.scrollIntoView = () => {};
    setTimeout(() => {
      section.scrollIntoView = original;
      delete section.dataset.vjScrollSuppressed;
    }, 0);
  };

  const updateUrl = (category = 'all', replace = false) => {
    const url = new URL(window.location.href);
    url.searchParams.set('view', 'catalog');
    if (category && category !== 'all') url.searchParams.set('category', category);
    else url.searchParams.delete('category');
    const method = replace ? 'replaceState' : 'pushState';
    history[method]({ view: 'catalog', category }, '', url);
  };

  const clearCatalogUrl = (replace = false) => {
    const url = new URL(window.location.href);
    url.searchParams.delete('view');
    url.searchParams.delete('category');
    const method = replace ? 'replaceState' : 'pushState';
    history[method]({ view: 'showcase' }, '', url);
  };

  const showCatalogView = (category = 'all', { push = true } = {}) => {
    if (restricted.has(category)) return false;
    document.body.classList.add('vj-catalog-open');
    document.body.classList.remove('vj-new-open', 'vj-sold-open');
    suppressCatalogScrollOnce();
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
    suppressCatalogScrollOnce();
    button.click();
    internalCategoryClick = false;
  };

  const installViewStyles = () => {
    if (document.getElementById('vjNavigationRouterStyles')) return;
    const style = document.createElement('style');
    style.id = 'vjNavigationRouterStyles';
    style.textContent = `
      body.vj-showcase-home.vj-catalog-open .category-showcase{display:none!important}
      body.vj-showcase-home.vj-catalog-open .vj-catalog-shell{margin-top:0!important;padding-top:24px!important;min-height:calc(100vh - 48px)}
      body.vj-showcase-home.vj-catalog-open .vj-catalog-shell-close{display:flex!important}
      body.vj-showcase-home.vj-catalog-open main{background:#fff}
      body.vj-showcase-home:not(.vj-catalog-open) .vj-catalog-shell{padding-top:0!important}
      .category-button[data-vj-restricted="1"],.showcase-card[data-vj-restricted="1"]{display:none!important}
      @media(max-width:760px){body.vj-showcase-home.vj-catalog-open .vj-catalog-shell{padding-top:18px!important}}
    `;
    document.head.append(style);
  };

  const markRestrictedUi = () => {
    document.querySelectorAll('#categories .category-button').forEach(button => {
      const id = categoryIdFromButton(button);
      if (restricted.has(id)) button.dataset.vjRestricted = '1';
      else delete button.dataset.vjRestricted;
    });

    const cards = [...document.querySelectorAll('.showcase-stack .showcase-card')];
    cards.forEach((card, index) => {
      const category = usedCategories[index];
      if (category && restricted.has(category.id)) card.dataset.vjRestricted = '1';
      else delete card.dataset.vjRestricted;
    });
  };

  const hideRestrictedProducts = () => {
    const restrictedTitles = new Set();
    data.categories.filter(c => restricted.has(c.id)).forEach(c => {
      if (c.title?.uk) restrictedTitles.add(String(c.title.uk).trim());
      if (c.title?.en) restrictedTitles.add(String(c.title.en).trim());
    });
    document.querySelectorAll('.product-card').forEach(card => {
      const category = card.querySelector('.product-category')?.textContent?.trim();
      card.hidden = restrictedTitles.has(category);
    });
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

    const showcaseButton = event.target.closest('.showcase-card .showcase-action');
    if (showcaseButton) {
      const card = showcaseButton.closest('.showcase-card');
      const cards = [...document.querySelectorAll('.showcase-stack .showcase-card')];
      const category = usedCategories[cards.indexOf(card)];
      if (!category || restricted.has(category.id)) {
        event.preventDefault();
        event.stopImmediatePropagation();
        return;
      }
      event.preventDefault();
      event.stopImmediatePropagation();
      selectCategory(category.id, { push: true });
      return;
    }

    const allButton = event.target.closest('.showcase-actions [data-action="all"]');
    if (allButton) {
      event.preventDefault();
      event.stopImmediatePropagation();
      selectCategory('all', { push: true });
      return;
    }

    const backButton = event.target.closest('.vj-back-showcase');
    if (backButton) {
      event.preventDefault();
      event.stopImmediatePropagation();
      showShowcaseView({ push: true });
      return;
    }

    if (event.target.closest('#mobileCatalog')) {
      showCatalogView('all', { push: true });
      suppressCatalogScrollOnce();
    }

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

  installViewStyles();

  window.addEventListener('DOMContentLoaded', () => {
    markRestrictedUi();
    hideRestrictedProducts();
    setTimeout(() => applyRouteFromUrl({ replace: true }), 0);

    const categories = document.getElementById('categories');
    if (categories) new MutationObserver(() => {
      markRestrictedUi();
      hideRestrictedProducts();
    }).observe(categories, { childList: true, subtree: true });

    const catalog = document.getElementById('catalogProducts');
    if (catalog) new MutationObserver(hideRestrictedProducts).observe(catalog, { childList: true, subtree: true });

    const stack = document.querySelector('.showcase-stack');
    if (stack) new MutationObserver(markRestrictedUi).observe(stack, { childList: true, subtree: true });

    document.getElementById('languageButton')?.addEventListener('click', () => setTimeout(() => {
      markRestrictedUi();
      hideRestrictedProducts();
    }, 0));
  });

  window.addEventListener('popstate', () => setTimeout(() => applyRouteFromUrl(), 0));
})();
