//   GET  /api/state?since=<ms>   -> anlık değerler + since'den bu yana değişiklikler
//   POST /api/storage/retry      -> veritabanı klasörüne yeniden erişmeyi dene
export function apiMiddleware(engine) {
  const send = (res, code, body) => {
    res.statusCode = code;
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify(body));
  };
  return async (req, res, next) => {
    const url = new URL(req.url, 'http://x');
    if (!url.pathname.startsWith('/api/')) return next();
    res.setHeader('access-control-allow-origin', '*');
    res.setHeader('access-control-allow-headers', 'content-type');
    if (req.method === 'OPTIONS') { res.statusCode = 204; return res.end(); }
    try {
      if (url.pathname === '/api/state' && req.method === 'GET') {
        return send(res, 200, engine.state(Number(url.searchParams.get('since')) || 0));
      }
      if (url.pathname === '/api/storage/retry' && req.method === 'POST') {
        await engine.reopen();
        return send(res, 200, engine.state(Date.now()));
      }
      send(res, 404, { error: 'not found' });
    } catch (e) {
      console.error('[api]', e);
      send(res, 500, { error: String(e?.message ?? e) });
    }
  };
}
