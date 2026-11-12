import './style.css';
import { DISTROS } from './distros.js';
import { logoHTML } from './logo.js';
import stoppedIcon from './assets/server-clock.png';
import { getState, retryStorage, native, Devnet } from './api.js';

const PINNED = 'debian-13-trixie'; // ana sunucu: her zaman en üstte
const ROW = 36;
const VISIBLE = 8;
const TICK_MS = 60000;
const FEED_MAX = 8;
const WINDOW_MS = 5 * 60 * 1000; // +/− özeti için pencere
const KEEP_MS = 60 * 60 * 1000; // bellekte/yüklemede tutulan geçmiş

const $ = (s) => document.querySelector(s);
const rand = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const fan = (cls = '') =>
  `<svg class="fan ${cls}" viewBox="0 0 24 24" aria-hidden="true">${[0, 90, 180, 270]
    .map((a) => `<path transform="rotate(${a} 12 12)" d="M12 12C12 7 13 3 17 2.5C19.5 6 16.5 11 12 12Z"/>`)
    .join('')}</svg>`;

document.querySelectorAll('[data-fan]').forEach((el) => (el.outerHTML = fan(el.dataset.fan)));

// Navbar: tıklanan bağlantı aktif görünür
const navLinks = [...document.querySelectorAll('#nav a')];
navLinks.forEach((a) =>
  a.addEventListener('click', () => {
    navLinks.forEach((x) => x.removeAttribute('aria-current'));
    a.setAttribute('aria-current', 'true');
  })
);

const list = $('#list');
list.style.height = `${ROW * VISIBLE}px`;

const items = DISTROS.map((d) => {
  const li = document.createElement('li');
  li.className = `row hidden${d.id === PINNED ? ' pinned' : ''}`;
  const code = d.code ? `<small>${esc(d.code)}</small>` : '';
  li.innerHTML = `
    <i class="fill"></i>
    <span class="name" title="${esc(d.name)}">${logoHTML(d)}<span>${esc([d.family, d.version].filter(Boolean).join(' '))}${code}</span>${d.id === PINNED ? '<em class="pin">ana sunucu</em>' : ''}</span>
    <span class="gpus"><b class="n"></b>${fan()}</span>`;
  list.appendChild(li);
  return { ...d, n: 0, el: li, nEl: li.querySelector('.n'), fill: li.querySelector('.fill') };
});
const byId = new Map(items.map((s) => [s.id, s]));

let cpu = 0;
let ram = 0;
let query = '';
let history = []; // [{ ts, ch: [{ id, d }] }] — sunucudan (AxioDB) gelir
let loaded = false;
let lastTs = 0;
let server = null; // son sunucu durumu
let offline = false;

// ---------- Özet ve akış ----------
function summarize(ids) {
  const since = Date.now() - WINDOW_MS;
  let up = 0;
  let down = 0;
  for (const t of history) {
    if (t.ts < since) continue;
    for (const c of t.ch) {
      if (!ids.has(c.id)) continue;
      if (c.d > 0) up += c.d;
      else down -= c.d;
    }
  }
  return { up, down };
}

function feedEntries(ids, filtered) {
  const out = [];
  for (let i = history.length - 1; i >= 0 && out.length < FEED_MAX; i--) {
    let ch = history[i].ch.filter((c) => ids.has(c.id) && byId.has(c.id));
    ch.sort((a, b) => Math.abs(b.d) - Math.abs(a.d));
    if (!filtered) ch = ch.slice(0, 3);
    for (const c of ch) {
      if (out.length < FEED_MAX) out.push(c);
    }
  }
  return out;
}

const deltaHTML = (up, down) =>
  `<span class="delta down">−${down}</span><span class="delta up">+${up}</span>`;

function renderFeed(matches) {
  const filtered = query !== '';
  const ids = new Set(matches.map((s) => s.id));
  const entries = feedEntries(ids, filtered);
  $('#feed').innerHTML = entries.length
    ? entries
        .map((c) => `<li><span class="fname">${esc(byId.get(c.id).name)}</span><span class="delta ${c.d > 0 ? 'up' : 'down'}">${c.d > 0 ? '+' : '−'}${Math.abs(c.d)}</span></li>`)
        .join('')
    : '<li class="fname">Henüz değişiklik yok.</li>';

  const qsum = $('#qsum');
  const qline = $('#qline');
  qsum.hidden = qline.hidden = !filtered;
  if (!filtered) return;
  const { up, down } = summarize(ids);
  const html = `<span class="q">“${esc(query)}”</span> ${matches.length} dağıtım · toplam <b>${up + down}</b> değişiklik ${deltaHTML(up, down)}<small>son 5 dk</small>`;
  qsum.innerHTML = html;
  qline.innerHTML = html;
}

