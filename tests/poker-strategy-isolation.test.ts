import { describe, expect, it } from 'vitest';
import { fourFormulaPokerDecision, resolveFourFormulaVotes } from '../lib/four-formula-strategy';
import { parityPokerDecision } from '../lib/parity-strategy';
import type { PokerHand } from '../lib/poker-hand';
import { createDgPokerTracker, dgPokerHand, pokerDecision } from '../lib/poker-strategies';

const FOUR_FOURS: PokerHand = { player: ['4', '4'], banker: ['4', '4'] };
const FOUR_FOURS_V_FOUR_FIVE: PokerHand = { player: ['4', '4'], banker: ['4', '5'] };
const FOUR_FORMULA_TIE: PokerHand = { player: ['A', '7'], banker: ['2', '5'] };

const FIRST_NATIVE = { player: '4-17', banker: '30-43' };
const SECOND_NATIVE = { player: '4-17', banker: '4-5' };

function fakeCard(
  tableId: string,
  shoeId: string,
  playId: number,
  stateId = 1,
  poker: unknown = undefined,
) {
  return { tableId, gameInfo: { shoeId, playId, stateId, poker } };
}

describe('four-formula vote resolution stays self-contained', () => {
  it('resolves every complete four-vote distribution solely by its majority', () => {
    for (const { bankers, players, side } of [
      { bankers: 0, players: 4, side: '閒' },
      { bankers: 1, players: 3, side: '閒' },
      { bankers: 2, players: 2, side: null },
      { bankers: 3, players: 1, side: '莊' },
      { bankers: 4, players: 0, side: '莊' },
    ] as const) {
      const votes: readonly unknown[] = [
        ...Array.from({ length: bankers }, () => '莊'),
        ...Array.from({ length: players }, () => '閒'),
      ];
      const decision = resolveFourFormulaVotes(votes);

      if (decision.ok) {
        expect(side).not.toBeNull();
        expect(decision).toEqual({ ok: true, side: side!, bankers, players });
      } else {
        expect(side).toBeNull();
        expect(decision).toMatchObject({ ok: false, bankers, players });
        expect(decision.reason).toEqual(expect.any(String));
        expect(decision.reason.length).toBeGreaterThan(0);
      }
    }
  });

  it('requires exactly four known sides and never turns missing or unknown votes into 閒', () => {
    const incompleteOrUnknown: readonly (readonly unknown[])[] = [
      ['莊', '莊', '莊'],
      ['莊', '莊', '莊', undefined],
      ['莊', '莊', '莊', null],
      ['莊', '莊', '莊', 'unknown'],
      ['莊', '閒', '莊', '閒', '莊'],
    ];

    for (const votes of incompleteOrUnknown) {
      expect(resolveFourFormulaVotes(votes).ok, JSON.stringify(votes)).toBe(false);
    }
  });
});

