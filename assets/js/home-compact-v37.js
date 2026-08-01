(() => {
  'use strict';

  const data = window.VINTAGE_JAM_DATA || {};
  const byId = id => document.getElementById(id);
  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

  const paymentLogos = [
    ['privat24', '<svg viewBox="0 0 170 44" role="img" aria-label="PrivatBank"><rect x="1" y="1" width="42" height="42" rx="10" fill="#60b742"/><path d="M14 12h16c6 0 10 3 10 8 0 6-4 9-11 9h-7v6h-8V12Zm8 6v5h7c2 0 3-1 3-2.5S31 18 29 18h-7Z" fill="#fff"/><text x="52" y="29" font-family="Arial,sans-serif" font-size="20" font-weight="700" fill="#222">PrivatBank</text></svg>'],
    ['paypal', '<svg viewBox="0 0 150 44" role="img" aria-label="PayPal"><path d="M20 7h13c8 0 13 4 12 11-1 8-7 12-16 12h-5l-2 8H12L20 7Z" fill="#003087"/><path d="M29 11h12c7 0 11 4 10 10-1 7-7 11-15 11h-5l-2 7h-9l9-28Z" fill="#009cde" opacity=".9"/><text x="58" y="29" font-family="Arial,sans-serif" font-size="22" font-weight="700" fill="#003087">PayPal</text></svg>'],
    ['payoneer', '<svg viewBox="0 0 175 44" role="img" aria-label="Payoneer"><path d="M18 9c8 0 14 6 14 14s-6 14-14 14c-4 0-7-1-10-4l5-6c1 2 3 3 5 3 4 0 7-3 7-7s-3-7-7-7c-3 0-5 1-7 4L5 15c3-4 7-6 13-6Z" fill="#f58220"/><path d="M31 8c5 2 9 6 11 11l-7 3c-1-3-3-5-6-7l2-7Z" fill="#7ac143"/><text x="49" y="29" font-family="Arial,sans-serif" font-size="21" font-weight="700" fill="#111">Payoneer</text></svg>'],
    ['skrill', '<svg viewBox="0 0 125 44" role="img" aria-label="Skrill"><path d="M8 22 18 12l10 10-10 10L8 22Zm12 0 10-10 10 10-10 10-10-10Z" fill="#111"/><text x="49" y="29" font-family="Arial,sans-serif" font-size="22" font-weight="700" fill="#111">Skrill</text></svg>'],
    ['usdt', '<svg viewBox="0 0 150 44" role="img" aria-label="Tether USD₮"><circle cx="22" cy="22" r="20" fill="#26a17b"/><path d="M11 11h22v6h-8v3c7 .3 12 1.4 12 2.8S32 25.3 25 25.6V36h-6V25.6c-7-.3-12-1.4-12-2.8S12 20.3 19 20v-3h-8v-6Zm11 12c5 0 9-.4 9-.9s-4-.9-9-.9-9 .4-9 .9 4 .9 9 .9Z" fill="#fff"/><text x="51" y="29" font-family="Arial,sans-serif" font-size="20" font-weight="700" fill="#222">USD₮</text></svg>']
  ];

  const contactSvg = {
    telegram: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="#229ED9"/><path fill="#fff" d="m6 11 11-4-2 10-4-3-2 2v-3l6-4-7 3-2-1Z"/></svg>',
    phone: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="#1d1d1f"/><path fill="#fff" d="M8 5h3l1 4-2 1c1 2 2 3 4 4l1-2 4 1v3c0 2-2 3-4 2-5-1-8-4-10-9-1-2 1-4 3-4Z"/></svg>',
    email: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="#5f6368"/><path fill="#fff" d="M5 7h14v10H5V7Zm1 1 6 4 6-4H6Zm0 8h12V9l-6 4-6-4v7Z"/></svg>',
    youtube: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="#ff0033"/><path fill="#fff" d="m10 8 7 4-7 4V8Z"/></svg>',
    tiktok: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="#111"/><path fill="#25F4EE" d="M13 6h3c.3 1.5 1.2 2.4 3 2.7v3c-1.3 0-2.4-.4-3.4-1.1v5.1a5 5 0 1 1-4.3-5v3a2 2 0 1 0 1.7 2V6Z"/><path fill="#FE2C55" d="M12 6h3c.3 1.2 1 2 2 2.5v2.7c-.8-.2-1.5-.6-2.2-1.1v5.4a4.5 4.5 0 1 1-4-4.5v2.8a2 2 0 1 0 1.2 1.8V6Z"/><path fill="#fff" d="M13 6h2c.2 1.4 1 2.3 2.5 2.7v1.8c-1-.2-1.8-.6-2.5-1.2v6.1a3 3 0 1 1-3-3v2a1 1 0 1 0 1 1V6Z"/></svg>',
    whatsapp: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="#25D366"/><path fill="#fff" d="M7 18l1-3a6 6 0 1 1 2 2l-3 1Zm4-9c-.4-.8-.7-.8-1-.8-.4 0-.8.5-.8 1.2 0 2.2 2.4 4.6 4.8 5.2.7.2 1.4-.6 1.6-1.1.2-.5.1-.8-.2-.9l-1.7-.8c-.3-.1-.5 0-.7.3l-.5.7c-.2.2-.4.2-.7.1-1-.5-1.7-1.1-2.2-2-.1-.2 0-.4.1-.6l.5-.6c.2-.2.2-.4.1-.7L11 9Z"/></svg>'
  };

  function renderPayments() {
    const list = byId('paymentList');
    if (!list) return;
    list.className = 'payment-ribbon';
    list.innerHTML = paymentLogos.map(([id, logo]) => `<span class="payment-brand" data-payment="${id}">${logo}</span>`).join('');
  }

  function renderShipping() {
    const section = byId('shippingSection');
    if (!section) return;
    const en = document.documentElement.lang === 'en';
    section.className = 'shipping-ribbon';
    section.innerHTML = `
      <div class="shipping-ribbon-item"><span class="shipping-ribbon-icon">⌖</span><span>${en ? 'Shipping from Odesa' : 'Відправлення з Одеси'}</span></div>
      <div class="shipping-ribbon-item"><span class="shipping-ribbon-icon">→</span><span>${en ? 'Ukraine and worldwide' : 'Україна та весь світ'}</span></div>
      <div class="shipping-ribbon-item"><span class="shipping-ribbon-icon">▣</span><span>${en ? 'Secure packaging' : 'Надійне пакування'}</span></div>
      <span id="shippingTitle" hidden></span><span id="shippingIntro" hidden></span><span id="originTitle" hidden></span><span id="originText" hidden></span><span id="carriersTitle" hidden></span><span id="carriersText" hidden></span><span id="costTitle" hidden></span><span id="costText" hidden></span><span id="packingTitle" hidden></span><span id="packingText" hidden></span><span id="photosTitle" hidden></span><span id="photosText" hidden></span>`;
  }

  function contactLink({href, label, icon, value}) {
    const external = /^https?:/i.test(href);
    return `<a class="contact-icon-link" href="${escapeHtml(href)}"${external ? ' target="_blank" rel="noopener noreferrer"' : ''} aria-label="${escapeHtml(label)}" title="${escapeHtml(label)}"><span class="contact-icon-art">${contactSvg[icon]}</span><span class="contact-icon-label">${escapeHtml(value || label)}</span></a>`;
  }

  function renderContacts() {
    const list = byId('contactList');
    if (!list) return;
    const contacts = data.contacts || {};
    const phone = contacts.phone || '+380983219801';
    const telegram = contacts.telegram || 'https://t.me/NikolayKorolkov';
    const email = contacts.email || 'vintagejam@email.com';
    const youtube = contacts.youtube || 'https://youtube.com/@Vintage_Jam';
    const tiktok = 'https://www.tiktok.com/@master_seawolf';
    const whatsapp = `https://wa.me/${phone.replace(/\D/g, '')}`;
    list.className = 'contact-icon-row';
    list.innerHTML = [
      contactLink({href: telegram, label: 'Telegram', icon: 'telegram', value: 'Telegram'}),
      contactLink({href: `tel:${phone}`, label: 'Телефон', icon: 'phone', value: 'Телефон'}),
      contactLink({href: `mailto:${email}`, label: 'Email', icon: 'email', value: 'Email'}),
      contactLink({href: youtube, label: 'YouTube', icon: 'youtube', value: 'YouTube'}),
      contactLink({href: tiktok, label: 'TikTok', icon: 'tiktok', value: 'TikTok'}),
      contactLink({href: whatsapp, label: 'WhatsApp', icon: 'whatsapp', value: 'WhatsApp'})
    ].join('');
  }

  function renderAll() {
    renderShipping();
    renderPayments();
    renderContacts();
  }

  renderAll();
  byId('languageButton')?.addEventListener('click', () => requestAnimationFrame(renderShipping));
})();
