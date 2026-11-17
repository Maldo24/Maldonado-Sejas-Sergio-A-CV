// Preferencias del dispositivo, compartidas por todos los módulos.
const mq = (query) => window.matchMedia?.(query).matches ?? false;

export const reducedMotion = mq('(prefers-reduced-motion: reduce)');
export const finePointer = mq('(hover: hover) and (pointer: fine)');
