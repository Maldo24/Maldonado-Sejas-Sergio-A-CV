// Punto de entrada: inicializa cada parte interactiva de la página.
import { initClock } from './modules/clock.js';
import { initName } from './modules/name.js';
import { initRotator } from './modules/rotator.js';
import { initTicker, initCalendars } from './modules/decor.js';
import { initCopyMail } from './modules/copy-mail.js';
import { initPointer } from './modules/pointer.js';
import { initTopo } from './modules/topo.js';
import { initProgress } from './modules/progress.js';

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => [...document.querySelectorAll(sel)];

initClock($('#clock'));
initName($('.hero'));
initRotator($('#rot'));
initTicker($('#tick'));
initCalendars($$('[data-cal]')); // antes de initPointer, que clona las ilustraciones
initCopyMail($('#mail'), $('#copied'));
initPointer({ cursor: $('.cursor'), preview: $('.preview'), projects: $$('.p') });
initTopo($('#topo'));
initProgress($('.progress'));
