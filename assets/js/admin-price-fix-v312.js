(() => {
  'use strict';

  const form = document.getElementById('productForm');
  if (!form) return;

  const fields = form.elements;
  const priceValue = fields.price_value;
  const priceType = fields.price_type;
  const currency = fields.price_currency;
  const toast = document.getElementById('toast');

  const notify = text => {
    if (!toast) return;
    toast.textContent = text;
    toast.hidden = false;
    clearTimeout(notify.timer);
    notify.timer = setTimeout(() => { toast.hidden = true; }, 3200);
  };

  priceValue.addEventListener('input', () => {
    if (String(priceValue.value).trim() !== '') {
      priceType.value = 'fixed';
      priceType.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });

  priceType.addEventListener('change', () => {
    priceValue.disabled = priceType.value !== 'fixed';
    priceValue.closest('label')?.classList.toggle('field-disabled', priceValue.disabled);
  });

  form.addEventListener('submit', () => {
    setTimeout(() => {
      const amount = String(priceValue.value).trim();
      if (priceType.value === 'fixed' && amount !== '') {
        notify(`Товар сохранён. Цена: ${amount} ${currency.value || 'UAH'}`);
      } else {
        notify('Товар сохранён. Цена: по запросу');
      }
    }, 80);
  });

  priceValue.disabled = priceType.value !== 'fixed';
})();
