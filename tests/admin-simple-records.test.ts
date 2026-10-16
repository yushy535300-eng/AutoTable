import { describe, it, expect } from 'vitest';
import { adminPage } from '../server/admin-page';
import { adminRecordPage, recordTime } from '../server/admin-record-view';
import { dgSettingsDetailsPage } from '../server/dg-settings-routes';
import { acknowledgementDetailsPage } from '../server/risk-acknowledgement-routes';

const account = { id: 8, platform: 'OFA', username: 'anonymous-user' };
const snapshot = { version:1,gamePlatform:'DG',runMode:'continuous',startMode:'fresh',provider:'combined',tableCount:'3',selectionMode:'auto',selectedTables:[],baseAmount:100,staking:'flat',maxStake:1000,stopLoss:150,takeProfit:50,durationMinutes:10,minSeconds:6,currency:'TWD' };
describe('simple administrator records', () => {
  it('has one records link per account, not two competing links', () => {
    const html = adminPage(true, '', [{...account,enabled:1}]);
    expect(html.match(/href="\/api\/admin\/whitelist\/8\/records"/g)).toHaveLength(1);
    expect(html).not.toContain('href="/api/admin/whitelist/8/settings"');
    expect(html).not.toContain('href="/api/admin/whitelist/8/acknowledgements"');
    expect(html).toContain('/api/admin/whitelist/8/toggle-form');
    expect(html).toContain('/api/admin/whitelist/8/extend-form');
  });
  it('starts every per-site counter as unknown and rejects incomplete legacy presence data', () => {
    const html = adminPage(true);
    expect(html).toContain('id="presence-autobac-online">待同步');
    expect(html).toContain('id="presence-helper-online">待同步');
    expect(html).toContain('id="presence-scarab-online">待同步');
    expect(html).toContain('id="presence-total-online">待同步');
    expect(html).toContain('id="presence-autobac-running">待同步');
    expect(html).toContain('data.applications.length!==3');
    expect(html).toContain("site.name!==expected.name");
    expect(html).toContain('不以 0 代替');
    expect(html).toContain('v3.2.14');
    expect(adminPage(false)).not.toContain('presence-autobac-online');
  });
  it('keeps full settings folded with a concise summary and no fake profit figures', () => {
    const html = dgSettingsDetailsPage({account,total:1,page:1,pages:1,rows:[{snapshot,recorded_at:'2026-10-16T10:00:00Z',statement_version:'v4'}]} as any);
    expect(html).toContain('平注 · 每注 100 · 3 桌');
    expect(html).toContain('止損 150 / 止盈 50');
    expect(html).toContain('<details><summary>詳細設定</summary>');
    expect(html).not.toContain('<details open');
    expect(html).not.toContain('<table');
    expect(html).toContain('使用時間、輸贏與停止原因尚未回傳到後台');
  });
  it('folds acknowledgement text and escapes stored values', () => {
    const html = acknowledgementDetailsPage({account,total:1,page:1,pages:1,rows:[{recorded_at:'2026-10-16T10:00:00Z',game_platform:'DG',statement_version:'<img>',statement_text:'<script>unsafe</script>',statement_sha256:'hash'}]} as any);
    expect(html).toContain('<details><summary>查看當時聲明</summary>');
    expect(html).toContain('&lt;script&gt;');expect(html).not.toContain('<script>unsafe');
    expect(html).not.toContain('<table');
  });
  it('keeps independent pagination and rejects invalid timestamps without invented dates', () => {
    const html = adminRecordPage({account,tab:'settings',total:41,page:2,pages:3,content:''});
    expect(html).toContain('/api/admin/whitelist/8/records?page=1');
    expect(html).toContain('/api/admin/whitelist/8/records?page=3');
    expect(recordTime('not-a-date')).toBe('時間無法辨識');
  });
});
