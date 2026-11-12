// dist/nodejs altına Android içinde çalışacak Node projesini hazırlar (npm install dahil).
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const out = path.resolve('dist/nodejs');
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
for (const f of ['sim.mjs', 'store.mjs', 'api.mjs', 'standalone.mjs']) fs.copyFileSync(`server/${f}`, path.join(out, f));
fs.copyFileSync('src/distros.js', path.join(out, 'distros.mjs'));
fs.writeFileSync(
  path.join(out, 'index.js'),
  `process.on('uncaughtException', (e) => console.error('[node]', e));
process.on('unhandledRejection', (e) => console.error('[node]', e));
import('./standalone.mjs').catch((e) => console.error('[node] başlatılamadı', e));
`
);
fs.writeFileSync(
  path.join(out, 'package.json'),
  JSON.stringify({ name: 'devnet-node', version: '1.0.0', main: 'index.js', dependencies: { axiodb: 'latest' } }, null, 2)
);
execSync('npm install --omit=dev --no-audit --no-fund', { cwd: out, stdio: 'inherit' });
console.log('[node] dist/nodejs hazır');
