export function installDgButtonFeedback(root: ShadowRoot): () => void {
  const timers = new Map<HTMLElement, ReturnType<typeof setTimeout>>();
  let held: HTMLElement | null = null;
  function button(event: Event): HTMLElement | null {
    const node = event.target instanceof Element
      ? event.target.closest<HTMLElement>('button,[role="button"]') : null;
    return node && !(node instanceof HTMLButtonElement && node.disabled) ? node : null;
  }
  function clear(node: HTMLElement) {
    const timer = timers.get(node);
    if (timer) clearTimeout(timer);
    timers.delete(node);
    node.removeAttribute('data-pressed');
  }
  function release() {
    if (held) clear(held);
    held = null;
  }
  function press(event: Event) {
    release();
    held = button(event);
    if (held) held.dataset.pressed = 'true';
  }
  function keydown(event: Event) {
    const e = event as KeyboardEvent;
    if (e.key === 'Enter' || e.key === ' ') press(e);
  }
  function keyup(event: Event) {
    const e = event as KeyboardEvent;
    if (e.key === 'Enter' || e.key === ' ') release();
  }
  function click(event: Event) {
    const node = button(event);
    if (!node) return;
    clear(node);
    node.dataset.pressed = 'true';
    timers.set(node, setTimeout(() => clear(node), 160));
  }
  root.addEventListener('pointerdown', press, true);
  root.addEventListener('pointerup', release, true);
  root.addEventListener('pointercancel', release, true);
  root.addEventListener('pointerout', release, true);
  root.addEventListener('keydown', keydown, true);
  root.addEventListener('keyup', keyup, true);
  root.addEventListener('click', click, true);
  return () => {
    release();
    for (const node of [...timers.keys()]) clear(node);
    root.removeEventListener('pointerdown', press, true);
    root.removeEventListener('pointerup', release, true);
    root.removeEventListener('pointercancel', release, true);
    root.removeEventListener('pointerout', release, true);
    root.removeEventListener('keydown', keydown, true);
    root.removeEventListener('keyup', keyup, true);
    root.removeEventListener('click', click, true);
  };
}
