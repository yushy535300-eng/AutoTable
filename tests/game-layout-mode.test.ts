import {describe,it,expect} from 'vitest';
import {detectGameDevice,resolveGameDevice} from '../lib/game-device';
describe('Explicit AutoBac game layouts',()=>{
 it('recommended phone mode retains DG desktop compatibility and native MT',()=>{
  expect(resolveGameDevice('DG','compatible','Mobile')).toBe('Desktop');
  expect(resolveGameDevice('MT','compatible','Mobile')).toBe('Mobile');
 });
 it('native Mobile is an explicit profile choice for both platforms',()=>{
  expect(resolveGameDevice('DG','native','Desktop')).toBe('Mobile');
  expect(resolveGameDevice('MT','native','Desktop')).toBe('Mobile');
 });
 it('desktop override is honored on phones',()=>{
  expect(resolveGameDevice('DG','desktop','Mobile')).toBe('Desktop');
  expect(resolveGameDevice('MT','desktop','Mobile')).toBe('Desktop');
 });
 it('recommended desktop mode does not change either platform',()=>{
  expect(resolveGameDevice('DG','compatible','Desktop')).toBe('Desktop');
  expect(resolveGameDevice('MT','compatible','Desktop')).toBe('Desktop');
 });
 it('iPad desktop-style user agent remains a Mobile device',()=>{
  expect(detectGameDevice({userAgent:'Mozilla/5.0 Macintosh',platform:'MacIntel',maxTouchPoints:5})).toBe('Mobile');
 });
});
