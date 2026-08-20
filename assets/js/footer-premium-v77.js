(() => {
  'use strict';

  const data = window.VINTAGE_JAM_DATA || {};
  const byId = id => document.getElementById(id);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));

  const icons = {
    telegram: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.7 11.2 19.6 5c.7-.3 1.3.2 1 1l-2.7 13c-.2.9-1 1.1-1.7.6l-4.1-3-2 1.9c-.2.2-.4.4-.8.4l.3-4.2 7.7-7c.3-.3-.1-.5-.5-.2l-9.5 6-4.1-1.3c-.9-.3-.9-.9.5-1.4Z" fill="currentColor"/></svg>',
    phone: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.1 3.8 10 3l2 5.1-2.3 1.2c1.1 2.4 2.7 4 5.1 5.1L16 12l5 2c-.1 4-2.3 6.1-5.7 5.4C9.2 18.2 5.8 14.8 4.6 8.7 4 5.7 5.3 4.2 7.1 3.8Z" fill="currentColor"/></svg>',
    email: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5" width="17" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="m5 7 7 5 7-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    youtube: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.4 7.1c-.2-1-1-1.8-2-2C16.6 4.6 12 4.6 12 4.6s-4.6 0-6.4.5c-1 .2-1.8 1-2 2C3.1 8.9 3.1 12 3.1 12s0 3.1.5 4.9c.2 1 1 1.8 2 2 1.8.5 6.4.5 6.4.5s4.6 0 6.4-.5c1-.2 1.8-1 2-2 .5-1.8.5-4.9.5-4.9s0-3.1-.5-4.9Z" fill="currentColor"/><path d="m10 15.5 5-3.5-5-3.5v7Z" fill="#fff"/></svg>',
    tiktok: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.2 3h3.1c.3 1.8 1.4 3 3.2 3.5v3.1c-1.3 0-2.4-.4-3.5-1.1v6.3a5.8 5.8 0 1 1-5.1-5.7v3.1a2.7 2.7 0 1 0 2.3 2.7V3Z" fill="currentColor"/></svg>',
    whatsapp: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.7-1.2A9 9 0 1 0 12 3Zm0 16.3a7.3 7.3 0 0 1-3.7-1L5.6 19l.7-2.6A7.3 7.3 0 1 1 12 19.3Z" fill="currentColor"/><path d="M8.5 8.2c.2-.5.5-.5.8-.5h.7l1 2.3c.1.3.1.5-.1.7l-.8.9c-.2.2-.2.4 0 .7.7 1.3 1.7 2.3 3 3 .3.2.5.1.7-.1l.9-1.1c.2-.3.5-.3.8-.2l2.2 1c.3.1.5.3.5.6 0 .4-.2 1.5-1 2.2-.7.6-1.6.8-2.4.6-1.1-.3-2.5-.9-4.1-2.3-1.9-1.7-3.2-3.8-3.5-5.3-.2-1 .1-1.8.4-2.5Z" fill="currentColor"/></svg>'
  };

  function language() {
    return document.documentElement.lang === 'en' ? 'en' : 'uk';
  }

  function ensureHead(panel, title, subtitle) {
    if (!panel) return;
    let head = panel.querySelector('.vj-footer-panel-head');
    if (!head) {
      head = document.createElement('div');
      head.className = 'vj-footer-panel-head';
      panel.prepend(head);
    }
    head.innerHTML = `<h2 class="vj-footer-panel-title">${esc(title)}</h2><p class="vj-footer-panel-subtitle">${esc(subtitle)}</p>`;
  }

  function contactLink({href, label, icon}) {
    const external = /^https?:/i.test(href);
    return `<a class="contact-icon-link" href="${esc(href)}"${external ? ' target="_blank" rel="noopener noreferrer"' : ''} aria-label="${esc(label)}" title="${esc(label)}"><span class="contact-icon-art">${icons[icon]}</span><span class="contact-icon-label">${esc(label)}</span></a>`;
  }

  function renderContacts() {
    const list = byId('contactList');
    const panel = list?.closest('.contacts-panel');
    if (!list || !panel) return;
    const contacts = data.contacts || {};
    const phone = contacts.phone || '+380983219801';
    const telegram = contacts.telegram || 'https://t.me/NikolayKorolkov';
    const email = contacts.email || 'vintagejam@email.com';
    const youtube = contacts.youtube || 'https://youtube.com/@Vintage_Jam';
    const tiktok = contacts.tiktok || 'https://www.tiktok.com/@vintagejam_ua';
    const whatsapp = `https://wa.me/${phone.replace(/\D/g, '')}`;
    list.className = 'contact-icon-row';
    list.innerHTML = [
      contactLink({href: telegram, label: 'Telegram', icon: 'telegram'}),
      contactLink({href: `tel:${phone}`, label: language() === 'en' ? 'Phone' : 'Телефон', icon: 'phone'}),
      contactLink({href: `mailto:${email}`, label: 'Email', icon: 'email'}),
      contactLink({href: youtube, label: 'YouTube', icon: 'youtube'}),
      contactLink({href: tiktok, label: 'TikTok', icon: 'tiktok'}),
      contactLink({href: whatsapp, label: 'WhatsApp', icon: 'whatsapp'})
    ].join('');
  }

  function renderHeads() {
    const en = language() === 'en';
    ensureHead(document.querySelector('.payment-panel'), en ? 'Payment methods' : 'Способи оплати', en ? 'Convenient and secure payment options' : 'Зручні та безпечні способи оплати');
    ensureHead(document.querySelector('.contacts-panel'), en ? 'Contact us' : 'Зв’язатися з нами', en ? 'We are always in touch' : 'Ми завжди на зв’язку');
  }

  function render() {
    renderHeads();
    renderContacts();
  }

  render();
  window.addEventListener('DOMContentLoaded', render, { once: true });
  byId('languageButton')?.addEventListener('click', () => requestAnimationFrame(render));
})();
