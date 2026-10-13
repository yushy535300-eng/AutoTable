// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';
import { dgFrameHasPending, dgFramePanelStatus, enterDgForeground, installDgFramePanel } from '../lib/dg-frame-installer';

afterEach(() => { vi.unstubAllGlobals(); });
describe('DG登入後的面板安裝', () => {
  it('載入前等待，不當成安裝成功', () => {
    vi.stubGlobal('window', {location: {origin: 'https://app.example'}});
    const frame: any = {contentWindow: {}, contentDocument: {location: {origin: 'https://app.example'}}};
    expect(installDgFramePanel(frame)).toBe('waiting');
  });
  it('跨來源不安裝，無法核對時阻止重連與登出', () => {
    vi.stubGlobal('window', {location: {origin: 'https://app.example'}});
    const frame: any = {contentWindow: {}, contentDocument: null};
    expect(installDgFramePanel(frame)).toBe('cross-origin');
    expect(dgFrameHasPending(frame)).toBe(true);
    expect(dgFrameHasPending(null)).toBe(false);
  });
  it('被CSP阻止時不宣稱安裝成功', () => {
    vi.stubGlobal('window', {location: {origin: 'https://app.example'}});
    const frame: any = {contentWindow: {Laya: {stage: {getChildAt() {}}}}, contentDocument: {location: {origin: 'https://app.example'}, createElement: () => ({remove() {}}), documentElement: {appendChild() {}}}};
    expect(installDgFramePanel(frame)).toBe('blocked');
  });
  it('已安裝不再注入，待結算偵測使用帳本', () => {
    vi.stubGlobal('window', {location: {origin: 'https://app.example'}});
    const frame: any = {contentWindow: {__DG_SINGLEPAGE__: {status: () => ({pending: [{}], selected: ['1']}), diagnostics: () => [{}]}}, contentDocument: {location: {origin: 'https://app.example'}}};
    expect(installDgFramePanel(frame)).toBe('installed');
    expect(dgFrameHasPending(frame)).toBe(true);
    expect(dgFramePanelStatus(frame)).toEqual({installed: true, connected: true, selected: 1});
  });
  it('只接受現有同源DG入口', async () => {
    vi.stubGlobal('window', {location: {origin: 'https://app.example'}});
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ok: true, json: async () => ({ok: true, url: '/ddnewpc/index.html?token=test-only'})}));
    expect(await enterDgForeground('offline', 'https://dg.example/?token=test-only')).toContain('/ddnewpc/index.html');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ok: true, json: async () => ({ok: true, url: 'https://unrelated.example/'})}));
    await expect(enterDgForeground('offline', 'https://dg.example/?token=test-only')).rejects.toThrow('非預期來源');
  });
});
