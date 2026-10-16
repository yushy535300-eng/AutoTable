export type DgRiskInputMode = 'flat' | 'martingale' | 'doubling';
export interface DgRiskInputValues {
  stopLoss: string;
  takeProfit: string;
}

/** UI drafts only: validity and execution limits are still checked at start. */
export function createDgRiskInputDrafts(initialMode: DgRiskInputMode) {
  const drafts: Record<DgRiskInputMode, DgRiskInputValues> = {
    flat: { stopLoss: '', takeProfit: '' },
    martingale: { stopLoss: '', takeProfit: '' },
    doubling: { stopLoss: '', takeProfit: '' },
  };
  let active = initialMode;
  return {
    initial(): DgRiskInputValues {
      return { ...drafts[active] };
    },
    switchTo(mode: DgRiskInputMode, visible: DgRiskInputValues): DgRiskInputValues {
      drafts[active] = { ...visible };
      active = mode;
      return { ...drafts[active] };
    },
  };
}

export function martingaleStopLossError(mode: DgRiskInputMode, value: string): string {
  if (mode !== 'martingale') return '';
  if (!value.trim()) return '請輸入馬丁止損金額，最低為 2,600。';
  const amount = Number(value);
  if (!Number.isFinite(amount)) return '請輸入有效的馬丁止損金額，最低為 2,600。';
  return amount < 2600 ? '止損金額低於 2,600，馬丁模式最低須設定 2,600。' : '';
}
