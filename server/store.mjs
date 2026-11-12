// Değişiklik geçmişi deposu: önce AxioDB, olmazsa dosya (ndjson). Klasör: <dataParent>/<rootName>
import fs from 'node:fs';
import path from 'node:path';

export function isWritable(dir) {
  try {
    fs.mkdirSync(dir, { recursive: true });
    const f = path.join(dir, '.write-test');
    fs.writeFileSync(f, '');
    fs.unlinkSync(f);
    return true;
  } catch {
    return false;
  }
}

const unwrap = (r) => {
  const d = r?.data;
  if (Array.isArray(d)) return d;
  return d?.documents ?? d?.docs ?? [];
};

async function openAxio(parent, rootName) {
  const mod = await import('axiodb');
  const AxioDB = mod.AxioDB ?? mod.default?.AxioDB ?? mod.default;
  let inst;
  try { inst = new AxioDB(false, rootName, parent); } catch { inst = new AxioDB(); }
  const db = await inst.createDB('distro_durum');
  const col = await db.createCollection('ticks', false);
  return {
    kind: 'axiodb',
    async add(doc) { await col.insert(doc); },
    async since(ts, limit) {
      const r = await col.query({ ts: { $gte: ts } }).Sort({ ts: -1 }).Limit(limit).exec();
      return unwrap(r).map(({ ts, ch }) => ({ ts, ch })).reverse();
    },
  };
}

function openFile(root) {
  const file = path.join(root, 'ticks.ndjson');
  return {
    kind: 'file',
    async add(doc) { fs.appendFileSync(file, JSON.stringify(doc) + '\n'); },
    async since(ts, limit) {
      if (!fs.existsSync(file)) return [];
      const rows = fs.readFileSync(file, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l));
      return rows.filter((r) => r.ts >= ts).slice(-limit);
    },
  };
}

export async function openStore({ dataParent, fallbackParent, rootName, log = console }) {
  let parent = dataParent;
  let primary = true;
  if (!isWritable(path.join(parent, rootName))) {
    log.warn(`[db] ${path.join(parent, rootName)} yazılamıyor, geçici klasöre geçiliyor: ${fallbackParent}`);
    parent = fallbackParent;
    primary = false;
  }
  const root = path.join(parent, rootName);
  fs.mkdirSync(root, { recursive: true });
  let s;
  try {
    s = await openAxio(parent, rootName);
    log.log('[db] AxioDB hazır:', root);
  } catch (e) {
    log.warn('[db] AxioDB açılamadı, dosya kaydına geçildi:', e?.message ?? e);
    s = openFile(root);
  }
  return { ...s, path: root, primary };
}
