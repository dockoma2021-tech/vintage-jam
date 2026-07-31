(() => {
  'use strict';
  const fallback = window.VINTAGE_JAM_FALLBACK || { products: [], categories: [] };
  const state = {
    products: fallback.products || [],
    categories: fallback.categories || [],
    language: localStorage.getItem('language') === 'en' ? 'en' : 'uk',
    category: null,
    search: '',
    sort: 'new'
  };
  const byId = id => document.getElementById(id);
  const localized = value => value && typeof value === 'object' ? (value[state.language] || value.uk || value.en || '') : (value || '');
  const fallbackImage = 'assets/images/no-image.webp';

  function categoryTitle(id) {
    const item = state.categories.find(category => category.id === id);
    return localized(item?.title) || id || '';
  }

  function priceText(product) {
    if (product.price?.type !== 'fixed') return state.language === 'uk' ? 'Ціна за запитом' : 'Price on request';
    const value = Number(product.price.value);
    if (!Number.isFinite(value)) return state.language === 'uk' ? 'Ціна за запитом' : 'Price on request';
    try {
      return new Intl.NumberFormat(state.language === 'uk' ? 'uk-UA' : 'en-US', {
        style: 'currency', currency: product.price.currency || 'UAH', maximumFractionDigits: 0
      }).format(value);
    } catch {
      return `${value} ${product.price.currency || 'UAH'}`;
    }
  }

  function createCard(product) {
    const article = document.createElement('article');
    article.className = 'product-card';
    const link = document.createElement('a');
    link.className = 'product-card-link';
    link.href = `item.html?id=${encodeURIComponent(product.id)}`;
    const imageWrap = document.createElement('div');
    imageWrap.className = 'product-image';
    const image = document.createElement('img');
    image.src = product.media?.images?.[0] || fallbackImage;
    image.alt = localized(product.title) || product.id;
    image.loading = 'lazy';
    image.onerror = () => { image.onerror = null; image.src = fallbackImage; };
    imageWrap.append(image);
    const info = document.createElement('div');
    info.className = 'product-info';
    const title = document.createElement('div');
    title.className = 'product-title';
    title.textContent = localized(product.title) || product.id;
    const category = document.createElement('div');
    category.className = 'product-category';
    category.textContent = categoryTitle(product.category);
    const price = document.createElement('div');
    price.className = 'product-price';
    price.textContent = priceText(product);
    info.append(title, category, price);
    link.append(imageWrap, info);
    article.append(link);
    return article;
  }

  function renderList(container, items, showEmpty = true) {
    if (!container) return;
    container.replaceChildren();
    if (!items.length && showEmpty) {
      const empty = document.createElement('p');
      empty.className = 'catalog-empty';
      empty.textContent = state.language === 'uk' ? 'Нічого не знайдено' : 'Nothing found';
      container.append(empty);
      return;
    }
    const fragment = document.createDocumentFragment();
    items.forEach(item => fragment.append(createCard(item)));
    container.append(fragment);
  }

  function sortItems(items) {
    const result = [...items];
    const date = item => new Date(item.date_added || 0).getTime() || 0;
    const price = item => item.price?.type === 'fixed' && Number.isFinite(Number(item.price.value)) ? Number(item.price.value) : Infinity;
    if (state.sort === 'old') result.sort((a, b) => date(a) - date(b));
    else if (state.sort === 'price_up') result.sort((a, b) => price(a) - price(b));
    else if (state.sort === 'price_down') result.sort((a, b) => price(b) - price(a));
    else result.sort((a, b) => date(b) - date(a));
    return result;
  }

  function renderCategories() {
    const container = byId('categories');
    if (!container) return;
    container.replaceChildren();
    const items = [{ id: null, title: state.language === 'uk' ? 'Всі' : 'All' }, ...state.categories.map(item => ({ id: item.id, title: localized(item.title) }))];
    items.forEach(item => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `category-item${state.category === item.id ? ' active' : ''}`;
      button.textContent = item.title;
      button.onclick = () => { state.category = item.id; renderCategories(); renderCatalog(); };
      container.append(button);
    });
  }

  function renderCatalog() {
    let available = state.products.filter(item => item.publication_status === 'published' && item.sale_status === 'available');
    if (state.category) available = available.filter(item => item.category === state.category);
    if (state.search) {
      const query = state.search.toLowerCase();
      available = available.filter(item => `${localized(item.title)} ${localized(item.short_description)} ${localized(item.description)} ${categoryTitle(item.category)}`.toLowerCase().includes(query));
    }
    renderList(byId('catalog'), sortItems(available));
    renderList(byId('newArrivals'), sortItems(state.products.filter(item => item.publication_status === 'published' && item.sale_status === 'available')).slice(0, 8), false);
    const sold = state.products.filter(item => item.publication_status === 'published' && item.sale_status === 'sold');
    renderList(byId('soldProducts'), sold, false);
    if (byId('soldSection')) byId('soldSection').hidden = sold.length === 0;
  }

  function updateLabels() {
    const uk = state.language === 'uk';
    document.documentElement.lang = state.language;
    byId('languageSwitcher').textContent = state.language.toUpperCase();
    byId('searchInput').placeholder = uk ? 'Пошук...' : 'Search...';
    byId('categoriesHeading').textContent = uk ? 'Категорії' : 'Categories';
    byId('newArrivalsHeading').textContent = uk ? 'Нові надходження' : 'New arrivals';
    byId('catalogHeading').textContent = uk ? 'Каталог' : 'Catalog';
    byId('soldHeading').textContent = uk ? 'Продано' : 'Sold';
  }

  function bind() {
    byId('searchInput')?.addEventListener('input', event => { state.search = event.target.value.trim(); renderCatalog(); });
    byId('sortSelect')?.addEventListener('change', event => { state.sort = event.target.value; renderCatalog(); });
    byId('languageSwitcher')?.addEventListener('click', () => {
      state.language = state.language === 'uk' ? 'en' : 'uk';
      localStorage.setItem('language', state.language);
      updateLabels(); renderCategories(); renderCatalog();
    });
  }

  function renderImmediately() {
    updateLabels();
    bind();
    renderCategories();
    renderCatalog();
    byId('startupState')?.remove();
  }

  async function refreshInBackground() {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const [productsResponse, categoriesResponse] = await Promise.all([
        fetch('data/products.json?fresh=1.2.5', { cache: 'no-store', signal: controller.signal }),
        fetch('data/categories.json?fresh=1.2.5', { cache: 'no-store', signal: controller.signal })
      ]);
      clearTimeout(timeout);
      if (!productsResponse.ok || !categoriesResponse.ok) return;
      const [products, categories] = await Promise.all([productsResponse.json(), categoriesResponse.json()]);
      if (Array.isArray(products) && Array.isArray(categories)) {
        state.products = products;
        state.categories = categories;
        renderCategories();
        renderCatalog();
      }
    } catch (error) {
      console.warn('Background catalog refresh skipped:', error);
    }
  }

  renderImmediately();
  refreshInBackground();
})();
