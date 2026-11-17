// Fondo de curvas de nivel: ruido de valor + marching squares sobre un canvas.
import { reducedMotion } from './env.js';

const LEVELS = 14;
const SCALE = 1 / 170;
const FRAME_MS = 80; // ~12 fps: suficiente para un movimiento lento
const SPEED = .004;

// Ruido de valor determinista
function hash(i, j) {
  const s = Math.sin(i * 127.1 + j * 311.7) * 43758.5453;
  return s - Math.floor(s);
}
function noise(x, y) {
  const i = Math.floor(x), j = Math.floor(y);
  const fx = x - i, fy = y - j;
  const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
  const a = hash(i, j), b = hash(i + 1, j), c = hash(i, j + 1), d = hash(i + 1, j + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
function field(x, y, t) {
  return noise(x * .9 + t, y * .9) * .6
       + noise(x * 2.1, y * 2.1 - t * .5) * .3
       + noise(x * 4.3, y * 4.3) * .1;
}

// Marching squares: para cada caso (bits a=8 b=4 c=2 d=1), pares de bordes a unir.
// Bordes: 0 arriba, 1 derecha, 2 abajo, 3 izquierda.
const CASES = [
  [], [3, 2], [2, 1], [3, 1], [0, 1], [3, 0, 2, 1], [0, 2], [3, 0],
  [3, 0], [0, 2], [0, 1, 3, 2], [0, 1], [3, 1], [2, 1], [3, 2], [],
];

export function initTopo(canvas) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = Math.min(devicePixelRatio || 1, 2);
  let W = 0, H = 0, t = 0, last = 0, color = '';
  let visible = true, raf = 0;

  const readColor = () => {
    color = getComputedStyle(document.documentElement).getPropertyValue('--contour').trim() || 'rgba(0,0,0,.08)';
  };

  const resize = () => {
    const r = canvas.getBoundingClientRect();
    W = r.width;
    H = r.height;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const draw = () => {
    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;

    const step = Math.max(14, Math.round(W / 90));
    const cols = Math.ceil(W / step) + 1;
    const rows = Math.ceil(H / step) + 1;
    const g = [];
    for (let j = 0; j < rows; j++) {
      g[j] = new Float32Array(cols);
      for (let i = 0; i < cols; i++) g[j][i] = field(i * step * SCALE, j * step * SCALE, t);
    }

    const pt = [[0, 0], [0, 0], [0, 0], [0, 0]];
    ctx.beginPath();
    for (let L = 1; L < LEVELS; L++) {
      const lv = L / LEVELS;
      const lerp = (p, q) => (lv - p) / (q - p);
      for (let j = 0; j < rows - 1; j++) {
        for (let i = 0; i < cols - 1; i++) {
          const a = g[j][i], b = g[j][i + 1], c = g[j + 1][i + 1], d = g[j + 1][i];
          const k = (a > lv ? 8 : 0) | (b > lv ? 4 : 0) | (c > lv ? 2 : 0) | (d > lv ? 1 : 0);
          const edges = CASES[k];
          if (!edges.length) continue;

          const X = i * step, Y = j * step;
          pt[0][0] = X + step * lerp(a, b); pt[0][1] = Y;
          pt[1][0] = X + step;              pt[1][1] = Y + step * lerp(b, c);
          pt[2][0] = X + step * lerp(d, c); pt[2][1] = Y + step;
          pt[3][0] = X;                     pt[3][1] = Y + step * lerp(a, d);

          for (let s = 0; s < edges.length; s += 2) {
            const p = pt[edges[s]], q = pt[edges[s + 1]];
            ctx.moveTo(p[0], p[1]);
            ctx.lineTo(q[0], q[1]);
          }
        }
      }
    }
    ctx.stroke();
  };

  const frame = (ts) => {
    raf = 0;
    if (!visible || document.hidden) return;
    if (ts - last > FRAME_MS) {
      t += SPEED;
      draw();
      last = ts;
    }
    raf = requestAnimationFrame(frame);
  };
  const start = () => {
    if (!reducedMotion && !raf && visible && !document.hidden) raf = requestAnimationFrame(frame);
  };

  readColor();
  resize();
  draw();

  let resizeRaf = 0;
  addEventListener('resize', () => {
    cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(() => { resize(); draw(); });
  }, { passive: true });

  // Volver a leer el color si cambia el tema del sistema.
  window.matchMedia?.('(prefers-color-scheme: dark)').addEventListener?.('change', () => {
    readColor();
    draw();
  });

  // Pausar la animación cuando el hero no se ve o la pestaña está oculta.
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    start();
  }).observe(canvas);
  document.addEventListener('visibilitychange', start);

  start();
}
