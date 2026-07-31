(() => {
  'use strict';

  const data = window.VINTAGE_JAM_DATA;
  if (!data) return;

  const paymentAssets = {
    privat24: { src: 'https://privatbank.ua/favicon.ico', alt: 'PrivatBank' },
    paypal: { src: 'https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_74x46.jpg', alt: 'PayPal' },
    payoneer: { src: 'https://www.payoneer.com/favicon.ico', alt: 'Payoneer' },
    skrill: { src: 'https://www.skrill.com/favicon.ico', alt: 'Skrill' },
    usdt: { src: 'https://tether.to/favicon.ico', alt: 'Tether USD₮' }
  };

  const svgIcon = type => {
    const icons = {
      phone: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#1d1d1f" d="M6.62 10.79a15.46 15.46 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24c1.12.37 2.33.57 3.57.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.61 21 3 13.39 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1.02l-2.2 2.2Z"/></svg>',
      email: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#1d1d1f" d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 4-8 5-8-5V6l8 5 8-5v2Z"/></svg>',
      youtube: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#ff0033" d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.6V8.4l6.3 3.6-6.3 3.6Z"/></svg>'
    };
    return icons[type] || '';
  };

  const isEnglish = () => document.documentElement.lang === 'en';

  function renderPayments() {
    const list = document.getElementById('paymentList');
    if (!list || !Array.isArray(data.payments)) return;
    list.replaceChildren();
    data.payments.forEach(payment => {
      const chip = document.createElement('div');
      chip.className = 'payment-chip';
      chip.dataset.payment = payment.id;

      const img = document.createElement('img');
      const asset = paymentAssets[payment.id];
      img.src = asset?.src || '';
      img.alt = asset?.alt || payment.label;
      img.loading = 'lazy';
      img.referrerPolicy = 'no-referrer';
      img.onerror = () => {
        img.remove();
        chip.dataset.fallback = payment.label.slice(0, 2).toUpperCase();
      };

      const label = document.createElement('span');
      label.textContent = payment.label;
      chip.append(img, label);
      list.append(chip);
    });
  }

  function contactItem({ href, labelUk, labelEn, value, type, externalImage }) {
    const link = document.createElement('a');
    link.className = 'footer-contact';
    link.href = href;
    if (/^https?:/i.test(href)) {
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    }

    const icon = document.createElement('span');
    icon.className = 'footer-contact-icon';
    if (externalImage) {
      const img = document.createElement('img');
      img.src = externalImage;
      img.alt = '';
      img.loading = 'lazy';
      icon.append(img);
    } else {
      icon.innerHTML = svgIcon(type);
    }

    const copy = document.createElement('span');
    copy.className = 'footer-contact-copy';
    const label = document.createElement('span');
    label.className = 'footer-contact-label';
    label.textContent = isEnglish() ? labelEn : labelUk;
    const text = document.createElement('span');
    text.className = 'footer-contact-value';
    text.textContent = value;
    copy.append(label, text);
    link.append(icon, copy);
    return link;
  }

  function renderContacts() {
    const list = document.getElementById('contactList');
    if (!list) return;
    list.replaceChildren();

    const telegramUrl = data.contacts?.telegram;
    const telegramName = telegramUrl ? '@' + telegramUrl.split('/').filter(Boolean).pop() : '';
    const phone = data.contacts?.phone || '';
    const email = data.contacts?.email || '';
    const youtube = data.contacts?.youtube || '';

    if (telegramUrl) list.append(contactItem({
      href: telegramUrl,
      labelUk: 'Telegram',
      labelEn: 'Telegram',
      value: telegramName,
      externalImage: 'https://telegram.org/img/t_logo.svg'
    }));
    if (phone) list.append(contactItem({
      href: `tel:${phone}`,
      labelUk: 'Телефон / Viber',
      labelEn: 'Phone / Viber',
      value: phone.replace(/^(\+380)(\d{2})(\d{3})(\d{2})(\d{2})$/, '$1 $2 $3 $2 $2'),
      type: 'phone'
    }));
    if (email) list.append(contactItem({
      href: `mailto:${email}`,
      labelUk: 'Електронна пошта',
      labelEn: 'Email',
      value: email,
      type: 'email'
    }));
    if (youtube) list.append(contactItem({
      href: youtube,
      labelUk: 'YouTube-канал',
      labelEn: 'YouTube channel',
      value: '@Vintage_Jam',
      type: 'youtube'
    }));
  }

  function renderText() {
    const en = isEnglish();
    const contactTitle = document.getElementById('footerContactsTitle');
    const paymentNote = document.getElementById('paymentNote');
    const contactNote = document.getElementById('contactNote');
    if (contactTitle) contactTitle.textContent = en ? 'Contact us' : 'Зв’язатися з нами';
    if (paymentNote) paymentNote.textContent = en ? 'Payment details are provided after the item and delivery are agreed.' : 'Реквізити надаємо після узгодження товару та доставки.';
    if (contactNote) contactNote.textContent = en ? 'Choose a convenient way to ask about an item.' : 'Оберіть зручний спосіб, щоб уточнити інформацію про товар.';
  }

  function renderAll() {
    renderPayments();
    renderContacts();
    renderText();
  }

  renderAll();
  document.getElementById('languageButton')?.addEventListener('click', () => requestAnimationFrame(renderAll));
})();
