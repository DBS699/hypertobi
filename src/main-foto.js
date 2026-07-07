import './styles/main.css';
import { initI18n } from './js/i18n.js';
import { runIntro } from './js/intro.js';
import { initShatter } from './js/shatter.js';
import { wireCompose, val } from './js/compose.js';
import { initModelReveal } from './js/model-reveal.js';
import { applyPhotos } from './js/content.js';

initI18n();
runIntro(document.querySelector('.page'));
initShatter();

/* 3D reveal: Minolta Dynax 5 — Meshy-6 textured model (no baked clip;
   the old animated variant is /models/minolta_dynax5_anim.glb + clip: 'reveal') */
initModelReveal({
  slot: '#model-slot',
  glb: '/models/minolta_dynax5_pink.glb',
  poster: '/renders/camera_pink.png',
  orbit: 0,
  alt: 'Minolta Dynax 5 SLR — 3D model',
  accent: '#E17BA4',
  flash: true,
  follow: true,
  auto: { delay: 1800, label: 'Say cheese! 📸' }
});

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
