import './styles/main.css';
import { initI18n } from './js/i18n.js';
import { runIntro } from './js/intro.js';
import { initShatter } from './js/shatter.js';
import { initModelAmbient } from './js/model-reveal.js';

initI18n();
runIntro(document.querySelector('.page'));
initShatter();

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
