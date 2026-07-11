import './styles/main.css';
import './js/nav.js';
import { initI18n } from './js/i18n.js';
import { runIntro } from './js/intro.js';
import { wireCompose, wireMailHint, val } from './js/compose.js';
import { initModelAmbient } from './js/model-reveal.js';
import { applyPizzaPrices } from './js/content.js';

initI18n();
runIntro(document.querySelector('.page'));

/* ambient 3D: the margherita is just there, turning like a record from the
   moment the page loads (Gozney still on disk: /models/gozney_meshy6.glb). */
initModelAmbient({
  slot: '#model-slot',
  glb: '/models/pizza_meshy6.glb',
  poster: '/renders/pizza_meshy6.png',
  polar: 60,
  alt: 'Neapolitan margherita pizza — 3D model',
  accent: '#E8402A',
  spin: { delay: 0, speed: 25 }
});

/* booking -> email to boschungservices@gmail.com */
/* no events in the past */
document.getElementById('bk-date').min = new Date().toISOString().slice(0, 10);
wireCompose({
  trigger: document.getElementById('bk-send'),
  box: document.getElementById('bk-box'),
  msgEl: document.getElementById('bk-msg'),
  copyBtn: document.getElementById('bk-copy'),
  noteEl: document.getElementById('bk-note'),
  requiredIds: ['bk-name', 'bk-email', 'bk-date'],
  watch: document.getElementById('booking'),
  build: () =>
    'Hi Tobi! Ich möchte buchen: ' + val('bk-type') + '\n' +
    'Name: ' + val('bk-name') + '\n' +
    'Email: ' + val('bk-email') + '\n' +
    'Datum: ' + val('bk-date') + '\n' +
    'Gäste: ' + val('bk-guests') + '\n' +
    'Ort: ' + val('bk-where') + '\n' +
    'Bemerkungen: ' + val('bk-msg-in')
});

/* fill the mailto link whenever the message box is (re)built */
document.getElementById('bk-send').addEventListener('click', () => {
  const msg = document.getElementById('bk-msg').textContent;
  const mail = document.getElementById('bk-mail');
  mail.href = 'mailto:boschungservices@gmail.com'
    + '?subject=' + encodeURIComponent('Anfrage ' + (val('bk-type') || 'Catering') + ' — ' + (document.getElementById('bk-name').value || ''))
    + '&body=' + encodeURIComponent(msg);
});
wireMailHint(document.getElementById('bk-mail'), document.getElementById('bk-note'));

/* CMS-managed package prices */
applyPizzaPrices();
