(() => {
  'use strict';
  const button = document.getElementById('purchaseLanguage');
  if (!button) return;

  const text = {
    uk: {
      back: '← До каталогу', eyebrow: 'Покупка без зайвих кроків', title: 'Як придбати товар',
      lead: 'Оберіть товар у каталозі та напишіть нам зручним способом. Ми підтвердимо наявність, відповімо на запитання й узгодимо оплату та доставку.',
      s1t: 'Оберіть товар', s1x: 'Відкрийте картку предмета та скопіюйте посилання або його назву.',
      s2t: 'Зв’яжіться з нами', s2x: 'Напишіть у Telegram, WhatsApp, email або зателефонуйте.',
      s3t: 'Узгодьте деталі', s3x: 'Підтверджуємо стан, комплектність, вартість, оплату та спосіб доставки.',
      contact: 'Способи зв’язку', contactSub: 'Натисніть на зручний сервіс — він відкриється одразу.', phone: 'Телефон',
      note: 'Перед оплатою', noteText: 'Ми додатково підтвердимо актуальну наявність товару та надішлемо реквізити. Не здійснюйте оплату на сторонні рахунки, які не були надані безпосередньо через офіційні контакти Vintage Jam.',
      shipping: 'Умови доставки та пакування →'
    },
    en: {
      back: '← Back to catalog', eyebrow: 'A simple buying process', title: 'How to buy an item',
      lead: 'Choose an item in the catalog and contact us using any convenient method. We will confirm availability, answer your questions, and arrange payment and delivery.',
      s1t: 'Choose an item', s1x: 'Open the product page and copy its link or title.',
      s2t: 'Contact us', s2x: 'Message us on Telegram, WhatsApp, email, or call us.',
      s3t: 'Confirm the details', s3x: 'We confirm condition, completeness, price, payment, and shipping method.',
      contact: 'Contact options', contactSub: 'Select a service and it will open immediately.', phone: 'Phone',
      note: 'Before payment', noteText: 'We will reconfirm current availability and send payment details. Do not pay to third-party accounts that were not provided directly through Vintage Jam official contacts.',
      shipping: 'Shipping and packaging terms →'
    }
  };

  const ids = {
    purchaseBack:'back', purchaseEyebrow:'eyebrow', purchaseTitle:'title', purchaseLead:'lead',
    stepOneTitle:'s1t', stepOneText:'s1x', stepTwoTitle:'s2t', stepTwoText:'s2x',
    stepThreeTitle:'s3t', stepThreeText:'s3x', contactHeading:'contact', contactSubheading:'contactSub',
    phoneLabel:'phone', noteTitle:'note', noteText:'noteText', shippingLink:'shipping'
  };

  let lang = localStorage.getItem('vjLanguage') === 'en' ? 'en' : 'uk';
  const render = () => {
    document.documentElement.lang = lang;
    button.textContent = lang.toUpperCase();
    Object.entries(ids).forEach(([id,key]) => {
      const el = document.getElementById(id);
      if (el) el.textContent = text[lang][key];
    });
  };
  button.addEventListener('click', () => {
    lang = lang === 'uk' ? 'en' : 'uk';
    localStorage.setItem('vjLanguage', lang);
    render();
  });
  render();
})();
