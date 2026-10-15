import { describe, expect, it, vi } from 'vitest';
import { runInNewContext } from 'node:vm';
import { PAGE_VIEWPORT_CONTENT, PAGE_ZOOM_LOCK_SCRIPT, withPageZoomLock } from '../shared/page-zoom-lock';
import { DG_MOBILE_LAYOUT_CSS } from '../lib/dg-panel-mobile-layout';

function fixture() {
  const nodes: any[] = [], handlers = new Map<string, any[]>();
  const head = { appendChild: (node: any) => { nodes.push(node); return node; } };
  const document: any = { head, documentElement: head,
    createElement: (tag: string) => ({ tagName: tag.toUpperCase(), remove() { const index = nodes.indexOf(this); if(index >= 0) nodes.splice(index,1); } }),
    querySelectorAll: () => nodes.filter(node => node.tagName === 'META' && node.name === 'viewport'),
    addEventListener: (name: string, handler: any, options: any) => { expect(options?.passive).not.toBe(true); handlers.set(name,[...(handlers.get(name)||[]),handler]); },
  };
  const window: any = {};
  function fire(name: string, props = {}) { const event = { cancelable: true, preventDefault: vi.fn(), ...props }; handlers.get(name)?.forEach(handler => handler(event)); return event.preventDefault; }
  return { document, window, nodes, handlers, fire };
}

describe('requested fixed page scale', () => {
  it('deduplicates upstream viewport and is idempotent without changing game script bodies', () => {
    const raw='<html><head><meta content="width=800" name="viewport"><meta name=viewport content="initial-scale=2"><script>var action="/api/v1/bet";</script></head><body>game</body></html>';
    const fixed=withPageZoomLock(raw);
    expect(fixed.match(/<meta\b[^>]*name="viewport"[^>]*>/g)).toHaveLength(1);
    expect(fixed).toContain(PAGE_VIEWPORT_CONTENT);
    expect(fixed).toContain('var action="/api/v1/bet";');
    expect(withPageZoomLock(fixed)).toBe(fixed);
  });
  it('starts at scale 1 and installs once', () => {
    const f=fixture();runInNewContext(PAGE_ZOOM_LOCK_SCRIPT,f);
    expect(f.document.querySelectorAll()[0].content).toBe(PAGE_VIEWPORT_CONTENT);
    const count=f.nodes.length;runInNewContext(PAGE_ZOOM_LOCK_SCRIPT,f);expect(f.nodes).toHaveLength(count);
  });
  it('blocks pinch gestures but never cancels single-finger scrolling', () => {
    const f=fixture();runInNewContext(PAGE_ZOOM_LOCK_SCRIPT,f);
    expect(f.fire('gesturestart')).toHaveBeenCalledOnce();
    expect(f.fire('gesturechange')).toHaveBeenCalledOnce();
    expect(f.fire('touchstart',{touches:[{},{}]})).toHaveBeenCalledOnce();
    expect(f.fire('touchmove',{touches:[{},{}],scale:1.2})).toHaveBeenCalledOnce();
    expect(f.fire('touchmove',{touches:[{}],scale:1})).not.toHaveBeenCalled();
  });
  it('blocks keyboard/ctrl-wheel page zoom but preserves ordinary scroll and text input', () => {
    const f=fixture();runInNewContext(PAGE_ZOOM_LOCK_SCRIPT,f);
    expect(f.fire('wheel',{ctrlKey:true})).toHaveBeenCalledOnce();
    expect(f.fire('wheel',{ctrlKey:false})).not.toHaveBeenCalled();
    expect(f.fire('keydown',{ctrlKey:true,key:'+'})).toHaveBeenCalledOnce();
    expect(f.fire('keydown',{metaKey:true,key:'0'})).toHaveBeenCalledOnce();
    expect(f.fire('keydown',{key:'5'})).not.toHaveBeenCalled();
    expect(f.fire('keydown',{ctrlKey:true,key:'c'})).not.toHaveBeenCalled();
  });
  it('keeps mobile text fields at 16px both outside and inside the shadow panel', () => {
    expect(PAGE_ZOOM_LOCK_SCRIPT).toContain('font-size:16px!important');
    expect(DG_MOBILE_LAYOUT_CSS).toContain('font-size:16px!important');
    expect(PAGE_ZOOM_LOCK_SCRIPT).not.toMatch(/(?:WebSocket|fetch\()/);
  });
});
