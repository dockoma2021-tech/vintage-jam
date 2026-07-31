(() => {
'use strict';
const data = window.VINTAGE_JAM_FALLBACK || { products: [], categories: [] };
const byId = id => document.getElementById(id);
let lang = localStorage.getItem('language') === 'en' ? 'en' : 'uk';
let index = 0;
const id = new URLSearchParams(location.search).get('id');
const product = (data.products || []).find(item => item.id === id);
const category = (data.categories || []).find(item => item.id === product?.category);
const local = value => value && typeof value === 'object' ? (value[lang] || value.uk || value.en || '') : (value || '');
const gallery = () => product?.media?.images?.filter(Boolean)?.length ? product.media.images.filter(Boolean) : ['assets/images/no-image.webp'];

function price() {
  if (product?.price?.type !== 'fixed') return lang === 'uk' ? 'Ціна за запитом' : 'Price on request';
  const value = Number(product.price.value);
  try {
    return new Intl.NumberFormat(lang === 'uk' ? 'uk-UA' : 'en-US', { style: 'currency', currency: product.price.currency || 'UAH', maximumFractionDigits: 0 }).format(value);
  } catch {
    return `${value} ${product.price.currency || 'UAH'}`;
  }
}

function updateGalleryControls() {
  const count = gallery().length;
  const hasMultiple = count > 1;
  byId('galleryPrevious').hidden = !hasMultiple;
  byId('galleryNext').hidden = !hasMultiple;
  byId('galleryCounter').hidden = !hasMultiple;
  byId('galleryThumbnails').hidden = !hasMultiple;
}

function showImage() {
  const list = gallery();
  index = (index + list.length) % list.length;
  const image = byId('mainProductImage');
  image.src = list[index];
  image.alt = local(product.title);
  image.onerror = () => { image.onerror = null; image.src = 'assets/images/no-image.webp'; };
  byId('galleryCounter').textContent = `${index + 1} / ${list.length}`;
  document.querySelectorAll('.gallery-thumbnail').forEach((button, itemIndex) => {
    const active = itemIndex === index;
    button.classList.toggle('active', active);
    button.setAttribute('aria-current', active ? 'true' : 'false');
  });
}

function renderThumbs() {
  const box = byId('galleryThumbnails');
  box.replaceChildren();
  gallery().forEach((src, itemIndex) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'gallery-thumbnail';
    button.setAttribute('aria-label', `${lang === 'uk' ? 'Зображення' : 'Image'} ${itemIndex + 1}`);
    const image = document.createElement('img');
    image.src = src;
    image.alt = '';
    image.loading = 'lazy';
    image.onerror = () => { image.onerror = null; image.src = 'assets/images/no-image.webp'; };
    button.append(image);
    button.addEventListener('click', () => { index = itemIndex; showImage(); });
    box.append(button);
  });
  updateGalleryControls();
}

function renderAttributes() {
  const list = byId('attributes');
  list.replaceChildren();
  const names = { brand:['Бренд','Brand'], model:['Модель','Model'], year:['Рік','Year'], country:['Країна','Country'], movement:['Механізм','Movement'], artist:['Художник','Artist'], material:['Матеріал','Material'], dimensions:['Розмір','Dimensions'], condition:['Стан','Condition'], signature:['Підпис','Signature'] };
  Object.entries(product.attributes || {}).forEach(([key, value]) => {
    const term = document.createElement('dt');
    const definition = document.createElement('dd');
    term.textContent = names[key]?.[lang === 'uk' ? 0 : 1] || key;
    definition.textContent = local(value);
    list.append(term, definition);
  });
  byId('attributesSection').hidden = !list.children.length;
}

function labels() {
  document.documentElement.lang = lang;
  byId('languageSwitcher').textContent = lang.toUpperCase();
  byId('backLink').textContent = lang === 'uk' ? '← До каталогу' : '← Back to catalog';
  byId('descriptionHeading').textContent = lang === 'uk' ? 'Опис' : 'Description';
  byId('attributesHeading').textContent = lang === 'uk' ? 'Характеристики' : 'Details';
  byId('storyHeading').textContent = lang === 'uk' ? 'Історія предмета' : 'Item story';
  byId('contactButtonText').textContent = lang === 'uk' ? 'Зв’язатися' : 'Contact';
}

function render() {
  if (!product) {
    byId('productStateMessage').textContent = lang === 'uk' ? 'Товар не знайдено' : 'Product not found';
    return;
  }
  labels();
  byId('productCategory').textContent = local(category?.title) || product.category;
  byId('productTitle').textContent = local(product.title);
  byId('productShortDescription').textContent = local(product.short_description);
  byId('productPrice').textContent = price();
  byId('productDescription').textContent = local(product.description);
  const story = local(product.story);
  byId('productStory').textContent = story;
  byId('storySection').hidden = !story;
  renderAttributes();
  renderThumbs();
  showImage();
  byId('productState').hidden = true;
  byId('productPage').hidden = false;
  document.title = `${local(product.title)} — Vintage Jam`;
}

byId('galleryPrevious')?.addEventListener('click', () => { index -= 1; showImage(); });
byId('galleryNext')?.addEventListener('click', () => { index += 1; showImage(); });
byId('mainProductImage')?.addEventListener('click', () => { if (gallery().length > 1) { index += 1; showImage(); } });
byId('languageSwitcher')?.addEventListener('click', () => { lang = lang === 'uk' ? 'en' : 'uk'; localStorage.setItem('language', lang); render(); });
byId('contactButton')?.addEventListener('click', event => { event.preventDefault(); location.href = 'tel:+380983219801'; });
document.addEventListener('keydown', event => {
  if (gallery().length < 2) return;
  if (event.key === 'ArrowLeft') { index -= 1; showImage(); }
  if (event.key === 'ArrowRight') { index += 1; showImage(); }
});
render();
})();
