// Simülasyon motoru: her 2 sn'de değerleri günceller, değişiklikleri veritabanına yazar.
// Yalnızca schedule.start – schedule.stop saatleri arasında çalışır (varsayılan 05:00–23:00), her gün tekrarlar.
import path from 'node:path';
import { openStore, isWritable } from './store.mjs';

const TICK_MS = 2000;
const MIN_DELTA = 3;
const KEEP_MS = 60 * 60 * 1000;
const rand = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

export const isActive = (d, { start, stop }) => d.getHours() >= start && d.getHours() < stop;

export function createEngine({
  ids,
  dataParent,
  fallbackParent,
  rootName = 'devnet@0.0.0.0',
  schedule = { start: 5, stop: 23 },
  alwaysOn = false,
  log = console,
}) {
  const n = Object.fromEntries(ids.map((id) => [id, rand(1, 30)]));
  const opts = { dataParent, fallbackParent, rootName, log };
  let cpu = 8;
  let ram = 20;
  let history = [];
  let store = null;
  let active = null;
  let timer = null;
  let opening = false;
  let count = 0;

  async function open() {
    if (opening) return;
    opening = true;
    try {
      store = await openStore(opts);
      const old = await store.since(Date.now() - KEEP_MS, 2500);
      history = [...old, ...history.filter((t) => !old.some((o) => o.ts === t.ts))].sort((a, b) => a.ts - b.ts);
    } catch (e) {
      log.warn('[db] depo açılamadı, kayıtlar yalnızca bellekte tutulacak:', e?.message ?? e);
    } finally {
      opening = false;
    }
  }

  // Birincil klasör (ör. /sdcard/devnet@0.0.0.0) sonradan yazılabilir olduysa ona geç
  async function reopenIfPossible() {
    if (store?.primary) return false;
    if (!isWritable(path.join(dataParent, rootName))) return false;
    await open();
    return true;
  }

  function tick() {
    const now = new Date();
    const act = alwaysOn || isActive(now, schedule);
    if (act !== active) {
      active = act;
      log.log(act ? '[sim] başladı' : `[sim] durdu, ${String(schedule.start).padStart(2, '0')}:00'da yeniden başlayacak`);
    }
    if (++count % 30 === 0) reopenIfPossible().catch(() => {});
    if (!act) return;

    const ch = [];
    for (const id of ids) {
      const next = clamp(n[id] + (Math.random() < 0.06 ? rand(-14, 14) : rand(-3, 3)), 1, 40);
      if (Math.abs(next - n[id]) >= MIN_DELTA) ch.push({ id, d: next - n[id] });
      n[id] = next;
    }
    cpu = clamp(cpu + rand(-3, 3), 3, 35);
    ram = clamp(ram + rand(-1, 1), 16, 40);
    if (ch.length) {
      const t = { ts: now.getTime(), ch };
      history.push(t);
      store?.add(t).catch((e) => log.warn('[db] yazılamadı:', e?.message ?? e));
    }
    const cut = now.getTime() - KEEP_MS;
    while (history.length && history[0].ts < cut) history.shift();
  }

  return {
    async start() {
      await open();
      tick();
      timer = setInterval(tick, TICK_MS);
    },
    stop() { clearInterval(timer); },
    reopen: reopenIfPossible,
    state(since = 0) {
      return {
        now: Date.now(),
        active: !!active,
        schedule,
        store: store ? { kind: store.kind, path: store.path, primary: store.primary } : { kind: 'none', path: '', primary: false },
        cpu,
        ram,
        n,
        ticks: history.filter((t) => t.ts > since),
      };
    },
  };
}
