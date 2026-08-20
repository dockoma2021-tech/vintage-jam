(() => {
  'use strict';
  const source = 'assets/images/brand/vintage-jam-logo-header.b64?v=6.1.0';
  fetch(source, {cache:'force-cache'})
    .then(r => r.ok ? r.text() : Promise.reject(new Error('logo-load-failed')))
    .then(b64 => {
      const value = b64.trim();
      if (!value) return;
      document.documentElement.style.setProperty('--vj-logo', `url("data:image/png;base64,${value}")`);
    })
    .catch(() => {});
})();
