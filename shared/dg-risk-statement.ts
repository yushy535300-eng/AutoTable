/** Checkbox acknowledgement only, not a wager receipt or a legal-effect assertion. */
export const DG_RISK_STATEMENT = Object.freeze({
  version: 'dg-risk-2026-10-16-v5-usage',
  title: '使用風險聲明',
  text: '自行決定開啟,所有風險自行承擔,不保證穩定獲利,程式不負相關責任',
  acknowledgement: '我已閱讀並了解上述風險',
  recordNotice: '勾選後，您的帳號、勾選時間及聲明版本會回傳至管理者的白名單後台留存紀錄。成功開始時，策略、金額、選桌、配注、止損、止盈及時間等實際使用設定，以及本次使用時間、執行狀態與僅限本機已驗證正式結算的結果彙總，都會回傳供管理者查閱；待結算或未確定項目會明示。該結果為客戶端回傳，非 DG 官方下注或結算報表。登入後會回傳連線與執行狀態，供管理者統計在線帳號；不回傳滑動、拖曳、縮放、原生封包、遊戲網址或憑證。',
});
export type DgRiskCheck = { eventId: string; checked: true; statementVersion: string };
export type DgRiskReceipt = { ok: true; recordedAt: string };
export const RISK_EVENT_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
