// simple-icons paketinden dağıtım logolarını src/logos/ içine kopyalar (marka renginde).
import fs from 'node:fs';
import path from 'node:path';
import { FAMILIES } from '../src/distros.js';

const from = path.resolve('node_modules/simple-icons/icons');
const to = path.resolve('src/logos');
if (!fs.existsSync(from)) {
  console.log('[logos] simple-icons bulunamadı, yedek rozetler kullanılacak.');
  process.exit(0);
}
fs.mkdirSync(to, { recursive: true });
const missing = [];
let ok = 0;
for (const f of FAMILIES) {
  const file = path.join(from, `${f.slug}.svg`);
  if (!fs.existsSync(file)) { missing.push(f.slug); continue; }
  const svg = fs.readFileSync(file, 'utf8').replace('<svg ', `<svg fill="${f.color}" `);
  fs.writeFileSync(path.join(to, `${f.slug}.svg`), svg);
  ok++;
}
console.log(`[logos] ${ok} logo kopyalandı.` + (missing.length ? ` Bulunamayan (rozet kullanılır): ${missing.join(', ')}` : ''));
