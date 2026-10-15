/** Checkbox acknowledgement only, not a wager receipt or a legal-effect assertion. */
export const DG_RISK_STATEMENT = Object.freeze({
  version: 'dg-risk-2026-10-15-v2',
  title: '使用風險聲明',
  text: '自行決定開啟,所有風險自行承擔,不保證穩定獲利,程式不負相關責任',
  acknowledgement: '我已閱讀並了解上述風險',
  recordNotice: '勾選後，您的帳號、勾選時間及聲明版本會回傳至管理者的白名單後台留存紀錄。',
});
export type DgRiskCheck = { eventId: string; checked: true; statementVersion: string };
export type DgRiskReceipt = { ok: true; recordedAt: string };
export const RISK_EVENT_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