function render() {
  const ranked = [...items].sort((a, b) => (b.id === PINNED) - (a.id === PINNED) || b.n - a.n);
  const matches = ranked.filter((s) => s.name.toLowerCase().includes(query));
  const max = Math.max(1, ...matches.map((s) => s.n));

  ranked.forEach((s) => {
    const idx = matches.indexOf(s);
    const shown = idx >= 0 && idx < VISIBLE;
    s.el.style.transform = `translateY(${(shown ? idx : VISIBLE) * ROW}px)`;
    s.el.classList.toggle('hidden', !shown);
    s.nEl.textContent = s.n;
    s.fill.style.transform = `scaleX(${Math.max(0.12, s.n / max)})`;
    s.el.style.setProperty('--spin', `${clamp(2.4 - s.n * 0.055, 0.22, 2.4).toFixed(2)}s`);
  });
  $('#empty').hidden = matches.length > 0;

  $('#cpu-text').textContent = `${cpu}%`;
  $('#cpu-bar').style.width = `${cpu}%`;
  $('#ram-text').textContent = `${ram}/104 GB`;
  $('#ram-bar').style.width = `${(ram / 104) * 100}%`;
  renderFeed(matches);
}

const pad = (h) => String(h).padStart(2, '0');

function renderStatus() {
  const el = $('#status');
  const db = $('#dbline');
  if (offline) {
    el.hidden = false; el.className = 'status warn';
    el.textContent = 'Sunucuya bağlanılamıyor, yeniden deneniyor…';
  } else if (server && !server.active) {
    el.hidden = false; el.className = 'status';
    el.innerHTML = `<img class="sicon" src="${stoppedIcon}" alt="" /><span>Sistem şu an duruyor. Her gün ${pad(server.schedule.start)}:00–${pad(server.schedule.stop)}:00 arası çalışır, ${pad(server.schedule.start)}:00’te kendiliğinden yeniden başlar.</span>`;
  } else {
    el.hidden = true;
  }
  const stopped = !offline && !!server && !server.active;
  const fanEl = document.querySelector('.using .fan');
  const uIcon = $('#using-icon');
  uIcon.src = stoppedIcon;
  uIcon.hidden = !stopped;
  if (fanEl) fanEl.style.display = stopped ? 'none' : '';
  if (server?.store?.path) {
    db.hidden = false;
    const need = native && !server.store.primary;
    db.innerHTML = `Veritabanı (${esc(server.store.kind)}): ${esc(server.store.path)}` +
      (need ? ' — <b>dosya erişimi izni gerekli</b> <button type="button" id="grant">İzin ver</button>' : '');
  } else {
    db.hidden = true;
  }
}

async function poll() {
  try {
    const s = await getState(lastTs || Date.now() - KEEP_MS);
    offline = false;
    server = s;
    for (const it of items) if (s.n[it.id] != null) it.n = s.n[it.id];
    cpu = s.cpu;
    ram = s.ram;
    if (s.ticks.length) {
      history.push(...s.ticks.filter((t) => t.ts > lastTs));
      lastTs = history[history.length - 1].ts;
    }
    const cut = Date.now() - KEEP_MS;
    while (history.length && history[0].ts < cut) history.shift();
    loaded = true;
  } catch {
    offline = true;
  }
  renderStatus();
  if (loaded) render();
}

$('#q').addEventListener('input', (e) => {
  query = e.target.value.trim().toLowerCase();
  if (loaded) render();
});

$('#dbline').addEventListener('click', (e) => {
  if (e.target.id === 'grant' && Devnet) Devnet.requestStorageAccess().catch(() => {});
});
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) retryStorage();
});

// Android: arka planda çalışmaya devam etsin (ön plan servisi) ve pil kısıtından muaf tutulsun
if (native && Devnet) {
  Devnet.startKeepAlive().catch(() => {});
  if (!localStorage.getItem('batteryAsked')) {
    localStorage.setItem('batteryAsked', '1');
    Devnet.requestBatteryExemption().catch(() => {});
  }
}

poll();
setInterval(poll, TICK_MS);
