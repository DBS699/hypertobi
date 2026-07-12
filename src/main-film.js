import './styles/main.css';
import './js/nav.js';
import { initI18n, t, current } from './js/i18n.js';
import { runIntro } from './js/intro.js';
import { initModelAmbient } from './js/model-reveal.js';
import { wireCompose, wireDirectSend, wireMailHint, val } from './js/compose.js';
import { applyFilmRun } from './js/content.js';

initI18n();
runIntro(document.querySelector('.page'));

/* ambient 3D: darkroom enlarger, watching the cursor (the film roll and the
   old animated cassette are still on disk if ever wanted again) */
initModelAmbient({
  slot: '#model-slot',
  glb: '/models/enlarger_meshy6.glb',
  poster: '/renders/enlarger_meshy6.png',
  alt: 'Darkroom enlarger — 3D model',
  accent: '#8A63D2',
  orbit: 0,
  follow: true
});

/* CMS-managed dev-run date + slots */
applyFilmRun();

/* dev-run sign-up -> email to boschungservices@gmail.com */
wireCompose({
  trigger: document.getElementById('fd-send'),
  box: document.getElementById('fd-box'),
  msgEl: document.getElementById('fd-msg-out'),
  copyBtn: document.getElementById('fd-copy'),
  noteEl: document.getElementById('fd-note'),
  requiredIds: ['fd-name', 'fd-email'],
  watch: document.getElementById('devrun'),
  build: () =>
    'Hi Tobi! Ich melde mich für die nächste Filmentwicklung an.\n' +
    'Name: ' + val('fd-name') + '\n' +
    'Email: ' + val('fd-email') + '\n' +
    'Anzahl Filme: ' + val('fd-count') + '\n' +
    'Filmtyp: ' + val('fd-type') + '\n' +
    'Format: ' + val('fd-format') + '\n' +
    'Push/Pull: ' + val('fd-push') + '\n' +
    'Bemerkungen: ' + val('fd-msg')
});

/* fill the mailto link whenever the message box is (re)built */
document.getElementById('fd-send').addEventListener('click', () => {
  const msg = document.getElementById('fd-msg-out').textContent;
  const mail = document.getElementById('fd-mail');
  mail.href = 'mailto:boschungservices@gmail.com'
    + '?subject=' + encodeURIComponent('Anmeldung Filmentwicklung — ' + (document.getElementById('fd-name').value || ''))
    + '&body=' + encodeURIComponent(msg);
});
wireMailHint(document.getElementById('fd-mail'), document.getElementById('fd-note'));

wireDirectSend({
  button: document.getElementById('fd-direct'),
  noteEl: document.getElementById('fd-note'),
  getPayload: () => ({
    subject: 'Anmeldung Filmentwicklung — ' + val('fd-name'),
    message: document.getElementById('fd-msg-out').textContent,
    name: document.getElementById('fd-name').value,
    email: document.getElementById('fd-email').value,
    website: ''
  })
});

/* sign up & pay now -> Stripe Checkout (CHF 20 x rolls, details ride in metadata) */
document.getElementById('fd-pay').addEventListener('click', async () => {
  for (const id of ['fd-name', 'fd-email']) {
    const el = document.getElementById(id);
    if (el && !el.reportValidity()) return;
  }
  const btn = document.getElementById('fd-pay');
  const note = document.getElementById('fd-note');
  const original = btn.textContent;
  btn.disabled = true;
  btn.textContent = t('ft_pay_loading');
  try {
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'film',
        count: val('fd-count'),
        lang: current(),
        details: {
          name: val('fd-name'),
          email: val('fd-email'),
          filmtype: val('fd-type'),
          format: val('fd-format'),
          push: val('fd-push'),
          notes: document.getElementById('fd-msg').value
        }
      })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.url) throw new Error('checkout failed');
    window.location.href = data.url;
  } catch (e) {
    btn.disabled = false;
    btn.textContent = original;
    note.textContent = t('ft_pay_fail');
  }
});
