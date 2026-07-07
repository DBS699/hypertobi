import './styles/main.css';
import { gsap } from 'gsap';
import { initI18n } from './js/i18n.js';
import { reducedMotion, initScrollEffects, initHeroWave } from './js/intro.js';
import { initShatter } from './js/shatter.js';
import { initPeel } from './js/peel.js';
import { initOven } from './js/oven.js';

/* home has its own entrance (kicker → headline words → sub → tiles → footer) */
let introRan = false;
function homeIntro() {
  if (introRan || reducedMotion()) return;
  introRan = true;
  const root = document.querySelector('.page');
  const q = gsap.utils.selector(root);
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  tl.from(q('[data-anim="kicker"]'), { y: -16, opacity: 0, duration: 0.5 })
    .from(q('[data-anim="h1"] > span'), { y: 54, opacity: 0, rotate: -5, duration: 0.7, stagger: 0.07, ease: 'back.out(1.6)' }, '-=0.25')
    .from(q('[data-anim="sub"]'), { y: 22, opacity: 0, duration: 0.5 }, '-=0.35')
    .from(q('[data-anim="tile"]'), {
      y: 60, opacity: 0, scale: 0.82, duration: 0.8, stagger: 0.11, ease: 'elastic.out(1, 0.55)',
      rotate: (i) => (i % 2 ? 3.5 : -3.5),
      skewX: (i) => (i % 2 ? -4 : 4),
      clearProps: 'transform,opacity'
    }, '-=0.25')
    .from(q('footer'), { opacity: 0, y: 12, duration: 0.45 }, '-=0.3');

  /* safety net: if the timeline never advances (hidden/background tab),
     un-hide everything so the page can't stay invisible */
  const all = q('[data-anim="kicker"], [data-anim="h1"] > span, [data-anim="sub"], [data-anim="tile"], footer');
  setTimeout(() => {
    if (tl.progress() === 0) {
      tl.kill();
      gsap.set(all, { clearProps: 'opacity,transform' });
    }
  }, 3000);
}

initI18n();
initOven(homeIntro);
initPeel();
initShatter();
initHeroWave(document.querySelector('.page'), { interval: 5 });
