// Perfil de elevación de la bitácora. Se construye a partir de la lista <ol class="log">:
// cada <li> es un punto de la ruta (data-type = star | work | edu, data-year, data-short).
// La altura solo sube con el tiempo; los hitos (★) quedan un poco más arriba.
window.CV = window.CV || {};

(() => {
  const NS = 'http://www.w3.org/2000/svg';
  const PAD = { top: 44, right: 16, bottom: 28, left: 16 };

  const r1 = (n) => Math.round(n * 10) / 10;

  // Curva suave que pasa por todos los puntos (Catmull-Rom -> Bézier)
  function smoothPath(p) {
    let d = `M${r1(p[0][0])},${r1(p[0][1])}`;
    for (let i = 0; i < p.length - 1; i++) {
      const p0 = p[i - 1] || p[i], p1 = p[i], p2 = p[i + 1], p3 = p[i + 2] || p2;
      const c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6;
      const c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6;
      d += ` C${r1(c1x)},${r1(c1y)} ${r1(c2x)},${r1(c2y)} ${r1(p2[0])},${r1(p2[1])}`;
    }
    return d;
  }

  function symbol(type) {
    switch (type) {
      case 'star': return '<path class="s" d="M0,-8 L2.4,-2.6 8,-2.4 3.7,1.2 5.1,7 0,3.8 -5.1,7 -3.7,1.2 -8,-2.4 -2.4,-2.6Z"/>';
      case 'work': return '<rect class="s" x="-4.5" y="-4.5" width="9" height="9"/>';
      case 'edu': return '<path class="s" d="M0,-6 L5.5,4.5 -5.5,4.5Z"/>';
      default: return '<circle class="s" r="4.5"/>';
    }
  }

  function initProfile(fig, list) {
    if (!fig || !list) return;
    const items = [...list.children].reverse(); // del más antiguo al más reciente
    const n = items.length;
    if (n < 2) return;
    items.forEach((li, i) => { li.dataset.i = i; });

    const elev = items.map((li, i) => {
      const base = .1 + .78 * Math.pow(i / (n - 1), 1.15);
      return Math.min(1, li.dataset.type === 'star' ? base + .08 : base);
    });

    const draw = () => {
      const W = fig.clientWidth, H = fig.clientHeight;
      if (!W || !H) return;
      const innerW = W - PAD.left - PAD.right;
      const baseY = H - PAD.bottom;
      const edge = Math.min(48, innerW * .05); // margen para que la curva entre y salga suave
      const x = (i) => PAD.left + edge + (innerW - 2 * edge) * (i / (n - 1));
      const y = (e) => baseY - (baseY - PAD.top) * e;

      // Terreno: los puntos de la ruta con un pequeño valle entre cada par
      const pts = [[PAD.left, y(.03)]];
      for (let i = 0; i < n; i++) {
        pts.push([x(i), y(elev[i])]);
        if (i < n - 1) {
          const dip = Math.min(elev[i], elev[i + 1]) - .06 - .04 * ((i * 7) % 3) / 2;
          pts.push([(x(i) + x(i + 1)) / 2, y(Math.max(.02, dip))]);
        }
      }
      pts.push([W - PAD.right, y(elev[n - 1] - .05)]);
      const line = smoothPath(pts);

      const wide = W > 640;
      let svg = `<defs><pattern id="pf-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <line class="pf-hatch" x1="0" y1="0" x2="0" y2="6"/></pattern></defs>`;

      // Equidistancia: líneas de referencia horizontales
      for (let k = 1; k <= 4; k++) {
        svg += `<line class="pf-grid" x1="${PAD.left}" x2="${W - PAD.right}" y1="${r1(y(k / 4))}" y2="${r1(y(k / 4))}"/>`;
      }

      svg += `<path class="pf-area" d="${line} L${W - PAD.right},${baseY} L${PAD.left},${baseY} Z"/>`;
      svg += `<path class="pf-line" d="${line}"/>`;
      svg += `<line class="pf-base" x1="${PAD.left}" x2="${W - PAD.right}" y1="${baseY}" y2="${baseY}"/>`;

      // Años bajo la línea base (solo cuando cambia)
      let prevYear = '';
      items.forEach((li, i) => {
        const yr = li.dataset.year || '';
        if (yr && yr !== prevYear) {
          svg += `<text class="pf-txt" x="${r1(x(i))}" y="${baseY + 18}" text-anchor="middle">${yr}</text>`;
        }
        prevYear = yr;
      });

      // Marcadores
      items.forEach((li, i) => {
        const px = r1(x(i)), py = r1(y(elev[i]));
        const type = li.dataset.type || '';
        const no = String(i + 1).padStart(2, '0');
        const label = wide && li.dataset.short
          ? `<text class="pf-lbl" x="-10" y="-30" text-anchor="end">${li.dataset.short}</text>` : '';
        svg += `<line class="pf-drop" x1="${px}" x2="${px}" y1="${py + 8}" y2="${baseY}"/>`;
        svg += `<g class="pf-mk ${type}" data-i="${i}" transform="translate(${px},${py})">
          <circle class="hit" r="16"/>${symbol(type)}
          <text class="pf-txt" y="-14" text-anchor="middle">${no}</text>${label}</g>`;
      });

      fig.innerHTML = `<svg xmlns="${NS}" viewBox="0 0 ${W} ${H}" aria-hidden="true">${svg}</svg>`;
    };

    // Resaltado cruzado entre el perfil y la lista
    const setOn = (i) => {
      items.forEach((li, k) => li.classList.toggle('on', k === i));
      fig.querySelectorAll('.pf-mk').forEach((m) => m.classList.toggle('on', +m.dataset.i === i));
    };
    fig.addEventListener('pointerover', (e) => {
      const mk = e.target.closest?.('.pf-mk');
      setOn(mk ? +mk.dataset.i : -1);
    });
    fig.addEventListener('pointerleave', () => setOn(-1));
    items.forEach((li, i) => {
      li.addEventListener('pointerenter', () => setOn(i));
      li.addEventListener('pointerleave', () => setOn(-1));
    });

    new ResizeObserver(draw).observe(fig);
    draw();
  }

  Object.assign(window.CV, { initProfile });
})();