describe('parity and four-formula strategies remain separate', () => {
  it('keeps opposite formula directions independent through both direct strategies and the public router', () => {
    expect(parityPokerDecision(FOUR_FOURS)).toMatchObject({ ok: true, side: '閒' });
    expect(fourFormulaPokerDecision(FOUR_FOURS)).toMatchObject({ ok: true, side: '莊' });
    expect(pokerDecision('parity', FOUR_FOURS)).toEqual(parityPokerDecision(FOUR_FOURS));
    expect(pokerDecision('counting', FOUR_FOURS)).toEqual(fourFormulaPokerDecision(FOUR_FOURS));

    expect(parityPokerDecision(FOUR_FOURS_V_FOUR_FIVE)).toMatchObject({ ok: true, side: '莊' });
    expect(fourFormulaPokerDecision(FOUR_FOURS_V_FOUR_FIVE)).toMatchObject({ ok: true, side: '閒' });
    expect(pokerDecision('parity', FOUR_FOURS_V_FOUR_FIVE)).toEqual(parityPokerDecision(FOUR_FOURS_V_FOUR_FIVE));
    expect(pokerDecision('counting', FOUR_FOURS_V_FOUR_FIVE)).toEqual(fourFormulaPokerDecision(FOUR_FOURS_V_FOUR_FIVE));
  });

  it('does not use a parity answer to repair a two-to-two four-formula tie', () => {
    expect(parityPokerDecision(FOUR_FORMULA_TIE)).toMatchObject({ ok: true });
    expect(fourFormulaPokerDecision(FOUR_FORMULA_TIE)).toMatchObject({ ok: false });
    expect(pokerDecision('parity', FOUR_FORMULA_TIE)).toEqual(parityPokerDecision(FOUR_FORMULA_TIE));
    expect(pokerDecision('counting', FOUR_FORMULA_TIE)).toEqual(fourFormulaPokerDecision(FOUR_FORMULA_TIE));
    expect(pokerDecision('counting', FOUR_FORMULA_TIE).ok).toBe(false);
  });

  it('rejects runtime-invalid strategy values instead of falling through to four-formula', () => {
    for (const strategy of [undefined, null, '', 'four-formula', 'COUNTING', 'parity ']) {
      expect(pokerDecision(strategy as any, FOUR_FOURS).ok, String(strategy)).toBe(false);
    }
  });
});

describe('DG native prior-card isolation after strategy extraction', () => {
  it('uses each table\'s own same-shoe immediately-prior complete native hand', () => {
    const tracker = createDgPokerTracker();
    const first = dgPokerHand(FIRST_NATIVE);
    const second = dgPokerHand(SECOND_NATIVE);
    expect(first).not.toBeNull();
    expect(second).not.toBeNull();

    tracker.observe([
      fakeCard('one', 'shoe-one', 7, 2, FIRST_NATIVE),
      fakeCard('two', 'shoe-two', 31, 2, SECOND_NATIVE),
    ]);
    const one = fakeCard('one', 'shoe-one', 8);
    const two = fakeCard('two', 'shoe-two', 32);

    expect(tracker.decision(one, 'parity')).toEqual(pokerDecision('parity', first));
    expect(tracker.decision(one, 'counting')).toEqual(pokerDecision('counting', first));
    expect(tracker.decision(two, 'parity')).toEqual(pokerDecision('parity', second));
    expect(tracker.decision(two, 'counting')).toEqual(pokerDecision('counting', second));

    expect(tracker.decision(fakeCard('one', 'shoe-one', 9), 'counting').ok).toBe(false);
    expect(tracker.decision(fakeCard('one', 'different-shoe', 8), 'parity').ok).toBe(false);
  });

  it('returns no decision for nil evidence and never borrows another table\'s hand', () => {
    const tracker = createDgPokerTracker();
    tracker.observe([fakeCard('source', 'same-shoe', 7, 2, FIRST_NATIVE)]);

    for (const target of [
      fakeCard('other', 'same-shoe', 8),
      fakeCard('nil-a', 'same-shoe', 8),
      fakeCard('nil-b', 'same-shoe', 8),
    ]) {
      for (const strategy of ['parity', 'counting'] as const) {
        expect(tracker.decision(target, strategy).ok, `${target.tableId} ${strategy}`).toBe(false);
      }
    }

    const nilTracker = createDgPokerTracker();
    nilTracker.observe([
      fakeCard('nil-a', 'same-shoe', 7, 2, undefined),
      fakeCard('nil-b', 'same-shoe', 7, 2, null),
      fakeCard('nil-c', 'same-shoe', 7, 2, { player: '0-0-0', banker: '0-0-0' }),
    ]);
    for (const tableId of ['nil-a', 'nil-b', 'nil-c']) {
      for (const strategy of ['parity', 'counting'] as const) {
        expect(nilTracker.decision(fakeCard(tableId, 'same-shoe', 8), strategy).ok).toBe(false);
      }
    }
  });
});
