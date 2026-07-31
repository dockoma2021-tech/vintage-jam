(() => {
  'use strict';
  const data = window.VINTAGE_JAM_DATA;
  const byId = id => document.getElementById(id);
  const storage = {
    get(key, fallback) { try { const value = localStorage.getItem(key); return value === null ? fallback : value; } catch { return fallback; } },
    set(key, value) { try { localStorage.setItem(key, value); } catch {} }
  };
  if (!data || !Array.isArray(data.products) || !Array.isArray(data.categories)) {
    document.body.innerHTML = '<main class="container"><div class="empty-state">Catalog data is unavailable.</div></main>';
    return;
  }
  const state = { language: storage.get('vjLanguage', data.site?.defaultLanguage || 'uk') === 'en' ? 'en' : 'uk', category: 'all', search: '', sort: 'new', favoritesOnly: false };
  function readFavorites() { try { const parsed = JSON.parse(storage.get('vjFavorites', '[]') || '[]'); return new Set(Array.isArray(parsed) ? parsed.filter(Boolean) : []); } catch { return new Set(); } }
  const favorites = readFavorites();
  const localize = value => value && typeof value === 'object' ? (value[state.language] || value.uk || value.en || '') : (value ?? '');
  const categoryTitle = id => localize(data.categories.find(item => item.id === id)?.title) || id || '';
  const dateValue = product => Number.isFinite(Date.parse(product.date_added)) ? Date.parse(product.date_added) : 0;
  const priceValue = product => product.price?.type === 'fixed' && Number.isFinite(Number(product.price.value)) ? Number(product.price.value) : Number.POSITIVE_INFINITY;
  function priceText(product) {
    if (product.price?.type !== 'fixed' || !Number.isFinite(Number(product.price.value))) return state.language === 'uk' ? 'Ціна за запитом' : 'Price on request';
    try { return new Intl.NumberFormat(state.language === 'uk' ? 'uk-UA' : 'en-US', { style: 'currency', currency: product.price.currency || 'UAH', maximumFractionDigits: 0 }).format(Number(product.price.value)); }
    catch { return `${product.price.value} ${product.price.currency || 'UAH'}`; }
  }
  function sorted(products) {
    const items = [...products];
    if (state.sort === 'old') return items.sort((a,b) => dateValue(a) - dateValue(b));
    if (state.sort === 'price_up') return items.sort((a,b) => priceValue(a) - priceValue(b));
    if (state.sort === 'price_down') return items.sort((a,b) => priceValue(b) - priceValue(a));
    return items.sort((a,b) => dateValue(b) - dateValue(a));
  }
  function saveFavorites() { storage.set('vjFavorites', JSON.stringify([...favorites])); }
  function toggleFavorite(id) { favorites.has(id) ? favorites.delete(id) : favorites.add(id); saveFavorites(); renderProducts(); updateMobileFavorites(); }
  function createCard(product) {
    const article = document.createElement('article'); article.className = 'product-card';
    const link = document.createElement('a'); link.className = 'product-card-link'; link.href = `item.html?id=${encodeURIComponent(product.id)}&v=3.0.0`;
    const imageWrap = document.createElement('div'); imageWrap.className = 'product-image';
    const image = document.createElement('img'); image.src = product.media?.images?.[0] || 'assets/images/no-image.webp'; image.alt = localize(product.title) || product.id; image.loading = 'lazy'; image.decoding = 'async'; image.onerror = () => { image.onerror = null; image.src = 'assets/images/no-image.webp'; };
    const fav = document.createElement('button'); fav.type = 'button'; fav.className = `favorite-button${favorites.has(product.id) ? ' active' : ''}`; fav.textContent = favorites.has(product.id) ? '♥' : '♡'; fav.setAttribute('aria-label', favorites.has(product.id) ? 'Remove from favorites' : 'Add to favorites'); fav.addEventListener('click', event => { event.preventDefault(); event.stopPropagation(); toggleFavorite(product.id); });
    if (product.sale_status === 'sold') { const badge = document.createElement('span'); badge.className = 'badge'; badge.textContent = state.language === 'uk' ? 'ПРОДАНО' : 'SOLD'; imageWrap.append(badge); }
    imageWrap.append(image, fav);
    const info = document.createElement('div'); info.className = 'product-info';
    const title = document.createElement('div'); title.className = 'product-title'; title.textContent = localize(product.title) || product.id;
    const category = document.createElement('div'); category.className = 'product-category'; category.textContent = categoryTitle(product.category);
    const price = document.createElement('div'); price.className = 'product-price'; price.textContent = priceText(product);
    info.append(title, category, price); link.append(imageWrap, info); article.append(link); return article;
  }
  function renderGrid(container, products, showEmpty = true) {
    container.replaceChildren();
    if (!products.length && showEmpty) { const empty = document.createElement('p'); empty.className = 'empty-state'; empty.textContent = state.language === 'uk' ? 'Нічого не знайдено.' : 'Nothing found.'; container.append(empty); return; }
    const fragment = document.createDocumentFragment(); products.forEach(product => fragment.append(createCard(product))); container.append(fragment);
  }
  function productSearchText(product) { return [localize(product.title), localize(product.short_description), localize(product.description), categoryTitle(product.category), ...Object.values(product.attributes || {}).map(localize)].join(' ').toLowerCase(); }
  function renderProducts() {
    const published = data.products.filter(product => product.publication_status === 'published');
    const available = published.filter(product => product.sale_status !== 'sold');
    let filtered = available;
    if (state.favoritesOnly) filtered = published.filter(product => favorites.has(product.id));
    else {
      if (state.category !== 'all') filtered = filtered.filter(product => product.category === state.category);
      if (state.search) filtered = filtered.filter(product => productSearchText(product).includes(state.search.toLowerCase()));
    }
    filtered = sorted(filtered);
    renderGrid(byId('catalogProducts'), filtered);
    byId('catalogCount').textContent = `${filtered.length}`;
    const newest = sorted(available).slice(0, 8); renderGrid(byId('newProducts'), newest, false); byId('newCount').textContent = `${newest.length}`;
    const sold = sorted(published.filter(product => product.sale_status === 'sold')); renderGrid(byId('soldProducts'), sold, false); byId('soldSection').hidden = sold.length === 0;
    byId('catalogTitle').textContent = state.favoritesOnly ? (state.language === 'uk' ? 'Обране' : 'Favorites') : (state.language === 'uk' ? 'Каталог' : 'Catalog');
  }
  function renderCategories() {
    const container = byId('categories'); container.replaceChildren();
    const entries = [{ id: 'all', title: state.language === 'uk' ? 'Всі' : 'All' }, ...data.categories.map(category => ({ id: category.id, title: localize(category.title) }))];
    entries.forEach(entry => { const button = document.createElement('button'); button.type = 'button'; button.className = `category-button${state.category === entry.id && !state.favoritesOnly ? ' active' : ''}`; button.textContent = entry.title; button.addEventListener('click', () => { state.category = entry.id; state.favoritesOnly = false; renderCategories(); renderProducts(); byId('catalogSection').scrollIntoView({ behavior: 'smooth', block: 'start' }); }); container.append(button); });
  }
  function renderText() {
    const uk = state.language === 'uk'; document.documentElement.lang = state.language; byId('languageButton').textContent = state.language.toUpperCase();
    byId('heroTitle').textContent = uk ? 'Вінтажні речі з історією' : 'Vintage objects with a story';
    byId('heroText').textContent = uk ? 'Колекційні предмети, мистецтво, годинники та знахідки з Одеси.' : 'Collectibles, art, watches and vintage finds from Odesa.';
    byId('searchInput').placeholder = uk ? 'Пошук за назвою, описом або категорією' : 'Search by title, description or category';
    byId('sortSelect').options[0].text = uk ? 'Нові спочатку' : 'Newest first'; byId('sortSelect').options[1].text = uk ? 'Старі спочатку' : 'Oldest first'; byId('sortSelect').options[2].text = uk ? 'Ціна: від нижчої' : 'Price: low to high'; byId('sortSelect').options[3].text = uk ? 'Ціна: від вищої' : 'Price: high to low';
    byId('categoriesTitle').textContent = uk ? 'Категорії' : 'Categories'; byId('newTitle').textContent = uk ? 'Нові надходження' : 'New arrivals'; byId('soldTitle').textContent = uk ? 'Продано' : 'Sold';
    byId('shippingTitle').textContent = uk ? 'Доставка та умови покупки' : 'Shipping and purchase terms'; byId('shippingIntro').textContent = localize(data.shipping.intro); byId('originTitle').textContent = uk ? 'Відправлення з Одеси' : 'Shipping from Odesa'; byId('originText').textContent = localize(data.shipping.origin); byId('carriersTitle').textContent = uk ? 'Способи доставки' : 'Delivery methods'; byId('carriersText').textContent = localize(data.shipping.carriers); byId('costTitle').textContent = uk ? 'Вартість і строки' : 'Cost and timing'; byId('costText').textContent = localize(data.shipping.cost); byId('packingTitle').textContent = uk ? 'Надійне пакування' : 'Secure packaging'; byId('packingText').textContent = localize(data.shipping.packing); byId('photosTitle').textContent = uk ? 'Товар з фотографій' : 'Exact item shown'; byId('photosText').textContent = localize(data.shipping.photos); byId('paymentsTitle').textContent = uk ? 'Способи оплати' : 'Payment methods';
    byId('mobileCatalogLabel').textContent = uk ? 'Каталог' : 'Catalog'; byId('mobileSearchLabel').textContent = uk ? 'Пошук' : 'Search'; byId('mobileFavoritesLabel').textContent = uk ? 'Обране' : 'Favorites'; byId('mobileContactLabel').textContent = uk ? 'Зв’язок' : 'Contact';
  }
  function renderPayments() { const list = byId('paymentList'); list.replaceChildren(); data.payments.forEach(payment => { const chip = document.createElement('span'); chip.className = 'payment-chip'; chip.textContent = payment.label; list.append(chip); }); }
  function updateMobileFavorites() { const button = byId('mobileFavorites'); button.setAttribute('aria-pressed', String(state.favoritesOnly)); button.querySelector('span:first-child').textContent = state.favoritesOnly ? '♥' : '♡'; }
  byId('languageButton').addEventListener('click', () => { state.language = state.language === 'uk' ? 'en' : 'uk'; storage.set('vjLanguage', state.language); renderText(); renderCategories(); renderProducts(); });
  byId('searchInput').addEventListener('input', event => { state.search = event.target.value.trim(); state.favoritesOnly = false; renderProducts(); updateMobileFavorites(); });
  byId('sortSelect').addEventListener('change', event => { state.sort = event.target.value; renderProducts(); });
  byId('mobileCatalog').addEventListener('click', () => { state.favoritesOnly = false; renderProducts(); updateMobileFavorites(); byId('catalogSection').scrollIntoView({ behavior: 'smooth' }); });
  byId('mobileSearch').addEventListener('click', () => { byId('searchInput').scrollIntoView({ behavior: 'smooth', block: 'center' }); setTimeout(() => byId('searchInput').focus(), 250); });
  byId('mobileFavorites').addEventListener('click', () => { state.favoritesOnly = !state.favoritesOnly; renderProducts(); updateMobileFavorites(); byId('catalogSection').scrollIntoView({ behavior: 'smooth' }); });
  byId('year').textContent = new Date().getFullYear(); byId('mobileContact').href = `tel:${data.contacts.phone}`;
  renderText(); renderCategories(); renderPayments(); renderProducts(); updateMobileFavorites();
})();
