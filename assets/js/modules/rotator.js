// Rotador de roles en el hero.
import { reducedMotion } from './env.js';

const INTERVAL = 2600;
const EXIT_MS = 650;

export function initRotator(el) {
  if (!el || reducedMotion) return;
  const items = el.children;
  if (items.length < 2) return;

  let i = 0;
  setInterval(() => {
    if (document.hidden) return;
    const cur = items[i];
    cur.classList.remove('on');
    cur.classList.add('out');

    i = (i + 1) % items.length;
    const next = items[i];
    next.classList.remove('out');
    void next.offsetWidth; // reinicia la transición
    next.classList.add('on');

    setTimeout(() => cur.classList.remove('out'), EXIT_MS);
  }, INTERVAL);
}
