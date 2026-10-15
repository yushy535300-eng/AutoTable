import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';

const root = process.cwd();
const read = (path: string) => readFileSync(resolve(root, path), 'utf8');
describe('百家自動下注 approved AUTO home icon', () => {
  it('uses versioned iPhone and manifest URLs with unchanged shortcut name', () => {
    const html = read('app/+html.tsx');
    expect(html).toContain('name="apple-mobile-web-app-title" content="百家自動下注"');
    expect(html).toContain('name="application-name" content="百家自動下注"');
    expect(html).toContain('rel="manifest" href="/manifest-v329.webmanifest"');
    expect(html).toContain('rel="apple-touch-icon" sizes="180x180" href="/autobac-auto-v329-180.png"');
    expect(html).not.toContain('href="/apple-touch-icon.png"');
  });
  it('provides genuine 192/512 icons for Android and same manifest fallback', () => {
    const manifest = JSON.parse(read('public/manifest-v329.webmanifest'));
    expect(manifest.name).toBe('百家自動下注');
    expect(manifest.short_name).toBe('百家自動下注');
    expect(manifest.start_url).toBe('/');
    expect(manifest).toEqual(JSON.parse(read('public/manifest.webmanifest')));
    for (const size of [192, 512]) {
      const icon = manifest.icons.find((x: { sizes: string }) => x.sizes === `${size}x${size}`);
      expect(icon.src).toBe(`/autobac-auto-v329-${size}.png`);
      const png = readFileSync(resolve(root, `public${icon.src}`));
      expect(png.readUInt32BE(16)).toBe(size); expect(png.readUInt32BE(20)).toBe(size);
    }
    expect(read('public/admin-manifest.webmanifest')).not.toBe('');
  });
  it('retains the exact chosen D artwork, not a screenshot or old logo', () => {
    const original = readFileSync(resolve(root, 'assets/images/autobac-auto-master.png'));
    expect(createHash('sha256').update(original).digest('hex')).toBe('56e8a221091968513e88fde8afed5957abff64bef463c618561aed138c326a65');
    expect(readFileSync(resolve(root, 'public/apple-touch-icon.png'))).toEqual(readFileSync(resolve(root, 'public/autobac-auto-v329-180.png')));
  });
  it('uses the same approved brand image at every former AB position', () => {
    expect(read('components/autobac-logo.tsx')).toContain("require('../assets/images/autobac-auto-v329.png')");
    for (const name of ['autobac-access', 'autobac-game-header', 'autobac-platform-choice']) {
      const source = read(`components/${name}.tsx`);
      expect(source).toContain('<AutoBacLogo'); expect(source).not.toContain('>AB</Text>');
    }
    const legacy = read('lib/legacy-platform-screen.tsx');
    expect(legacy).toContain('link.href = "/autobac-auto-v329-180.png"');
    expect(legacy).not.toContain('href = "/apple-touch-icon.png"');
  });
  it('keeps application identity and stops using old native adaptive assets', () => {
    const config = read('app.config.ts');
    expect(config).toContain('appName: "百家自動下注"');
    expect(config).toContain('const rawBundleId = "com.mtassistant.v34"');
    expect(config).toContain('foregroundImage: "./assets/images/autobac-auto-v329.png"');
    expect(config).not.toContain('android-icon-foreground.png');
    expect(config).not.toContain('android-icon-monochrome.png');
  });
  it('keeps the two login captions separate and single-line; check icon is white', () => {
    const source = read('components/autobac-access.tsx');
    expect(source).toMatch(/testID="autobac-access-title" numberOfLines=\{1\}/);
    expect(source).toMatch(/testID="autobac-access-subtitle" numberOfLines=\{1\}/);
    expect(source).toContain('百家樂自動下注'); expect(source).toContain('安全登入後進入 DG');
    expect(source).toContain('name="verified-user" size={18} color="#FFFFFF"');
  });
});
