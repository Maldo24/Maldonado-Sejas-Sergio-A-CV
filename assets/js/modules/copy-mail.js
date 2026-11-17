// Copia el correo al portapapeles; si no se puede, lo deja seleccionado.
export function initCopyMail(button, status) {
  if (!button) return;
  const email = button.dataset.email || button.textContent.trim();

  const done = () => { status.textContent = 'Correo copiado'; };
  const fallback = () => {
    const range = document.createRange();
    range.selectNodeContents(button);
    const sel = getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    status.textContent = 'Seleccionado: copia con Ctrl+C';
  };

  button.addEventListener('click', () => {
    if (!navigator.clipboard) return fallback();
    navigator.clipboard.writeText(email).then(done, fallback);
  });
}
