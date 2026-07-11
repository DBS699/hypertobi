/* "Compose my request" — no booking backend: builds a message (shown in a
   box) that the visitor sends as a prefilled email or copies manually. */
import { t } from './i18n.js';

export function wireCompose({ trigger, box, msgEl, copyBtn, noteEl, build, requiredIds = [], watch = null }) {
  if (!trigger) return;

  trigger.addEventListener('click', () => {
    /* native validation bubbles, one field at a time */
    for (const id of requiredIds) {
      const el = document.getElementById(id);
      if (el && !el.reportValidity()) return;
    }
    msgEl.textContent = build();
    noteEl.textContent = '';
    box.hidden = false;
  });

  /* editing anything after composing would make the shown message (and the
     mailto link) stale — hide the box so the visitor rebuilds it */
  if (watch) {
    watch.addEventListener('input', (e) => {
      if (!box.hidden && !box.contains(e.target)) box.hidden = true;
    });
  }

  copyBtn.addEventListener('click', () => {
    const ok = () => { noteEl.textContent = t('copy_ok'); };
    const fail = () => {
      /* honest failure: select the text so Cmd/Ctrl+C works right away */
      noteEl.textContent = t('copy_fail');
      const range = document.createRange();
      range.selectNodeContents(msgEl);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(msgEl.textContent).then(ok, fail);
    } else {
      fail();
    }
  });
}

/* show a hint under the mailto link — if no mail app is configured the click
   fails silently, so always point to the copy fallback */
export function wireMailHint(mailLink, noteEl) {
  if (!mailLink || !noteEl) return;
  mailLink.addEventListener('click', () => {
    setTimeout(() => { noteEl.textContent = t('mail_hint'); }, 800);
  });
}

export const val = (id) => {
  const el = document.getElementById(id);
  return (el && el.value) || '—';
};
