import './styles/main.css';
import './js/nav.js';
import { initI18n } from './js/i18n.js';
import { runIntro } from './js/intro.js';
import { initModelAmbient } from './js/model-reveal.js';
import { wireCompose, wireMailHint, val } from './js/compose.js';
import { applyPortfolio } from './js/content.js';

initI18n();
runIntro(document.querySelector('.page'));

/* ambient 3D: the retro computer sits in the hero from page load and turns
   to follow the visitor's cursor */
initModelAmbient({
  slot: '#model-slot',
  glb: '/models/computer_meshy6.glb',
  poster: '/renders/computer_meshy6.png',
  alt: 'Retro computer — 3D model',
  accent: '#2E5BFF',
  orbit: 0,
  follow: true
});

/* the smiley winks once shortly after the model is up ;) — swaps the model's
   base color texture against a variant with the right eye closed */
async function winkOnce() {
  const mv = document.querySelector('#model-slot model-viewer');
  if (!mv) return setTimeout(winkOnce, 400);
  const doWink = async () => {
    try {
      const mat = mv.model.materials[0];
      const texSlot = mat.pbrMetallicRoughness.baseColorTexture;
      const openEyes = texSlot.texture;
      const wink = await mv.createTexture('/textures/computer_wink.jpg');
      texSlot.setTexture(wink);
      setTimeout(() => texSlot.setTexture(openEyes), 450);
    } catch (e) { /* texture API unavailable — skip the wink */ }
  };
  if (mv.loaded) setTimeout(doWink, 800);
  else mv.addEventListener('load', () => setTimeout(doWink, 800), { once: true });
}
setTimeout(winkOnce, 1500);

/* CMS-managed live portfolio */
applyPortfolio();

/* project inquiry -> email to boschungservices@gmail.com */
wireCompose({
  trigger: document.getElementById('wb-send'),
  box: document.getElementById('wb-box'),
  msgEl: document.getElementById('wb-msg'),
  copyBtn: document.getElementById('wb-copy'),
  noteEl: document.getElementById('wb-note'),
  requiredIds: ['wb-name', 'wb-email'],
  watch: document.getElementById('anfrage'),
  build: () =>
    'Hi Tobi! Ich interessiere mich für eine Website.\n' +
    'Projekt: ' + val('wb-type') + '\n' +
    'Name: ' + val('wb-name') + '\n' +
    'E-Mail: ' + val('wb-email') + '\n' +
    'Beschreibung: ' + val('wb-msg-in')
});

/* fill the mailto link whenever the message box is (re)built */
document.getElementById('wb-send').addEventListener('click', () => {
  const msg = document.getElementById('wb-msg').textContent;
  const mail = document.getElementById('wb-mail');
  mail.href = 'mailto:boschungservices@gmail.com'
    + '?subject=' + encodeURIComponent('Website-Anfrage — ' + (document.getElementById('wb-name').value || ''))
    + '&body=' + encodeURIComponent(msg);
});
wireMailHint(document.getElementById('wb-mail'), document.getElementById('wb-note'));
