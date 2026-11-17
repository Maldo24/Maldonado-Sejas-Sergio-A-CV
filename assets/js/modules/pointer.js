// Cursor propio y vista previa flotante de proyectos (solo con ratón).
import { finePointer, reducedMotion } from './env.js';

const CURSOR_EASE = reducedMotion ? 1 : .35;
const PREVIEW_EASE = reducedMotion ? 1 : .12;
const PREVIEW_OFFSET_X = 190;
const DESKTOP_MIN = 900;

// Construye la vista previa clonando la ilustración de cada proyecto,
// así el markup de cada arte existe una sola vez en el HTML.
function buildPreview(preview, projects) {
  return projects.map((p) => {
    const art = p.querySelector('.inline-art');
    const clone = art ? art.cloneNode(true) : document.createElement('div');
    clone.classList.remove('inline-art');
    clone.classList.add('pv');
    preview.appendChild(clone);
    return clone;
  });
}

export function initPointer({ cursor, preview, projects }) {
  if (!finePointer || !cursor) return;

  let x = innerWidth / 2, y = innerHeight / 2;
  let cx = x, cy = y, px = x, py = y;
  let raf = 0;

  // El bucle se detiene solo cuando el cursor y la vista previa ya alcanzaron al ratón.
  const loop = () => {
    cx += (x - cx) * CURSOR_EASE;
    cy += (y - cy) * CURSOR_EASE;
    px += (x - px) * PREVIEW_EASE;
    py += (y - py) * PREVIEW_EASE;
    cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
    if (preview) {
      preview.style.left = `${px + PREVIEW_OFFSET_X}px`;
      preview.style.top = `${py}px`;
    }
    const settled = Math.abs(x - px) < .5 && Math.abs(y - py) < .5 && Math.abs(x - cx) < .5 && Math.abs(y - cy) < .5;
    raf = settled ? 0 : requestAnimationFrame(loop);
  };

  addEventListener('pointermove', (e) => {
    x = e.clientX;
    y = e.clientY;
    if (!raf) raf = requestAnimationFrame(loop);
  }, { passive: true });

  // Delegación: un par de listeners en lugar de uno por enlace.
  const isTarget = (el) => el?.closest?.('[data-hover], a, button');
  document.addEventListener('pointerover', (e) => {
    cursor.classList.toggle('big', !!isTarget(e.target));
  });

  if (!preview || !projects.length) return;
  const slides = buildPreview(preview, projects);

  projects.forEach((p, i) => {
    p.addEventListener('pointerenter', () => {
      slides.forEach((s, k) => s.classList.toggle('on', k === i));
      if (innerWidth > DESKTOP_MIN) preview.classList.add('show');
    });
    p.addEventListener('pointerleave', () => preview.classList.remove('show'));
  });
}
