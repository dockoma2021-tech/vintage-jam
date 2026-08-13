(() => {
  'use strict';
  function applyPaintingsHero() {
    const card = document.querySelector('.showcase-stack .showcase-card:first-child');
    if (!card) return;
    card.classList.add('paintings-showcase');
    const img = card.querySelector('.showcase-card-image');
    if (!img) return;
    img.src = 'assets/images/categories/paintings-collage-v1.svg?v=2';
    img.loading = 'eager';
    img.onerror = function () {
      this.onerror = null;
      this.src = 'images/products/vj-000002/01.webp';
    };
  }
  applyPaintingsHero();
  document.getElementById('languageButton')?.addEventListener('click', () => setTimeout(applyPaintingsHero, 0));
})();
