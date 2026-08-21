(() => {
  'use strict';

  const data = window.VINTAGE_JAM_DATA;
  if (!data || !Array.isArray(data.products)) return;

  const productId = new URLSearchParams(window.location.search).get('id');
  const product = data.products.find(item => item.id === productId && item.publication_status === 'published');
  if (!product || product.category !== 'knives') return;

  const byId = id => document.getElementById(id);

  const applyKnivesDisplayGuard = () => {
    const contactButton = byId('contactButton');
    if (contactButton) contactButton.hidden = true;

    const mobileContactButton = byId('mobileContactButton');
    if (mobileContactButton) mobileContactButton.hidden = true;

    const contactSheet = byId('contactSheet');
    if (contactSheet) contactSheet.hidden = true;

    const contactMethods = byId('contactMethods');
    if (contactMethods) contactMethods.replaceChildren();

    const deliveryCard = byId('deliveryTitle')?.closest('.content-card');
    if (deliveryCard) deliveryCard.hidden = true;

    const content = byId('productContent');
    if (content) {
      delete content.dataset.vjInformational;
      content.dataset.vjKnivesDisplayGuard = '1';
    }
  };

  applyKnivesDisplayGuard();
  byId('languageButton')?.addEventListener('click', () => requestAnimationFrame(applyKnivesDisplayGuard));
})();
