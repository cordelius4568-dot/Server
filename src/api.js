// Capacitor paketi içe aktarılmaz: Android WebView'da `window.Capacitor` kendiliğinden gelir,
// tarayıcıda (npm run dev) yoktur ve sayfa doğrudan Vite sunucusuna bağlanır.
const cap = window.Capacitor;
export const native = !!cap?.isNativePlatform?.();
const BASE = native ? 'http://127.0.0.1:5174' : '';
export const Devnet = native ? cap.Plugins?.Devnet ?? null : null;

export async function getState(since) {
  const r = await fetch(`${BASE}/api/state?since=${since}`, { cache: 'no-store' });
  if (!r.ok) throw new Error(r.status);
  return r.json();
}

export async function retryStorage() {
  try { await fetch(`${BASE}/api/storage/retry`, { method: 'POST' }); } catch { /* yoksay */ }
}
