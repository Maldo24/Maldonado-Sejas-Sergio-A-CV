// Hora local de Bolivia (UTC-4) en la barra superior.
export function initClock(el) {
  if (!el) return;

  let format;
  try {
    format = new Intl.DateTimeFormat('es-BO', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'America/La_Paz',
    });
  } catch {
    el.textContent = '';
    return;
  }

  const tick = () => { el.textContent = format.format(new Date()); };
  tick();
  setInterval(tick, 15_000);
}
