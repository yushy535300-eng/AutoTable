import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('百家自動下注主畫面名稱', () => {
  const root = process.cwd();
  it('iPhone初始HTML明確提供主畫面名稱及圖示', () => {
    const html = readFileSync(resolve(root, 'app/+html.tsx'), 'utf8');
    expect(html).toContain('name="apple-mobile-web-app-title" content="百家自動下注"');
    expect(html).toContain('name="application-name" content="百家自動下注"');
    expect(html).toContain('rel="manifest" href="/manifest.webmanifest"');
    expect(html).toContain('rel="apple-touch-icon" href="/apple-touch-icon.png"');
  });
  it('Android manifest使用相同完整及短名稱，不更改管理頁manifest', () => {
    const manifest = JSON.parse(readFileSync(resolve(root, 'public/manifest.webmanifest'), 'utf8'));
    expect(manifest.name).toBe('百家自動下注');
    expect(manifest.short_name).toBe('百家自動下注');
    expect(manifest.start_url).toBe('/');
    expect(manifest.icons[0].src).toBe('/apple-touch-icon.png');
    expect(readFileSync(resolve(root, 'public/admin-manifest.webmanifest'), 'utf8')).not.toBe('');
  });
  it('應用顯示名稱同步，保留原bundle識別', () => {
    const config = readFileSync(resolve(root, 'app.config.ts'), 'utf8');
    expect(config).toContain('appName: "百家自動下注"');
    expect(config).toContain('const rawBundleId = "com.mtassistant.v34"');
  });
});
