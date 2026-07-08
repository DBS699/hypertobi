import './styles/main.css';
import { initI18n } from './js/i18n.js';
import { runIntro } from './js/intro.js';
import { initShatter } from './js/shatter.js';
import { wireCompose, val } from './js/compose.js';
import { initModelAmbient } from './js/model-reveal.js';
import { applyPhotos } from './js/content.js';

initI18n();
runIntro(document.querySelector('.page'));
initShatter();

/* ambient 3D: the camera sits in the hero facing you and follows the cursor —
   and takes one shot (screen flash) shortly after the page opens */
initModelAmbient({
  slot: '#model-slot',
  glb: '/models/minolta_dynax5_pink.glb',
  poster: '/renders/camera_pink.png',
  orbit: 0,
  alt: 'Minolta Dynax 5 SLR — 3D model',
  accent: '#E17BA4',
  follow: true
});

/* the shot: quick pre-flash, then the main flash washing over the page */
function takeTheShot() {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const f = document.createElement('div');
  f.style.cssText = 'position:fixed;inset:0;background:#fff;opacity:0;pointer-events:none;z-index:500;transition:opacity 60ms ease-in';
  document.body.appendChild(f);
  const step = (t, fn) => setTimeout(fn, t);
  step(0, () => { f.style.opacity = '0.5'; });                               /* pre-flash */
  step(90, () => { f.style.opacity = '0'; });
  step(240, () => { f.style.opacity = '1'; });                               /* the shot */
  step(330, () => { f.style.transition = 'opacity 500ms ease-out'; f.style.opacity = '0'; });
  step(950, () => f.remove());
}
setTimeout(takeTheShot, 1600);

/* print order → Instagram DM message */
wireCompose({
  trigger: document.getElementById('pr-send'),
  box: document.getElementById('pr-box'),
  msgEl: document.getElementById('pr-msg'),
  copyBtn: document.getElementById('pr-copy'),
  noteEl: document.getElementById('pr-note'),
  build: () =>
    "Hi Tobi! I'd like to order a print.\n" +
    'Photo: № ' + val('pr-photo') + '\n' +
    'Size: ' + val('pr-size') + '\n' +
    'Name: ' + val('pr-name')
});

/* CMS-managed gallery photos */
applyPhotos('.gallery-cols');
