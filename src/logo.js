// src/logos/<slug>.svg dosyası varsa onu kullanır, yoksa renkli rozet çizer.
// Logolar `npm install` sırasında scripts/fetch-logos.mjs ile simple-icons'tan kopyalanır.
const files = import.meta.glob('./logos/*.svg', { eager: true, query: '?url', import: 'default' });

export function logoHTML(d) {
  const url = files[`./logos/${d.slug}.svg`];
  if (url) return `<img class="logo" src="${url}" alt="" width="20" height="20" loading="lazy" />`;
  const fg = d.dark ? '#0b0f19' : '#ffffff';
  const size = d.glyph.length > 1 ? 11 : 15;
  return `<svg class="logo" viewBox="0 0 28 28" aria-hidden="true">
    <circle cx="14" cy="14" r="13" fill="${d.color}"/>
    <text x="14" y="14.5" text-anchor="middle" dominant-baseline="central"
      font-family="system-ui, sans-serif" font-weight="700" font-size="${size}" fill="${fg}">${d.glyph}</text>
  </svg>`;
}
