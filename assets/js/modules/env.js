// Preferencias del dispositivo, compartidas por todos los módulos.
window.CV = window.CV || {};

(() => {
  const mq = (query) => window.matchMedia?.(query).matches ?? false;

  const reducedMotion = mq('(prefers-reduced-motion: reduce)');
  const finePointer = mq('(hover: hover) and (pointer: fine)');

  Object.assign(window.CV, { reducedMotion, finePointer });
})();
