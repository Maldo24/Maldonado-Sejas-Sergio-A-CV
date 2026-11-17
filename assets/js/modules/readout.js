// Lectura de coordenadas y altitud bajo el cursor, como en un visor GIS.
// La hoja cubre un recuadro alrededor de Cochabamba (el mismo de las esquinas del marco).
window.CV = window.CV || {};

(() => {
  const { t, formatMeters } = window.CV;

  const BOX = { north: 17 + 20 / 60, south: 17 + 26 / 60, west: 66 + 15 / 60, east: 66 + 5 / 60 };

  const pad = (n) => String(n).padStart(2, '0');
  function dms(deg, hemi) {
    const d = Math.floor(deg);
    const mf = (deg - d) * 60;
    const m = Math.floor(mf);
    const s = Math.floor((mf - m) * 60);
    return `${d}°${pad(m)}′${pad(s)}″ ${hemi}`;
  }

  function initReadout(sheet, out, topo) {
    if (!sheet || !out || !topo) return;
    const initial = out.innerHTML;
    let pending = null;

    const render = () => {
      const { x, y, w, h } = pending;
      pending = null;
      const lat = BOX.north + (BOX.south - BOX.north) * (y / h);
      const lon = BOX.west + (BOX.east - BOX.west) * (x / w);
      const alt = formatMeters(topo.altitudeAt(x, y));
      out.innerHTML = `<b>${dms(lat, t.south)} · ${dms(lon, t.west)}</b> · ${alt} m`;
    };

    sheet.addEventListener('pointermove', (e) => {
      const r = sheet.getBoundingClientRect();
      if (!pending) requestAnimationFrame(render);
      pending = { x: e.clientX - r.left, y: e.clientY - r.top, w: r.width, h: r.height };
    });
    sheet.addEventListener('pointerleave', () => {
      pending = null;
      requestAnimationFrame(() => { if (!pending) out.innerHTML = initial; });
    });
  }

  Object.assign(window.CV, { initReadout });
})();
