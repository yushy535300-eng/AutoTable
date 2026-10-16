export type DgRiskInputMode = 'flat' | 'martingale' | 'doubling';
export interface DgRiskInputValues {
  stopLoss: string;
  takeProfit: string;
}

/** UI drafts only: validity and execution limits are still checked at start. */
export function createDgRiskInputDrafts(initialMode: DgRiskInputMode) {
  const drafts: Record<DgRiskInputMode, DgRiskInputValues> = {
    flat: { stopLoss: '', takeProfit: '' },
    martingale: { stopLoss: '2600', takeProfit: '' },
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
