// Textos que genera el JS, según el idioma de la página (<html lang>).
window.CV = window.CV || {};

(() => {
  const lang = document.documentElement.lang.startsWith('en') ? 'en' : 'es';

  const STRINGS = {
    es: {
      locale: 'es-BO',
      copied: 'Correo copiado',
      selected: 'Seleccionado: copia con Ctrl+C',
      south: 'S',
      west: 'O',
      thousands: '.',
    },
    en: {
      locale: 'en-GB',
      copied: 'Email copied',
      selected: 'Selected: press Ctrl+C to copy',
      south: 'S',
      west: 'W',
      thousands: ',',
    },
  };

  const t = STRINGS[lang];

  // 2558 -> "2.558" (es) / "2,558" (en). Intl omite el separador en números de
  // 4 cifras en español, así que se formatea a mano para que coincida con el HTML.
  const formatMeters = (n) =>
    String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, t.thousands);

  Object.assign(window.CV, { lang, t, formatMeters });
})();
