import { describe, expect, it } from 'vitest';
import { createDgRiskInputDrafts } from '../lib/dg-risk-inputs';
import { parseRiskLimits } from '../lib/dg-risk-limits';

describe('per-staking risk input drafts', () => {
  it('starts flat without a preset loss or profit limit', () => {
    expect(createDgRiskInputDrafts('flat').initial()).toEqual({ stopLoss: '', takeProfit: '' });
    expect(parseRiskLimits('', '')).toEqual({ stopLoss: null, takeProfit: null });
  });
  it('never carries the martingale defaults into the first flat selection', () => {
    const drafts = createDgRiskInputDrafts('martingale');
    expect(drafts.switchTo('flat', drafts.initial())).toEqual({ stopLoss: '', takeProfit: '' });
  });
  it('preserves independently entered loss and profit values across modes', () => {
    const drafts = createDgRiskInputDrafts('martingale');
    drafts.switchTo('flat', { stopLoss: '5000', takeProfit: '900' });
    expect(drafts.switchTo('martingale', { stopLoss: '350', takeProfit: '200' }))
      .toEqual({ stopLoss: '5000', takeProfit: '900' });
    expect(drafts.switchTo('flat', { stopLoss: '6000', takeProfit: '1000' }))
      .toEqual({ stopLoss: '350', takeProfit: '200' });
  });
  it('retains same-mode flat inputs across multi-table count changes', () => {
    const drafts = createDgRiskInputDrafts('flat');
    expect(drafts.switchTo('flat', { stopLoss: '400', takeProfit: '300' }))
      .toEqual({ stopLoss: '400', takeProfit: '300' });
  });
  it('does not silently repair invalid or cleared manually entered values', () => {
    const drafts = createDgRiskInputDrafts('martingale');
    drafts.switchTo('flat', { stopLoss: '2599', takeProfit: '' });
    expect(drafts.switchTo('martingale', { stopLoss: '', takeProfit: '' }).stopLoss).toBe('2599');
    drafts.switchTo('flat', { stopLoss: '', takeProfit: '' });
    expect(drafts.switchTo('martingale', { stopLoss: '100', takeProfit: '' }).stopLoss).toBe('');
  });
  it('returns copies instead of exposing mutable shared drafts', () => {
    const drafts = createDgRiskInputDrafts('martingale');
    const initial = drafts.initial(); initial.stopLoss = '999';
    expect(drafts.initial().stopLoss).toBe('2600');
  });
});
