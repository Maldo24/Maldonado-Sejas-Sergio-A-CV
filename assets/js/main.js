// Punto de entrada: inicializa cada parte interactiva de la página.
// Los módulos son scripts clásicos (no ES modules) para que el sitio también
// funcione al abrir el HTML directamente desde el disco (file://).
// Cada uno se registra en window.CV; el orden de los <script defer> importa.
(() => {
  const { initClock, initName, initTopo, initReadout, initProfile, initCopyMail } = window.CV;

  const $ = (sel) => document.querySelector(sel);

  const sheet = $('.sheet');
  const topo = initTopo($('#topo'));

  initClock($('#clock'));
  initName(sheet);
  initReadout(sheet, $('#readout'), topo);
  initProfile($('#profile'), $('.log'));
  initCopyMail($('#mail'), $('#copied'));
})();
