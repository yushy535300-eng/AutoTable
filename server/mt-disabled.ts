import type { Express } from 'express';

/** MT is archived, not available in the DG-only release. Register before static routes. */
export function registerDisabledMtRoutes(app: Express) {
  app.use(['/api/mt', '/mt-game', /^\/mt-[^/]+\.(?:js|json)(?:\/|$)/i], (_req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(410).json({ ok: false, error: 'mt_disabled', message: 'MT 已暫時移除，目前僅提供 DG。' });
  });
}
