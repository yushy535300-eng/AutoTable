import { describe, expect, it } from 'vitest';
import { createDgSessionTimer, formatDuration, parseDurationMinutes } from '../lib/dg-session-timer';

describe('DG本次使用時間', () => {
  it('只接受整數分鐘，0或空白不限時', () => {
    expect(parseDurationMinutes('')).toBe(0);
    expect(parseDurationMinutes('0')).toBe(0);
    expect(parseDurationMinutes(' 30 ')).toBe(30);
    for (const value of ['-1', '1.5', 'NaN', 'Infinity', '1e3', 'abc', '999999999999999999999']) expect(() => parseDurationMinutes(value)).toThrow();
  });
  it('顯示HH:MM:SS，不在24小時歸零', () => {
    expect(formatDuration(0)).toBe('00:00:00');
    expect(formatDuration(61000)).toBe('00:01:01');
    expect(formatDuration(90000000)).toBe('25:00:00');
  });
  it('成功開始才計時，停止後凍結；重新開始重新計時', () => {
    let wall = 1000, mono = 1000;
    const timer = createDgSessionTimer(() => wall, () => mono);
    wall += 30000; mono += 30000;
    expect(timer.view().elapsedMs).toBe(0);
    timer.start(2); wall += 5000; mono += 5000;
    expect(timer.view().elapsedText).toBe('00:00:05');
    timer.stop(); wall += 60000; mono += 60000;
    expect(timer.view().elapsedMs).toBe(5000);
    expect(timer.expired()).toBe(false);
    timer.start(1); expect(timer.view().elapsedMs).toBe(0);
  });
  it('剛好達分鐘時限就到期，不等下一局', () => {
    let now = 0;
    const timer = createDgSessionTimer(() => now, () => now);
    timer.start(1); now = 59999; expect(timer.expired()).toBe(false);
    now = 60000; expect(timer.expired()).toBe(true);
    expect(timer.view().remainingMs).toBe(0);
  });
  it('牆鐘往後調整不會延長使用時限', () => {
    let wall = 100000, mono = 10;
    const timer = createDgSessionTimer(() => wall, () => mono);
    timer.start(1); wall -= 100000; mono += 60000;
    expect(timer.expired()).toBe(true);
  });
  it('待機時間從牆鐘計算，不能因背景計時器變慢而延長', () => {
    let wall = 0, mono = 0;
    const timer = createDgSessionTimer(() => wall, () => mono);
    timer.start(1); wall = 61000; mono = 20;
    expect(timer.expired()).toBe(true);
  });
  it('不限時仍顯示使用時間，但不自動到期', () => {
    let now = 0;
    const timer = createDgSessionTimer(() => now, () => now);
    timer.start(0); now = 86400000;
    expect(timer.view().elapsedText).toBe('24:00:00');
    expect(timer.view().remainingMs).toBe(null);
    expect(timer.expired()).toBe(false);
  });
});
