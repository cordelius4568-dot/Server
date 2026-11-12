// Android içinde (nodejs-mobile) çalışan sunucu: 127.0.0.1:5174
import http from 'node:http';
import os from 'node:os';
import { createEngine } from './sim.mjs';
import { apiMiddleware } from './api.mjs';
import { DISTROS } from './distros.mjs';

const engine = createEngine({
  ids: DISTROS.map((d) => d.id),
  dataParent: '/sdcard', // -> /sdcard/devnet@0.0.0.0
  fallbackParent: process.env.DATADIR || os.tmpdir(),
});
await engine.start();

const handle = apiMiddleware(engine);
http
  .createServer((req, res) => handle(req, res, () => { res.statusCode = 404; res.end(); }))
  .listen(5174, '127.0.0.1', () => console.log('[server] http://127.0.0.1:5174'));
