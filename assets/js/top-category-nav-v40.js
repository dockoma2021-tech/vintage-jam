(() => {
  'use strict';

  const headerInner = document.querySelector('.site-header-inner');
  const categories = document.getElementById('categories');
  const categoriesSection = document.getElementById('categoriesSection');
  const brand = document.querySelector('.brand');
  const actions = document.querySelector('.header-actions');
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
