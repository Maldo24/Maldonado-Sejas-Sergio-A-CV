// Detalles decorativos que se generan en el cliente.

// Duplica el contenido del ticker para que la animación sea un bucle continuo.
export function initTicker(el) {
  if (el) el.innerHTML += el.innerHTML;
}

// Rellena los calendarios de Servineo: días ocupados (a) y la cita seleccionada (s).
const BUSY = new Set([3, 8, 10, 15, 22, 24]);
const SELECTED = 16;

export function initCalendars(els) {
  const html = Array.from({ length: 28 }, (_, d) => {
    const cls = d === SELECTED ? 's' : BUSY.has(d) ? 'a' : '';
    return `<span class="${cls}"></span>`;
  }).join('');
  els.forEach((el) => { el.innerHTML = html; });
}
