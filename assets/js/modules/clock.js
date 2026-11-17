// Hora local de Cochabamba (UTC-4) en la marginalia.
window.CV = window.CV || {};

(() => {
  const { t } = window.CV;

  function initClock(el) {
    if (!el) return;

    let format;
    try {
      format = new Intl.DateTimeFormat(t.locale, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'America/La_Paz',
      });
    } catch {
      return; // se queda el texto del HTML
    }

    const tick = () => { el.textContent = format.format(new Date()); };
    tick();
    setInterval(tick, 15_000);
  }

  Object.assign(window.CV, { initClock });
})();
