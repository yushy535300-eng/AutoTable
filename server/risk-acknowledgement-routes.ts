import type { Express, RequestHandler } from 'express';
import { z } from 'zod';
import { DG_RISK_STATEMENT, RISK_EVENT_ID } from '../shared/dg-risk-statement';
import { getPool } from './whitelist';
import { listRiskAcknowledgements, recordRiskAcknowledgement, readRiskTrackerIdentity } from './risk-acknowledgements';

const payload = z.object({
  sessionId: z.string().min(1).max(64),
  eventId: z.string().regex(RISK_EVENT_ID),
  checked: z.literal(true),
  statementVersion: z.string().max(80),
}).strict();
const esc = (value: any) => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]!));
export function acknowledgementDetailsPage(data: NonNullable<Awaited<ReturnType<typeof listRiskAcknowledgements>>>) {
  const rows = data.rows.map((row: any) => `<tr><td>${esc(new Date(row.recorded_at).toLocaleString('zh-TW', { timeZone: 'Asia/Taipei', hour12: false }))}</td><td>${esc(row.game_platform)}</td><td>已勾選</td><td>${esc(row.statement_version)}</td><td><details><summary>查看當時聲明</summary><pre>${esc(row.statement_text)}</pre><small>SHA-256：${esc(row.statement_sha256)}</small></details></td></tr>`).join('');
  const base = `/api/admin/whitelist/${encodeURIComponent(data.account.id)}/acknowledgements`;
  return `<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>免責勾選紀錄</title><style>body{background:#080e13;color:#eee;font:14px system-ui;margin:20px}a{color:#a7d4c0}table{border-collapse:collapse;width:100%;min-width:650px}th,td{padding:12px;border-bottom:1px solid #39434b;text-align:left;vertical-align:top}.table{overflow:auto}pre{white-space:pre-wrap;max-width:480px;font:13px system-ui}small{overflow-wrap:anywhere}footer{margin-top:20px}</style></head><body><a href="/admin">← 返回白名單</a><h2>${esc(data.account.platform)} · ${esc(data.account.username)}｜免責勾選紀錄</h2><p>共 ${data.total} 次勾選，時間為台北時間。這是勾選事件紀錄，不表示已開始下注、下注成功或保證免責法律效力；取消不會抹除曾勾選的紀錄。</p><div class="table"><table><thead><tr><th>後端記錄時間</th><th>遊戲</th><th>紀錄</th><th>聲明版本</th><th>完整聲明</th></tr></thead><tbody>${rows || '<tr><td colspan="5">尚無紀錄；部署前的勾選不會補造。</td></tr>'}</tbody></table></div><footer>${data.page > 1 ? `<a href="${base}?page=${data.page - 1}">上一頁</a>` : ''}　${data.page} / ${data.pages}　${data.page < data.pages ? `<a href="${base}?page=${data.page + 1}">下一頁</a>` : ''}</footer></body></html>`;
}

export function registerRiskAcknowledgementRoutes(app: Express, requireAdmin: RequestHandler, deps = { getPool, readRiskTrackerIdentity, recordRiskAcknowledgement, listRiskAcknowledgements }) {
  app.post('/api/dg/risk-acknowledgements', async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    // The session credential stays in the request body, never in a URL/log.
    if (req.get('Sec-Fetch-Site') === 'cross-site') return res.status(403).json({ ok: false, error: 'same_origin_required' });
    const origin = req.get('Origin');
    if (origin) { try { if (new URL(origin).host !== req.get('Host')) return res.status(403).json({ ok: false, error: 'same_origin_required' }); } catch { return res.status(403).json({ ok: false, error: 'same_origin_required' }); } }
    const input = payload.safeParse(req.body);
    if (!input.success) return res.status(400).json({ ok: false, error: 'invalid_acknowledgement' });
    if (input.data.statementVersion !== DG_RISK_STATEMENT.version) return res.status(409).json({ ok: false, error: 'statement_version_changed' });
    try {
      const db = deps.getPool();
      if (!db) return res.status(503).json({ ok: false, error: 'recording_unavailable' });
      const session = await deps.readRiskTrackerIdentity(db, input.data.sessionId);
      if (!session) return res.status(401).json({ ok: false, error: 'session_or_whitelist_unavailable' });
      const receipt = await deps.recordRiskAcknowledgement(db, session, input.data.eventId, input.data.sessionId);
      if (!receipt) return res.status(403).json({ ok: false, error: 'whitelist_unavailable' });
      return res.json(receipt);
    } catch {
      // Do not print SQL, connection strings, session credentials or account data.
      return res.status(503).json({ ok: false, error: 'recording_unavailable' });
    }
  });
  app.get('/api/admin/whitelist/:id/acknowledgements', requireAdmin, async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Referrer-Policy', 'no-referrer');
    const id = Number(req.params.id), page = Number(req.query.page || 1);
    if (!Number.isSafeInteger(id) || id < 1 || !Number.isSafeInteger(page) || page < 1) return res.status(400).send('無效紀錄頁');
    try {
      const db = deps.getPool(); if (!db) return res.status(503).send('紀錄資料庫尚未設定');
      const data = await deps.listRiskAcknowledgements(db, id, page);
      if (!data) return res.status(404).send('找不到此白名單帳號');
      return res.type('html').send(acknowledgementDetailsPage(data));
    } catch { return res.status(503).send('紀錄暫時無法讀取，請稍後再試'); }
  });
}
