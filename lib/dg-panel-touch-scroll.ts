/** DOM-only panel gesture handling. Never reads or invokes a game/bet API. */
export function installDgPanelTouchScroll(root: ShadowRoot): () => void {
  type State = { x: number; y: number; lastX: number; lastY: number; vertical: HTMLElement[]; horizontal: HTMLElement[]; axis: 'x' | 'y' | null };
  let state: State | null = null;
  const ownerWindow = root.ownerDocument.defaultView as Window & typeof globalThis;

  function start(event: TouchEvent) {
    state = null;
    if (event.touches.length !== 1) return;
    // Stop bubble-phase game handlers from interpreting panel touches as canvas input.
    event.stopPropagation();
    const elements = event.composedPath().filter((node): node is HTMLElement => node instanceof ownerWindow.HTMLElement);
    const target = elements[0];
    if (!target || target.closest('#head,.resize-grip,input,textarea,select,[contenteditable="true"]')) return;
    const vertical: HTMLElement[] = [], horizontal: HTMLElement[] = [];
    for (const element of elements) {
      if (element === root.host) break;
      const style = ownerWindow.getComputedStyle(element);
      if (/auto|scroll/.test(style.overflowY) && element.scrollHeight > element.clientHeight + 1) vertical.push(element);
      if (/auto|scroll/.test(style.overflowX) && element.scrollWidth > element.clientWidth + 1) horizontal.push(element);
    }
    if (!vertical.length && !horizontal.length) return;
    const touch = event.touches[0];
    state = { x: touch.clientX, y: touch.clientY, lastX: touch.clientX, lastY: touch.clientY, vertical, horizontal, axis: null };
  }

  function move(event: TouchEvent) {
    if (event.touches.length !== 1) { state = null; return; }
    event.stopPropagation();
    if (!state) return;
    const touch = event.touches[0];
    const dx = touch.clientX - state.x, dy = touch.clientY - state.y;
    if (!state.axis) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 6) return;
      state.axis = Math.abs(dy) >= Math.abs(dx) ? 'y' : 'x';
    }
    const candidates = state.axis === 'y' ? state.vertical : state.horizontal;
    if (!candidates.length) return;
    // Some native canvas engines cancel touchmove at document capture phase.
    // Explicitly scrolling just the panel still works even if default is cancelled.
    if (event.cancelable) event.preventDefault();
    let remaining = state.axis === 'y' ? state.lastY - touch.clientY : state.lastX - touch.clientX;
    for (const element of candidates) {
      const scale = element.offsetHeight > 0 ? element.getBoundingClientRect().height / element.offsetHeight : 1;
      const divisor = scale > 0 ? scale : 1;
      const before = state.axis === 'y' ? element.scrollTop : element.scrollLeft;
      if (state.axis === 'y') element.scrollTop += remaining / divisor;
      else element.scrollLeft += remaining / divisor;
      const after = state.axis === 'y' ? element.scrollTop : element.scrollLeft;
      remaining -= (after - before) * divisor;
      if (Math.abs(remaining) < 1) break;
    }
    state.lastX = touch.clientX;
    state.lastY = touch.clientY;
  }

  function end(event: TouchEvent) {
    if (event.touches.length > 0) return;
    event.stopPropagation();
    // A swipe must never become a click on Start, Stop, or a settings control.
    if (state?.axis && event.cancelable) event.preventDefault();
    state = null;
  }
  root.addEventListener('touchstart', start as EventListener, { passive: true });
  root.addEventListener('touchmove', move as EventListener, { passive: false });
  root.addEventListener('touchend', end as EventListener, { passive: false });
  root.addEventListener('touchcancel', end as EventListener, { passive: false });
  return () => {
    root.removeEventListener('touchstart', start as EventListener);
    root.removeEventListener('touchmove', move as EventListener);
    root.removeEventListener('touchend', end as EventListener);
    root.removeEventListener('touchcancel', end as EventListener);
    state = null;
  };
}
