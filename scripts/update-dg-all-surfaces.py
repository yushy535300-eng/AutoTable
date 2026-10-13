from pathlib import Path

root = Path(__file__).resolve().parents[1]
p = root / 'lib/dg-panel-view.ts'
s = p.read_text()
s = s.replace("import {DG_SPACIOUS_CSS} from './dg-panel-spacious';", "import {DG_SPACIOUS_CSS} from './dg-panel-spacious';\nimport {DG_SURFACES_CSS} from './dg-panel-surfaces';")
s = s.replace('${DG_SPACIOUS_CSS}\n', '${DG_SPACIOUS_CSS}\n${DG_SURFACES_CSS}\n')
icons = {
    'settings': '<path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="3"/><circle cx="15" cy="17" r="3"/>',
    'rooms': '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    'logs': '<path d="M7 3h10v18H7zM10 8h4M10 12h4M10 16h4"/>',
}
def heading(key, title, kicker):
    return f'<div class="surface-heading"><div><div class="surface-kicker">{kicker}</div><h2 class="page-title">{title}</h2></div><span class="surface-icon"><svg viewBox="0 0 24 24" aria-hidden="true">{icons[key]}</svg></span></div>'
a = s.index('<div id="settings-page" hidden>')
b = s.index('<div id="rooms-page" hidden>', a)
s = s[:a] + '''<div id="settings-page" hidden>''' + heading('settings', '策略設定', '執行參數') + '''<p class="surface-note">設定方向來源、單注金額與停止條件。</p><div class="form-body">
<section class="form-section"><h3 class="form-section-head"><i>01</i>推薦與配注</h3><label for="single-staking">配注方式</label><select id="single-staking"><option value="flat">平注 · 每筆固定金額</option><option value="martingale" selected>馬丁 · 輸升階、贏重置</option></select><div id="staking-hint" class="settings-added"></div><label for="provider">推薦來源</label><select id="provider"></select></section>
<section class="form-section"><h3 class="form-section-head"><i>02</i>投注金額</h3><div class="form-row"><div><label for="base">基本單注</label><input id="base" type="number" min="1" value="100"></div><div><label for="cap">單筆上限</label><input id="cap" type="number" min="1" value="100000"></div></div></section>
<section class="form-section"><h3 class="form-section-head"><i>03</i>止損與止盈</h3><div class="form-row"><div><label for="stop-loss">止損金額</label><input id="stop-loss" type="number" min="1" placeholder="未設定"></div><div><label for="take-profit">止盈金額</label><input id="take-profit" type="number" min="1" placeholder="未設定"></div></div><p class="field-note">達到本輪已結算損益門檻後，停止新增下注。</p></section>
<span id="zoom-label" hidden>100%</span><input id="zoom" type="range" min="70" max="180" step="10" value="100" hidden><input id="range-min" hidden value=""><input id="range-max" hidden value=""><select id="scope" hidden disabled><option value="table" selected>逐桌獨立</option></select><select id="count" hidden><option value="1">1</option><option value="3">3</option><option value="5">5</option><option value="all">all</option></select><button id="scan" hidden></button><div hidden><button id="start"></button><button id="once"></button><button id="stop"></button></div></div></div>
''' + s[b:]
a = s.index('<div id="rooms-page" hidden>')
b = s.index('<div class="compact-actions">', a)
s = s[:a] + '<div id="rooms-page" hidden>' + heading('rooms', '選擇桌台', '下注範圍') + '''<div id="rooms-hint" class="surface-note page-caption">先取消一桌，再選其他桌。</div><div id="rooms"></div><button id="rooms-back" class="rooms-back">完成選擇，回到總覽</button></div><div id="logs-page" hidden>''' + heading('logs', '執行紀錄', '狀態與結算') + '''<p class="surface-note">依序查看送出、接受及結算事件。</p><div class="log-status"><span class="log-label">目前狀態</span><div id="status"></div></div><div id="events" aria-label="操作事件時間軸"></div></div>
''' + s[b:]
s = s.replace('<h2>遊戲報表</h2>', '<div><div class="surface-kicker">本工具記錄</div><h2>下注戰績</h2></div>')
s = s.replace('今日報表</button>', '今日</button>')
s = s.replace('<svg class="risk-triangle"', '<div class="risk-emblem"><svg class="risk-triangle"', 1)
s = s.replace('<h2 id="risk-title">', '</div><h2 id="risk-title">', 1)
# 明確的迷你/展開文字不依賴使用者辨識減號。
s = s.replace('<path d="M5 12h14"/></svg></button><button id="zoom-in"', '<path d="M5 12h14"/></svg><span id="mini-label">迷你</span></button><button id="zoom-in"', 1)
resize = '<button id="resize-panel" class="resize-grip" aria-label="拖曳調整面板尺寸" title="拖曳調整大小；方向鍵微調"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 19 19 9M14 19 19 14M19 19h.01"/></svg></button>'
s = s.replace('</section><section id="risk-dialog"', resize + '</section><section id="risk-dialog"', 1)
s = s.replace('</footer></section>`;', '</footer>' + resize.replace('resize-panel', 'resize-report') + '</section>`;', 1)
p.write_text(s)
print('已更新全介面結構，所有功能欄位 ID 保留。')
