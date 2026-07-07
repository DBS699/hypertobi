/* Oven intro (home) — the pizza-in-the-oven curtain. Port of the prototype's
   bake() timeline. MODE mirrors the design file's ovenIntro prop:
   'every visit' | 'once per session' | 'off' (design default: 'off'). */
import { gsap } from 'gsap';
import { reducedMotion } from './intro.js';

const MODE = 'off';
const SEEN_KEY = 'hyperOvenSeen';

export function initOven(onDone) {
  const oven = document.getElementById('oven-intro');
  const isOn = () => {
    if (MODE === 'off' || !oven) return false;
    if (reducedMotion()) return false;
    if (MODE === 'once per session') {
      try { if (sessionStorage.getItem(SEEN_KEY)) return false; } catch (e) { /* ignore */ }
    }
    return true;
  };

  if (!isOn()) {
    if (oven) oven.remove();
    onDone();
    return;
  }

  oven.hidden = false;
  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    try { sessionStorage.setItem(SEEN_KEY, '1'); } catch (e) { /* ignore */ }
  };

  let baking = false;
  const bake = () => {
    if (baking) return;
    baking = true;
    const q = gsap.utils.selector(oven);
    const tl = gsap.timeline({ onComplete: () => { finish(); oven.remove(); } });
    tl.to(q('[data-ov="peelgrp"]'), { x: 320, y: 46, duration: 0.7, ease: 'power2.inOut' })
      .to(q('[data-ov="pizza"]'), { scale: 0.35, opacity: 0, duration: 0.35, ease: 'power2.in' }, '-=0.25')
      .to(q('[data-ov="peelgrp"]'), { x: 0, y: 0, duration: 0.55, ease: 'power2.inOut' }, '+=0.05')
      .fromTo(q('[data-ov="flame"]'), { scale: 0 }, { scale: 1, duration: 0.45, stagger: 0.07, ease: 'back.out(2.5)', transformOrigin: '50% 100%' }, '-=0.5')
      .to(q('[data-ov="glow"]'), { opacity: 1, duration: 0.3 }, '<')
      .to(q('[data-ov="oven"]'), { x: 3, yoyo: true, repeat: 9, duration: 0.05, ease: 'none' }, '<')
      .to(oven, { clipPath: 'circle(0% at 62% 45%)', duration: 0.9, ease: 'power4.inOut', delay: 0.55, onStart: onDone });
  };

  oven.querySelectorAll('[data-oven-bake]').forEach(el => el.addEventListener('click', bake));
  oven.querySelector('[data-oven-skip]').addEventListener('click', () => {
    finish();
    oven.remove();
    onDone();
  });
}
