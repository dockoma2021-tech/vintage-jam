(() => {
  'use strict';

  const VERSION = '1.2.4';
  const FALLBACK_IMAGE = 'assets/images/no-image.webp';
  const state = { products: [], categories: [], language: localStorage.getItem('language') === 'en' ? 'en' : 'uk', category: null, search: '', sort: 'new' };
  const byId = id => document.getElementById(id);
  const localized = value => value && typeof value === 'object' ? (value[state.language] || value.uk || value.en || '') : (value || '');

  function startup(text, error = false) {
    let box = byId('startupState');
    if (!box) {
      box = document.createElement('section');
      box.id = 'startupState';
      box.style.cssText = 'margin:16px;padding:16px;border-radius:14px;background:#f5f5f7;text-align:center';
      byId('mainContent')?.prepend(box);
    }
    box.replaceChildren();
    const message = document.createElement('div');
    message.textContent = text;
    box.append(message);
    if (error) {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = state.language === 'uk' ? 'Повторити' : 'Retry';
      button.style.marginTop = '12px';
      button.onclick = () => location.replace(`${location.pathname}?reload=${Date.now()}`);
      box.append(button);
    }
  }

  async function fetchJson(path) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    try {
      const response = await fetch(`${path}?v=${VERSION}&t=${Date.now()}`, { cache: 'no-store', signal: controller.signal });
      if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`);
      return await response.json();
    } finally {
      clearTimeout(timeout);
    }
  }

  function categoryTitle(id) {
    const category = state.categories.find(item => item.id === id);
    return localized(category?.title) || id || '';
  }

  function priceText(product) {
    if (product.price?.type !== 'fixed') return state.language === 'uk' ? 'Ціна за запитом' : 'Price on request';
    const value = Number(product.price.value);
    if (!Number.isFinite(value)) return state.language === 'uk' ? 'Ціна за запитом' : 'Price on request';
    try {
      return new Intl.NumberFormat(state.language === 'uk' ? 'uk-UA' : 'en-US', { style: 'currency', currency: product.price.currency || 'UAH', maximumFractionDigits: 0 }).format(value);
    } catch {
      return `${value} ${product.price.currency || 'UAH'}`;
    }
  }

  function card(product) {
    const article = document.createElement('article');
    article.className = 'product-card';
    const link = document.createElement('a');
    link.className = 'product-card-link';
    link.href = `item.html?id=${encodeURIComponent(product.id)}`;
    const imageWrap = document.createElement('div');
    imageWrap.className = 'product-image';
    const image = document.createElement('img');
    image.src = product.media?.images?.[0] || FALLBACK_IMAGE;
    image.alt = localized(product.title) || product.id;
    image.loading = 'lazy';
    image.onerror = () => { image.onerror = null; image.src = FALLBACK_IMAGE; };
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

  function renderList(container, items, empty = true) {
    container.replaceChildren();
    if (!items.length && empty) {
      const p = document.createElement('p');
      p.className = 'catalog-empty';
      p.textContent = state.language === 'uk' ? 'Нічого не знайдено' : 'Nothing found';
      container.append(p);
      return;
    }
    const fragment = document.createDocumentFragment();
    items.forEach(item => fragment.append(card(item)));
    container.append(fragment);
  }

  function renderCategories() {
    const box = byId('categories');
    box.replaceChildren();
    const all = [{ id: null, title: state.language === 'uk' ? 'Всі' : 'All' }, ...state.categories.map(c => ({ id: c.id, title: localized(c.title) }))];
    all.forEach(item => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `category-item${state.category === item.id ? ' active' : ''}`;
      button.textContent = item.title;
      button.onclick = () => { state.category = item.id; renderCategories(); renderCatalog(); };
      box.append(button);
    });
  }

  function sorted(items) {
    const result = [...items];
    const date = p => new Date(p.date_added || 0).getTime() || 0;
    const price = p => p.price?.type === 'fixed' && Number.isFinite(Number(p.price.value)) ? Number(p.price.value) : Infinity;
    if (state.sort === 'old') result.sort((a,b) => date(a)-date(b));
    else if (state.sort === 'price_up') result.sort((a,b) => price(a)-price(b));
    else if (state.sort === 'price_down') result.sort((a,b) => price(b)-price(a));
    else result.sort((a,b) => date(b)-date(a));
    return result;
  }

  function renderCatalog() {
    let items = state.products.filter(p => p.publication_status === 'published' && p.sale_status === 'available');
    if (state.category) items = items.filter(p => p.category === state.category);
    if (state.search) {
      const q = state.search.toLowerCase();
      items = items.filter(p => `${localized(p.title)} ${localized(p.short_description)} ${localized(p.description)} ${categoryTitle(p.category)}`.toLowerCase().includes(q));
    }
    renderList(byId('catalog'), sorted(items));
    renderList(byId('newArrivals'), sorted(state.products.filter(p => p.publication_status === 'published' && p.sale_status === 'available')).slice(0, 8), false);
    const sold = state.products.filter(p => p.publication_status === 'published' && p.sale_status === 'sold');
    renderList(byId('soldProducts'), sold, false);
    byId('soldSection').hidden = sold.length === 0;
  }

  function labels() {
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
    byId('searchInput').addEventListener('input', e => { state.search = e.target.value.trim(); renderCatalog(); });
    byId('sortSelect').addEventListener('change', e => { state.sort = e.target.value; renderCatalog(); });
    byId('languageSwitcher').addEventListener('click', () => {
      state.language = state.language === 'uk' ? 'en' : 'uk';
      localStorage.setItem('language', state.language);
      labels(); renderCategories(); renderCatalog();
    });
  }

  async function init() {
    startup('Завантаження каталогу…');
    try {
      const [products, categories] = await Promise.all([fetchJson('data/products.json'), fetchJson('data/categories.json')]);
      if (!Array.isArray(products) || !Array.isArray(categories)) throw new Error('Некоректний формат JSON');
      state.products = products;
      state.categories = categories;
      labels(); bind(); renderCategories(); renderCatalog();
      byId('startupState')?.remove();
    } catch (error) {
      console.error(error);
      startup(`${state.language === 'uk' ? 'Помилка каталогу' : 'Catalog error'}: ${error.message}`, true);
    }
  }

  init();
})();
