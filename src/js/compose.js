/* "Compose my request" — no booking backend: builds a message the visitor
   copies and sends via Instagram DM (per design). */
export function wireCompose({ trigger, box, msgEl, copyBtn, noteEl, build }) {
  if (!trigger) return;
  trigger.addEventListener('click', () => {
    msgEl.textContent = build();
    noteEl.textContent = '';
    box.hidden = false;
  });
  copyBtn.addEventListener('click', () => {
    const done = () => { noteEl.textContent = '✓ Copied'; };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(msgEl.textContent).then(done, done);
    } else { done(); }
  });
}

export const val = (id) => {
  const el = document.getElementById(id);
  return (el && el.value) || '—';
};
