import './styles/main.css';
import { initI18n } from './js/i18n.js';
import { runIntro } from './js/intro.js';
import { initShatter } from './js/shatter.js';
import { initModelAmbient } from './js/model-reveal.js';
import { applyPortfolio } from './js/content.js';

initI18n();
runIntro(document.querySelector('.page'));
initShatter();

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
