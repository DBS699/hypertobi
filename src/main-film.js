import './styles/main.css';
import './js/nav.js';
import { initI18n } from './js/i18n.js';
import { runIntro } from './js/intro.js';
import { initModelAmbient } from './js/model-reveal.js';
import { wireCompose, wireMailHint, val } from './js/compose.js';
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
