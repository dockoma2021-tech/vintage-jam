(() => {
  'use strict';

  const clamp = value => Math.max(0, Math.min(255, Math.round(value)));

  function blendWithWhite([r, g, b], amount = 0.05) {
    return [
      clamp(r + (255 - r) * amount),
      clamp(g + (255 - g) * amount),
      clamp(b + (255 - b) * amount)
    ];
  }

  function sampleEdgeColor(image) {
    if (!image.naturalWidth || !image.naturalHeight) return null;
    const canvas = document.createElement('canvas');
    const size = 48;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return null;

    ctx.drawImage(image, 0, 0, size, size);
    const { data } = ctx.getImageData(0, 0, size, size);
    const points = [];
    const margin = 3;
    const step = 4;

    const pushPixel = (x, y) => {
      const i = (y * size + x) * 4;
      if (data[i + 3] < 200) return;
      points.push([data[i], data[i + 1], data[i + 2]]);
    };

    for (let x = margin; x < size - margin; x += step) {
      pushPixel(x, margin);
      pushPixel(x, size - 1 - margin);
    }
    for (let y = margin + step; y < size - margin - step; y += step) {
      pushPixel(margin, y);
      pushPixel(size - 1 - margin, y);
    }

    if (!points.length) return null;

    const luminance = ([r, g, b]) => 0.2126 * r + 0.7152 * g + 0.0722 * b;
    points.sort((a, b) => luminance(a) - luminance(b));
    const trimmed = points.slice(Math.floor(points.length * 0.15), Math.ceil(points.length * 0.85));
    const avg = trimmed.reduce((sum, rgb) => [sum[0] + rgb[0], sum[1] + rgb[1], sum[2] + rgb[2]], [0, 0, 0])
      .map(total => total / trimmed.length);

    return blendWithWhite(avg, 0.04);
  }

  function apply(image) {
    const card = image.closest('.showcase-card');
    if (!card) return;
    try {
      const rgb = sampleEdgeColor(image);
      if (!rgb) return;
      const value = `rgb(${rgb[0]} ${rgb[1]} ${rgb[2]})`;
      card.style.setProperty('--vj-category-bg', value);
    } catch (_) {
      // Keep the existing category palette if the image cannot be sampled.
    }
  }

  function bindImage(image) {
    if (image.dataset.vjBgBound === '1') return;
    image.dataset.vjBgBound = '1';
    if (image.complete && image.naturalWidth) apply(image);
    else image.addEventListener('load', () => apply(image), { once: true });
  }

  function scan(root = document) {
    root.querySelectorAll?.('.showcase-card .showcase-hero-image').forEach(bindImage);
  }

  scan();
  window.addEventListener('DOMContentLoaded', () => scan(), { once: true });

  const observer = new MutationObserver(records => {
    for (const record of records) {
      record.addedNodes.forEach(node => {
        if (!(node instanceof Element)) return;
        if (node.matches('.showcase-hero-image')) bindImage(node);
        scan(node);
      });
    }
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();
