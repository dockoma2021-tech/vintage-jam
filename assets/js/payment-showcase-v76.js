(() => {
  'use strict';

  const methods = [
    ['privatbank', 'PrivatBank'],
    ['paypal', 'PayPal'],
    ['payoneer', 'Payoneer'],
    ['skrill', 'Skrill'],
    ['usdt', 'USDT']
  ];

  const render = () => {
    const list = document.getElementById('paymentList');
    if (!list) return;
    list.replaceChildren();
    methods.forEach(([brand, label]) => {
      const item = document.createElement('div');
      item.className = 'payment-brand';
      item.dataset.brand = brand;
      item.setAttribute('aria-label', label);

      const mark = document.createElement('span');
      mark.className = 'payment-brand-mark';
      mark.setAttribute('aria-hidden', 'true');

      const name = document.createElement('span');
      name.className = 'payment-brand-name';
      name.textContent = label;

      item.append(mark, name);
      list.append(item);
    });
  };

  render();
  window.addEventListener('DOMContentLoaded', render, { once: true });
})();
