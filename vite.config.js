import path from 'node:path';
import { defineConfig } from 'vite';
import { createEngine } from './server/sim.mjs';
import { apiMiddleware } from './server/api.mjs';
import { DISTROS } from './src/distros.js';

// Geliştirmede aynı motor Vite içinde çalışır. DEVNET_ALWAYS=1 ile saat sınırı kapatılır.
function attach(server) {
  const engine = createEngine({
    ids: DISTROS.map((d) => d.id),
    dataParent: path.resolve('data'),
    fallbackParent: path.resolve('data'),
    alwaysOn: process.env.DEVNET_ALWAYS === '1',
  });
  engine.start();
  server.middlewares.use(apiMiddleware(engine));
  server.httpServer?.on('close', () => engine.stop());
}

// Not: bu fonksiyonlar bir şey döndürmemeli; Vite dönen fonksiyonu "post hook" sanıp çağırır.
const api = {
  name: 'distro-api',
  configureServer(server) { attach(server); },
  configurePreviewServer(server) { attach(server); },
};

export default defineConfig({ server: { port: 5173 }, plugins: [api] });
