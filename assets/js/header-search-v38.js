(() => {
  'use strict';

  const input = document.getElementById('searchInput');
  const actions = document.querySelector('.header-actions');
  const languageButton = document.getElementById('languageButton');
  if (!input || !actions || !languageButton) return;

  const search = document.createElement('div');
  search.className = 'header-search';

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'header-search-toggle';
  toggle.setAttribute('aria-label', 'Відкрити пошук');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-4-4"></path></svg>';

  const panel = document.createElement('div');
  panel.className = 'header-search-panel';

  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'header-search-close';
  close.setAttribute('aria-label', 'Закрити пошук');
  close.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"></path></svg>';

  input.remove();
  panel.append(input, close);
  search.append(toggle, panel);
  actions.insertBefore(search, languageButton);

  const setOpen = (open, focus = true) => {
    search.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    if (open && focus) requestAnimationFrame(() => input.focus());
  };

  toggle.addEventListener('click', () => setOpen(true));
  close.addEventListener('click', () => {
    if (input.value) {
      input.value = '';
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
    setOpen(false, false);
    toggle.focus();
  });

  input.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false, false);
      toggle.focus();
    }
  });

  document.getElementById('mobileSearch')?.addEventListener('click', () => setOpen(true));

  if (input.value.trim()) setOpen(true, false);
})();
