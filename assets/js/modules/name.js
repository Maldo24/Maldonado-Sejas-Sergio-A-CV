// Nombre gigante: lo parte en letras y ajusta el ancho/peso de cada una
// según la cercanía del cursor.
window.CV = window.CV || {};

(() => {
  const { finePointer, reducedMotion } = window.CV;

  const RADIUS = 380;

  function splitRows(rows) {
    const chars = [];
    rows.forEach((row) => {
      const text = row.textContent;
      row.textContent = '';
      for (const c of text) {
        const span = document.createElement('span');
        span.className = 'ch';
        span.textContent = c;
        span.setAttribute('aria-hidden', 'true');
        row.appendChild(span);
        chars.push(span);
      }
    });
    return chars;
  }

  function initName(hero) {
    const chars = splitRows(hero.querySelectorAll('[data-split]'));
    if (!finePointer || reducedMotion || !chars.length) return;

    // Centros en coordenadas de página. Se miden una sola vez (y al redimensionar)
    // para no forzar un layout por letra en cada movimiento del ratón.
    let centers = [];
    const measure = () => {
      centers = chars.map((c) => {
        const r = c.getBoundingClientRect();
        return { x: r.left + r.width / 2 + scrollX, y: r.top + r.height / 2 + scrollY };
      });
    };
    measure();
    addEventListener('resize', measure, { passive: true });
    document.fonts?.ready.then(measure);
    hero.addEventListener('pointerenter', measure); // por si la animación de entrada aún movía las letras

    let pending = null;
    const apply = () => {
      const { x, y } = pending;
      pending = null;
      chars.forEach((c, i) => {
        const d = Math.hypot(x - centers[i].x, (y - centers[i].y) * 1.4);
        const f = Math.max(0, 1 - d / RADIUS);
        c.style.setProperty('--w', (100 - 28 * f).toFixed(1));
        c.style.setProperty('--g', (800 + 100 * f).toFixed(0));
      });
    };

    hero.addEventListener('pointermove', (e) => {
      if (!pending) requestAnimationFrame(apply);
      pending = { x: e.pageX, y: e.pageY };
    });

    hero.addEventListener('pointerleave', () => {
      chars.forEach((c) => {
        c.style.removeProperty('--w');
        c.style.removeProperty('--g');
      });
    });
  }

  Object.assign(window.CV, { initName });
})();
