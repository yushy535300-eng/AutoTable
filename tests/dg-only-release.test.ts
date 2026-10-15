import { describe, it, expect } from 'vitest';
import express from 'express';
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { registerDisabledMtRoutes } from '../server/mt-disabled';

describe('DG-only release', () => {
  it('blocks all old MT proxy and script routes before static serving', async () => {
    const app = express();
    registerDisabledMtRoutes(app);
    app.get('/api/dg/probe', (_req, res) => res.json({ ok: true, platform: 'DG' }));
    app.use((_req, res) => res.status(200).send('static fallback'));
    const server = createServer(app);
    await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
    const address = server.address() as { port: number };
    const origin = `http://127.0.0.1:${address.port}`;
    try {
      for (const path of ['/api/mt/proxy/enter', '/api/mt/proxy/exit', '/mt-game/', '/mt-game/assets/test.js', '/mt-native-click-console.js', '/mt-direct-bet-console.js', '/mt-table-navigator.js']) {
        for (const method of ['GET', 'POST']) {
          const reply = await fetch(origin + path, { method });
          expect(reply.status).toBe(410);
          expect(reply.headers.get('cache-control')).toBe('no-store');
          expect((await reply.json()).error).toBe('mt_disabled');
        }
      }
      expect(await (await fetch(origin + '/api/dg/probe')).json()).toEqual({ ok: true, platform: 'DG' });
      expect(await (await fetch(origin + '/')).text()).toBe('static fallback');
    } finally {
      server.closeAllConnections();
      await new Promise<void>(resolve => server.close(() => resolve()));
    }
  });

  it('root page has no MT authorization or installer, and still preserves DG pending checks', () => {
    const source = readFileSync('app/index.tsx', 'utf8');
    expect(source).not.toMatch(/getMtLoginUrlFromPlatform|enterMtForeground|mt-frame-installer|mtFrameHasPending|__MT_/);
    expect(source).toContain("target !== 'DG'");
    expect(source).toContain('dgFrameHasPending(frameRef.current)');
    expect(source).toContain('preserveDgFrameLedger(frameRef.current)');
    expect(source).toContain('checkSession.useQuery');
  });

  it('only DG is advertised and built; archived MT sources remain available for future repair', () => {
    const choice = readFileSync('components/autobac-platform-choice.tsx', 'utf8');
    expect(choice).toContain("(['DG'] as GamePlatform[])");
    expect(choice).not.toContain('選擇 DG 或 MT');
    const access = readFileSync('components/autobac-access.tsx', 'utf8');
    expect(access).toContain('安全登入後進入 DG');
    expect(access).not.toContain('選擇 MT／DG');
    const config = JSON.parse(readFileSync('public/autobac-version.json', 'utf8'));
    expect(config.platforms).toEqual(['DG']);
    expect(config.mtStatus).toBe('disabled-source-retained');
    const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
    expect(pkg.scripts.build).not.toContain('build:mt');
    expect(readFileSync('lib/mt-dom-click-runner.ts', 'utf8').length).toBeGreaterThan(100);
    expect(readFileSync('server/_core/index.ts', 'utf8')).not.toContain('registerMtGameProxy');
  });
});
