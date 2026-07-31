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
        notify(`Товар збережено локально. Ціна: ${amount} ${currency.value || 'UAH'}`);
      } else {
        notify('Товар збережено локально. Ціна: за запитом');
      }
    }, 80);
  });

  priceValue.disabled = priceType.value !== 'fixed';

  document.title = 'Vintage Jam — Admin 3.2';
  const version = document.querySelector('.admin-header span');
  if (version) version.textContent = 'Admin 3.2';
  const intro = document.querySelector('.admin-intro p:not(.eyebrow)');
  if (intro) intro.textContent = 'Заповніть або відредагуйте товар і натисніть «Зберегти й опублікувати». Файли та фотографії оновляться автоматично.';

  const script = document.createElement('script');
  script.src = `assets/js/admin-direct-publish-v32.js?v=3.2.0-${Date.now()}`;
  script.onerror = () => notify('Не вдалося завантажити модуль прямої публікації');
  document.head.append(script);
})();
