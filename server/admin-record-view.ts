export function escapeRecordText(value: unknown): string {
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[char]!));
}

export function recordTime(value: string | Date): string {
  const date = new Date(value);
  return Number.isFinite(date.getTime())
    ? date.toLocaleString('zh-TW', { timeZone: 'Asia/Taipei', hour12: false })
    : '時間無法辨識';
}

interface RecordPageOptions {
  account: { id: string | number; platform: string; username: string };
  tab: 'settings' | 'acknowledgements';
  total: number;
  page: number;
  pages: number;
  content: string;
}

/** content is server-rendered HTML; every database field is escaped by the caller. */
export function adminRecordPage(options: RecordPageOptions): string {
  const esc = escapeRecordText;
  const root = `/api/admin/whitelist/${encodeURIComponent(options.account.id)}`;
  const current = `${root}/${options.tab === 'settings' ? 'records' : 'acknowledgements'}`;
  return `<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>使用紀錄</title><style>
*{box-sizing:border-box}body{margin:0;background:#080e13;color:#ecf0ed;font:14px system-ui,-apple-system,"Noto Sans TC",sans-serif}main{max-width:760px;margin:auto;padding:24px 16px}a{color:#a7d4c0;text-decoration:none}h1{font-size:22px;margin:18px 0 6px}.account{color:#a3afa9;overflow-wrap:anywhere}.tabs{display:flex;gap:8px;margin:20px 0 12px}.tabs a{padding:11px 16px;border:1px solid #354640;border-radius:9px}.tabs a[aria-current=page]{background:#234137;color:#fff}.hint{color:#91a098;line-height:1.7;font-size:12px;margin-bottom:18px}.record{padding:16px;border:1px solid #2d4039;background:#111c20;border-radius:12px;margin-bottom:10px;min-width:0}.meta{display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;color:#9aaba1;font-size:12px}.badge{color:#b8e3c7}.summary{font-weight:700;font-size:15px;margin:10px 0;line-height:1.6;overflow-wrap:anywhere}.limits{font-size:12px;color:#bdc8c0;line-height:1.7;overflow-wrap:anywhere}details{margin-top:12px}summary{cursor:pointer;color:#a7d4c0;padding:7px 0}dl{display:grid;grid-template-columns:minmax(80px,120px) minmax(0,1fr);gap:8px;margin:10px 0;line-height:1.6}dt{color:#9aaba1}dd{margin:0;overflow-wrap:anywhere}pre{white-space:pre-wrap;overflow-wrap:anywhere;font:13px system-ui;line-height:1.7}small{display:block;color:#99aaa1;overflow-wrap:anywhere;line-height:1.7}.bad{color:#ff9ca4}.empty{padding:28px 12px;color:#91a098;text-align:center}.pages{display:flex;justify-content:center;align-items:center;gap:18px;margin:22px 0}.pages a{padding:10px}.back{display:inline-block;padding:8px 0}@media(max-width:400px){main{padding:16px 12px}.record{padding:13px}}
 .version{display:inline-block;margin-left:8px;padding:3px 7px;border:1px solid #496153;border-radius:99px;color:#b8e3c7;font-size:10px;font-weight:700;vertical-align:middle}
</style></head><body><main><a class="back" href="/admin">← 返回白名單</a><h1>使用紀錄<span class="version">v3.2.14</span></h1><div class="account">${esc(options.account.platform)} · ${esc(options.account.username)}</div><nav class="tabs" aria-label="紀錄種類"><a href="${root}/records"${options.tab === 'settings' ? ' aria-current="page"' : ''}>使用設定</a><a href="${root}/acknowledgements"${options.tab === 'acknowledgements' ? ' aria-current="page"' : ''}>免責確認</a></nav><p class="hint">共 ${esc(options.total)} 筆 · 台北時間。詳細內容按一下展開。<br>目前保存開始設定與免責確認；使用時間、輸贏與停止原因尚未回傳到後台。紀錄不表示已開始下注、下注成功或保證任何結果。</p>${options.content || '<div class="empty">尚無紀錄；部署前的操作不會補造。</div>'}<nav class="pages" aria-label="紀錄分頁">${options.page > 1 ? `<a href="${current}?page=${options.page - 1}">上一頁</a>` : ''}<span>${esc(options.page)} / ${esc(options.pages)}</span>${options.page < options.pages ? `<a href="${current}?page=${options.page + 1}">下一頁</a>` : ''}</nav></main></body></html>`;
}
