(() => {
  'use strict';

  const controls = document.querySelector('.controls');
  const input = document.getElementById('searchInput');
  const sort = document.getElementById('sortSelect');
  if (!controls || !input || !sort) return;

  const style = document.createElement('style');
  style.textContent = `
    .controls {
      display: grid;
      grid-template-columns: auto minmax(170px, 240px);
      align-items: center;
      justify-content: end;
      gap: 10px;
    }

    .search-control {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      min-width: 44px;
    }

    .search-toggle,
    .search-close {
      width: 44px;
      height: 44px;
      flex: 0 0 44px;
      display: inline-grid;
      place-items: center;
      border: 1px solid var(--line, #d2d2d7);
      border-radius: 999px;
      background: var(--surface, #fff);
      color: var(--text, #1d1d1f);
      cursor: pointer;
      transition: background .2s ease, transform .2s ease, border-color .2s ease;
    }

    .search-toggle:hover,
    .search-close:hover {
      background: var(--surface-muted, #f5f5f7);
    }

    .search-toggle:active,
    .search-close:active {
      transform: scale(.96);
    }

    .search-toggle svg,
    .search-close svg {
      width: 20px;
      height: 20px;
      fill: none;
      stroke: currentColor;
      stroke-width: 1.8;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .search-panel {
      width: 0;
      opacity: 0;
      overflow: hidden;
      pointer-events: none;
      display: flex;
      align-items: center;
      gap: 8px;
      transform: translateX(8px);
      transition: width .28s ease, opacity .2s ease, transform .28s ease;
    }

    .search-control.is-open .search-toggle {
      display: none;
    }

    .search-control.is-open .search-panel {
      width: min(440px, 48vw);
      opacity: 1;
      pointer-events: auto;
      transform: translateX(0);
    }

    .search-panel #searchInput {
      width: 100%;
      min-width: 0;
      margin: 0;
    }

    @media (max-width: 640px) {
      .controls {
        grid-template-columns: auto 1fr;
        justify-content: stretch;
      }

      .search-control {
        justify-content: flex-start;
      }

      .search-control.is-open {
        grid-column: 1 / -1;
        width: 100%;
      }

      .search-control.is-open .search-panel {
        width: 100%;
      }

      .search-control.is-open + #sortSelect {
        grid-column: 1 / -1;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .search-panel,
      .search-toggle,
      .search-close {
        transition: none;
      }
    }
  `;
  document.head.append(style);

  const searchControl = document.createElement('div');
  searchControl.className = 'search-control';

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'search-toggle';
  toggle.setAttribute('aria-label', 'Відкрити пошук');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-4-4"></path></svg>';

  const panel = document.createElement('div');
  panel.className = 'search-panel';

  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'search-close';
  close.setAttribute('aria-label', 'Закрити пошук');
  close.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"></path></svg>';

  input.parentNode.insertBefore(searchControl, input);
  searchControl.append(toggle, panel);
  panel.append(input, close);

  const setOpen = (open, focus = true) => {
    searchControl.classList.toggle('is-open', open);
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

  document.getElementById('mobileSearch')?.addEventListener('click', () => {
    setOpen(true);
    controls.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  if (input.value.trim()) setOpen(true, false);
})();
