// Copia el correo al portapapeles; si no se puede, lo deja seleccionado.
window.CV = window.CV || {};

(() => {
  const { t } = window.CV;

  function initCopyMail(button, status) {
    if (!button || !status) return;
    const email = button.dataset.email || button.textContent.trim();

    const done = () => {
      status.textContent = t.copied;
      status.classList.add('ok');
    };
    const fallback = () => {
      const range = document.createRange();
      range.selectNodeContents(button);
      const sel = getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      status.textContent = t.selected;
    };

    button.addEventListener('click', () => {
      if (!navigator.clipboard) return fallback();
      navigator.clipboard.writeText(email).then(done, fallback);
    });
  }

  Object.assign(window.CV, { initCopyMail });
})();
