// Barra de progreso de lectura. Solo hace falta JS en navegadores
// sin scroll-driven animations; en el resto lo resuelve el CSS.
export function initProgress(bar) {
  if (!bar || CSS.supports?.('animation-timeline: scroll()')) return;

  const root = document.documentElement;
  let raf = 0;
  const update = () => {
    raf = 0;
    const max = root.scrollHeight - root.clientHeight || 1;
    bar.style.transform = `scaleX(${root.scrollTop / max})`;
  };

  addEventListener('scroll', () => {
    if (!raf) raf = requestAnimationFrame(update);
  }, { passive: true });
  update();
}
