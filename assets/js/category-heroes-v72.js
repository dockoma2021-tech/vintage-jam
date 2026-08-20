(() => {
  'use strict';

  const data = window.VINTAGE_JAM_DATA;
  if (!data || !Array.isArray(data.categories) || !Array.isArray(data.products)) return;

  const byId = id => document.getElementById(id);
  const heroImages = {
    paintings: {
      src: 'assets/images/categories/paintings-collage-vintage-jam.webp?v=2',
      className: 'showcase-hero-image',
      loading: 'eager'
    },
    icons: {
      src: 'assets/images/categories/icons-category-hero.webp?v=7.2.0',
      className: 'showcase-hero-image',
      loading: 'lazy'
    },
    watches: {
      src: 'assets/images/categories/watches-category-hero.webp?v=7.2.0',
      className: 'showcase-hero-image',
      loading: 'eager'
    }
  };
  const copy = {
    uk: {
      kicker: 'VINTAGE JAM · ODESA',
      title: 'Речі з історією.',
      lead: 'Мистецтво, колекційні предмети та вінтажні знахідки — зібрані за категоріями.',
      all: 'Усі предмети',
      explore: 'Дивитися',
      collection: 'Колекція',
      newTitle: 'Нові надходження',
      newText: 'Останні предмети, додані до каталогу.',
      newButton: 'Переглянути новинки',
      soldTitle: 'Архів Vintage Jam',
      soldText: 'Предмети, які вже знайшли нових власників.',
      soldButton: 'Переглянути продані',
      catalog: 'Каталог',
      back: 'До категорій'
    },
    en: {
      kicker: 'VINTAGE JAM · ODESA',
      title: 'Objects with a story.',
      lead: 'Art, collectibles and vintage finds — curated by category.',
      all: 'View all objects',
      explore: 'Explore',
      collection: 'Collection',
      newTitle: 'New arrivals',
      newText: 'The latest objects added to the catalogue.',
      newButton: 'View new arrivals',
      soldTitle: 'Vintage Jam archive',
      soldText: 'Objects that have already found new owners.',
      soldButton: 'View sold items',
      catalog: 'Catalog',
      back: 'Back to categories'
    }
  };
  const descriptions = {
    paintings: { uk: 'Живопис, графіка та авторські роботи.', en: 'Paintings, graphics and original works.' },
    art_objects: { uk: 'Скульптура, декоративне мистецтво та незвичайні форми.', en: 'Sculpture, decorative art and unusual forms.' },
    icons: { uk: 'Сакральне мистецтво та ікони різних періодів.', en: 'Sacred art and icons from different periods.' },
    watches: { uk: 'Механічні та вінтажні годинники з характером.', en: 'Mechanical and vintage watches with character.' },
    knives: { uk: 'Колекційні ножі та історичні предмети.', en: 'Collectible knives and historical objects.' },
    daggers: { uk: 'Колекційні кортики та предмети історії.', en: 'Collectible daggers and historical pieces.' },
    orders_medals: { uk: 'Нагороди, знаки та фалеристика.', en: 'Awards, badges and phaleristics.' },
    silver: { uk: 'Срібло, прикраси та предмети сервірування.', en: 'Silver, jewellery and tableware.' },
    coins: { uk: 'Монети та нумізматичні знахідки.', en: 'Coins and numismatic finds.' },
    books: { uk: 'Видання з історією, графікою та характером.', en: 'Books with history, graphics and character.' },
    porcelain: { uk: 'Порцеляна, кераміка та декоративна пластика.', en: 'Porcelain, ceramics and decorative sculpture.' },
    electronics: { uk: 'Вінтажна техніка та аудіоелектроніка.', en: 'Vintage technology and audio electronics.' },
    miscellaneous: { uk: 'Предмети, що не вкладаються в одну категорію.', en: 'Objects that do not fit a single category.' }
  };
  const palettes = [
    ['#eef6ff', '#1d1d1f', '#6e6e73'],
    ['#f4f0ea', '#1d1d1f', '#746b62'],
    ['#eff4ef', '#1d1d1f', '#687268'],
    ['#f5f5f7', '#1d1d1f', '#6e6e73'],
    ['#eceff3', '#1d1d1f', '#68707a'],
    ['#f4eee9', '#1d1d1f', '#7a6c61'],
    ['#f2f0f5', '#1d1d1f', '#706b78'],
    ['#eef2f2', '#1d1d1f', '#697273']
  ];

  const language = () => document.documentElement.lang === 'en' ? 'en' : 'uk';
  const currentCopy = () => copy[language()];
  const localize = value => {
    const lang = language();
    return value && typeof value === 'object' ? (value[lang] || value.uk || value.en || '') : (value || '');
  };
  const publishedProducts = () => data.products.filter(product => product.publication_status === 'published');
  const usedCategories = () => {
    const used = new Set(publishedProducts().map(product => product.category));
    return data.categories.filter(category => used.has(category.id));
  };
  const categoryButton = category => {
    const wanted = localize(category.title).trim();
    return [...document.querySelectorAll('#categories .category-button')]
      .find(button => button.dataset.categoryId === category.id)
      || [...document.querySelectorAll('#categories .category-button')]
        .find(button => button.textContent.trim() === wanted)
      || null;
  };
  const collectImages = categoryId => {
    const products = publishedProducts()
      .filter(product => product.category === categoryId && Array.isArray(product.media?.images) && product.media.images.length)
      .sort((a, b) => String(b.date_added || '').localeCompare(String(a.date_added || '')));
    const images = [];
    for (const product of products) {
      const first = product.media.images[0];
      if (first && !images.includes(first)) images.push(first);
      if (images.length >= 4) break;
    }
    if (images.length < 3 && products[0]) {
      for (const image of products[0].media.images.slice(1)) {
        if (image && !images.includes(image)) images.push(image);
        if (images.length >= 4) break;
      }
    }
    return images.slice(0, 4);
  };

  function openWorkspace(mode = 'catalog') {
    document.body.classList.add('vj-catalog-open');
    document.body.classList.toggle('vj-new-open', mode === 'new');
    document.body.classList.toggle('vj-sold-open', mode === 'sold');
  }

  function openCategory(category) {
    openWorkspace('catalog');
    categoryButton(category)?.click();
  }

  function openAll() {
    openWorkspace('catalog');
    document.querySelector('#categories .category-button')?.click();
  }

  function createImagePresentation(category) {
    const config = heroImages[category.id];
    const image = document.createElement('img');
    image.className = config.className;
    image.src = config.src;
    image.alt = '';
    image.loading = config.loading;
    image.decoding = 'async';
    return image;
  }

  function createCollagePresentation(category) {
    const images = collectImages(category.id);
    if (!images.length) return null;
    const collage = document.createElement('div');
    collage.className = `vj-category-collage count-${images.length}`;
    for (const src of images) {
      const item = document.createElement('span');
      item.className = 'vj-collage-item';
      const image = document.createElement('img');
      image.src = src;
      image.alt = '';
      image.loading = 'lazy';
      image.decoding = 'async';
      item.append(image);
      collage.append(item);
    }
    return collage;
  }

  function createCard(category, index) {
    const lang = language();
    const c = currentCopy();
    const palette = palettes[index % palettes.length];
    const article = document.createElement('article');
    article.className = 'showcase-card';
    article.dataset.categoryId = category.id;
    article.style.setProperty('--card-bg', palette[0]);
    article.style.setProperty('--card-text', palette[1]);
    article.style.setProperty('--card-muted', palette[2]);

    const inner = document.createElement('div');
    inner.className = 'showcase-card-inner';
    const cardCopy = document.createElement('div');
    cardCopy.className = 'showcase-card-copy';
    cardCopy.innerHTML = `<div class="showcase-card-eyebrow">${c.collection}</div><h2>${localize(category.title)}</h2><p>${descriptions[category.id]?.[lang] || (lang === 'uk' ? 'Вінтажні та колекційні предмети.' : 'Vintage and collectible objects.')}</p><button class="showcase-action" type="button">${c.explore}</button>`;
    const visual = document.createElement('div');
    visual.className = 'showcase-card-visual';
    visual.setAttribute('role', 'button');
    visual.setAttribute('tabindex', '0');
    visual.setAttribute('aria-label', `${c.explore}: ${localize(category.title)}`);

    const presentation = heroImages[category.id]
      ? createImagePresentation(category)
      : createCollagePresentation(category);
    if (presentation) {
      article.classList.add(heroImages[category.id] ? 'has-category-image' : 'has-vj-collage');
      visual.append(presentation);
    } else {
      article.classList.add('no-image');
    }

    inner.append(cardCopy, visual);
    article.append(inner);
    return article;
  }

  function bindShowcaseEvents(section, categories) {
    const categoryById = new Map(categories.map(category => [category.id, category]));
    section.addEventListener('click', event => {
      const cardTarget = event.target.closest('.showcase-card-visual, .showcase-card .showcase-action');
      if (cardTarget) {
        const card = cardTarget.closest('.showcase-card');
        const category = categoryById.get(card?.dataset.categoryId);
        if (category) openCategory(category);
        return;
      }
      const action = event.target.closest('[data-action]')?.dataset.action;
      if (action === 'all') openAll();
      if (action === 'new') openWorkspace('new');
      if (action === 'sold') openWorkspace('sold');
    });
    section.addEventListener('keydown', event => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      const visual = event.target.closest('.showcase-card-visual');
      if (!visual) return;
      event.preventDefault();
      const category = categoryById.get(visual.closest('.showcase-card')?.dataset.categoryId);
      if (category) openCategory(category);
    });
  }

  function renderShowcase() {
    document.querySelector('.category-showcase')?.remove();
    const c = currentCopy();
    const categories = usedCategories();
    const section = document.createElement('section');
    section.className = 'category-showcase';
    section.innerHTML = `<div class="showcase-intro"><div class="showcase-intro-inner"><div class="showcase-kicker">${c.kicker}</div><h1>${c.title}</h1><p>${c.lead}</p><div class="showcase-actions"><button class="showcase-action" data-action="all" type="button">${c.all}</button></div></div></div><div class="showcase-stack"></div><div class="showcase-specials"><article class="showcase-special"><h2>${c.newTitle}</h2><p>${c.newText}</p><button class="showcase-action" data-action="new" type="button">${c.newButton}</button></article><article class="showcase-special dark"><h2>${c.soldTitle}</h2><p>${c.soldText}</p><button class="showcase-action secondary" data-action="sold" type="button">${c.soldButton}</button></article></div>`;
    const stack = section.querySelector('.showcase-stack');
    categories.forEach((category, index) => stack.append(createCard(category, index)));
    bindShowcaseEvents(section, categories);
    document.querySelector('main')?.prepend(section);
    const title = document.querySelector('.vj-catalog-shell-title');
    if (title) title.textContent = c.catalog;
    const back = document.querySelector('.vj-back-showcase');
    if (back) back.textContent = c.back;
  }

  function prepareWorkspace() {
    const container = document.querySelector('main > .container');
    if (!container || byId('catalogWorkspace')) return;
    const shell = document.createElement('div');
    shell.id = 'catalogWorkspace';
    shell.className = 'vj-catalog-shell';
    container.parentNode.insertBefore(shell, container);
    shell.append(container);
    const head = document.createElement('div');
    head.className = 'vj-catalog-shell-close';
    head.innerHTML = '<strong class="vj-catalog-shell-title"></strong><button class="vj-back-showcase" type="button"></button>';
    container.prepend(head);
  }

  document.body.classList.add('vj-showcase-home');
  prepareWorkspace();
  renderShowcase();
  byId('languageButton')?.addEventListener('click', () => requestAnimationFrame(renderShowcase));
})();
