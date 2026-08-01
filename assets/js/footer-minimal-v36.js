(() => {
  'use strict';
  const data = window.VINTAGE_JAM_DATA;
  if (!data) return;

  const icon = type => ({
    telegram:'<svg viewBox="0 0 24 24"><path fill="#229ED9" d="M21.7 3.4 18.5 20c-.2 1.1-.9 1.4-1.8.9l-4.9-3.6-2.4 2.3c-.3.3-.5.5-1 .5l.4-5 9.1-8.2c.4-.4-.1-.6-.6-.2L6.1 13.8 1.3 12.3c-1-.3-1.1-1 .2-1.5L20.3 3.5c.9-.3 1.6.2 1.4-.1Z"/></svg>',
    phone:'<svg viewBox="0 0 24 24"><path fill="#1d1d1f" d="M6.6 10.8a15.5 15.5 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.2c1.1.4 2.3.6 3.6.6a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.6 21 3 13.4 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.3.2 2.5.6 3.6a1 1 0 0 1-.3 1l-2.2 2.2Z"/></svg>',
    email:'<svg viewBox="0 0 24 24"><path fill="#1d1d1f" d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 4-8 5-8-5V6l8 5 8-5v2Z"/></svg>',
    youtube:'<svg viewBox="0 0 24 24"><path fill="#FF0033" d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.6V8.4l6.3 3.6-6.3 3.6Z"/></svg>',
    tiktok:'<svg viewBox="0 0 24 24"><path fill="#111" d="M16.7 3c.4 2.4 1.8 3.8 4.3 4v3.2a8.7 8.7 0 0 1-4.3-1v6.1a6.3 6.3 0 1 1-5.4-6.2v3.3a3 3 0 1 0 2.1 2.9V3h3.3Z"/></svg>',
    whatsapp:'<svg viewBox="0 0 24 24"><path fill="#25D366" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 17.8a7.8 7.8 0 0 1-4-1.1l-.3-.2-3 .8.8-2.9-.2-.3A7.8 7.8 0 1 1 12 19.8Zm4.3-5.8c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.6.1l-.7.9c-.1.2-.3.2-.5.1a6.4 6.4 0 0 1-1.9-1.2 7.2 7.2 0 0 1-1.3-1.7c-.1-.2 0-.4.1-.5l.4-.5.2-.4c.1-.1.1-.3 0-.4l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.3.3-1 1-1 2.4s1 2.8 1.2 3c.1.2 2 3.1 5 4.2.7.3 1.2.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.4-.6 1.6-1.2.2-.6.2-1.1.1-1.2-.1-.1-.3-.2-.5-.3Z"/></svg>'
  })[type] || '';

  function paymentLogo(id,label){
    const el=document.createElement('div'); el.className='payment-logo'; el.dataset.payment=id; el.title=label;
    if(id==='payoneer') el.innerHTML='<svg viewBox="0 0 270 62" aria-label="Payoneer"><text x="0" y="44" font-family="Arial,sans-serif" font-size="42" font-weight="700" fill="#222">payoneer</text><path d="M235 8c15 2 25 10 30 24" fill="none" stroke="#ff4800" stroke-width="5" stroke-linecap="round"/></svg>';
    else if(id==='skrill') el.innerHTML='<svg viewBox="0 0 150 48" aria-label="Skrill"><path fill="#111" d="m8 24 13-13 13 13-13 13zm18 0 13-13 13 13-13 13z"/><text x="59" y="34" font-family="Arial,sans-serif" font-size="31" font-weight="700" fill="#111">Skrill</text></svg>';
    else { const img=document.createElement('img'); const src={privat24:'https://privatbank.ua/favicon.ico',paypal:'https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_74x46.jpg',usdt:'https://tether.to/favicon.ico'}[id]; img.src=src||''; img.alt=label; img.loading='lazy'; el.append(img); }
    return el;
  }

  function renderPayments(){ const list=document.getElementById('paymentList'); if(!list)return; list.replaceChildren(); (data.payments||[]).forEach(p=>list.append(paymentLogo(p.id,p.label))); }
  function contact(href,label,value,type){ const a=document.createElement('a'); a.className='footer-contact'; a.href=href; if(/^https?:/.test(href)){a.target='_blank';a.rel='noopener noreferrer';} a.innerHTML=`<span class="footer-contact-icon">${icon(type)}</span><span class="footer-contact-copy"><span class="footer-contact-label">${label}</span><span class="footer-contact-value">${value}</span></span>`; return a; }
  function renderContacts(){
    const list=document.getElementById('contactList'); if(!list)return; list.replaceChildren();
    const phone=data.contacts?.phone||'+380983219801'; const digits=phone.replace(/\D/g,'');
    const tg=data.contacts?.telegram||'https://t.me/VintageJamSale';
    const email=data.contacts?.email||'vintagejam@email.com';
    const yt=data.contacts?.youtube||'https://youtube.com/@Vintage_Jam';
    list.append(
      contact(tg,'Telegram','@'+tg.split('/').filter(Boolean).pop(),'telegram'),
      contact(`tel:${phone}`,'Телефон',phone,'phone'),
      contact(`mailto:${email}`,'Email',email,'email'),
      contact(yt,'YouTube','@Vintage_Jam','youtube'),
      contact('https://www.tiktok.com/@master_seawolf','TikTok','@master_seawolf','tiktok'),
      contact(`https://wa.me/${digits}`,'WhatsApp',phone,'whatsapp')
    );
  }
  renderPayments(); renderContacts();
})();