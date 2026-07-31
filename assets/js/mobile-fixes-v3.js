(() => {
  'use strict';

  const style = document.createElement('style');
  style.textContent = `
    @media (max-width: 640px) {
      body {
        padding-bottom: calc(96px + env(safe-area-inset-bottom));
      }

      .product-page {
        padding-top: 14px;
        padding-bottom: calc(112px + env(safe-area-inset-bottom));
      }

      .product-page .container {
        width: 100%;
        padding-inline: 20px;
      }

      .back-link {
        margin-bottom: 16px;
      }

      .product-gallery,
      .gallery-main {
        width: 100%;
        min-width: 0;
      }

      .gallery-main {
        aspect-ratio: 1 / 1;
        height: auto;
        min-height: 0;
        max-height: none;
      }

      .gallery-main img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        object-position: 50% 50%;
      }

      .thumbnails {
        margin-top: 12px;
        padding-bottom: 4px;
      }

      .product-summary h1 {
        font-size: clamp(30px, 10vw, 42px);
        line-height: 1.04;
        margin-top: 8px;
      }

      .product-details {
        margin-bottom: 24px;
      }

      .mobile-nav {
        min-height: 72px;
      }
    }

    @media (max-width: 390px) {
      .product-page .container {
        padding-inline: 14px;
      }
    }
  `;
  document.head.append(style);

  const syncLanguageLabel = () => {
    const button = document.getElementById('languageButton');
    if (!button) return;
    button.textContent = document.documentElement.lang === 'en' ? 'EN' : 'UA';
  };

  syncLanguageLabel();
  new MutationObserver(syncLanguageLabel).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['lang']
  });

  document.getElementById('languageButton')?.addEventListener('click', () => {
    requestAnimationFrame(syncLanguageLabel);
  });
})();
