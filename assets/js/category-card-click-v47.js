(() => {
  'use strict';

  const install = () => {
    document.querySelectorAll('.showcase-stack .showcase-card').forEach(card => {
      const visual = card.querySelector('.showcase-card-visual');
      const button = card.querySelector('.showcase-action');
      if (!visual || !button || visual.dataset.categoryClick === '1') return;

      visual.dataset.categoryClick = '1';
      visual.style.pointerEvents = 'auto';
      visual.style.cursor = 'pointer';
      visual.setAttribute('role', 'button');
      visual.setAttribute('tabindex', '0');
      visual.setAttribute('aria-label', button.textContent.trim());

      const openCategory = event => {
        if (event.type === 'keydown' && event.key !== 'Enter' && event.key !== ' ') return;
        if (event.type === 'keydown') event.preventDefault();
        button.click();
      };

      visual.addEventListener('click', openCategory);
      visual.addEventListener('keydown', openCategory);
    });
  };

  window.addEventListener('DOMContentLoaded', () => {
    install();

    const stack = document.querySelector('.showcase-stack');
    if (stack) {
      new MutationObserver(install).observe(stack, { childList: true, subtree: true });
    }

    document.getElementById('languageButton')?.addEventListener('click', () => setTimeout(install, 0));
  });
})();
