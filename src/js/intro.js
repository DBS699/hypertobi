/* Shared GSAP intro + scroll effects (port of gsap-intro.js).
   Markers:
     data-anim="letters|h1|sub|chips|pop|card"  — entrance animations
     data-scroll="hero"                          — hero parallax-fade on scroll
     data-parallax[="speed"]                     — scrub parallax drift (yPercent)
     data-anim-alt                               — children alternate slide-in L/R
     data-accent="#hex" (on root)                — scroll progress bar color */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const reducedMotion = () =>
  window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function runIntro(root) {
  if (!root || root.__hyperIntroRan) return;
  root.__hyperIntroRan = true;
  if (reducedMotion()) return;

  const q = gsap.utils.selector(root);
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  /* ---- entrance ---- */
  const letters = q('[data-anim="letters"] span');
  if (letters.length) tl.from(letters, { y: -34, opacity: 0, rotation: -10, duration: 0.55, stagger: 0.05, ease: 'back.out(1.7)' }, 0);

  const h1 = q('[data-anim="h1"]');
  if (h1.length) tl.from(h1, { y: 42, opacity: 0, duration: 0.65, ease: 'back.out(1.3)' }, letters.length ? '-=0.3' : 0);

  const sub = q('[data-anim="sub"]');
  if (sub.length) tl.from(sub, { y: 20, opacity: 0, duration: 0.5 }, '-=0.35');

  const chips = q('[data-anim="chips"] > *');
  if (chips.length) tl.from(chips, { y: 14, opacity: 0, duration: 0.4, stagger: 0.06 }, '-=0.25');

  const pop = q('[data-anim="pop"]');
  if (pop.length) tl.from(pop, { scale: 0.7, opacity: 0, duration: 0.5, ease: 'back.out(2)' }, '-=0.3');

  const cards = q('[data-anim="card"]');
  cards.forEach((el, i) => {
    gsap.from(el, {
      y: 46, opacity: 0, scale: 0.98, duration: 0.65, ease: 'power3.out',
      delay: 0.35 + (i % 4) * 0.08,
      scrollTrigger: { trigger: el, start: 'top 92%' }
    });
  });

  /* safety net: if the timeline never advances (hidden/background tab),
     un-hide everything so the page can't stay invisible */
  const all = [].concat(letters, h1, sub, chips, pop, cards);
  setTimeout(() => {
    if (tl.progress() === 0) {
      tl.kill();
      gsap.set(all, { clearProps: 'opacity,transform' });
    }
    cards.forEach((el) => {
      if (parseFloat(getComputedStyle(el).opacity) === 0 &&
          el.getBoundingClientRect().top < window.innerHeight) {
        gsap.set(el, { clearProps: 'opacity,transform' });
      }
    });
  }, 3000);

  /* ---- scroll effects ---- */
  initScrollEffects(root);
}

/* repeating letter wave (same feel as the logo entrance), rolling left→right
   across a heading every few seconds.
   The textured .tt words clip their texture via background-clip:text — that
   clip breaks on transformed child spans, so each letter gets its own copy of
   the word's background, offset to line up with its resting position. Splits
   lazily and re-splits when i18n swaps the text. */
export function initHeroWave(root, opts = {}) {
  if (reducedMotion()) return;
  const h1 = (root || document).querySelector(opts.selector || '[data-anim="h1"]');
  if (!h1) return;

  function split() {
    h1.querySelectorAll('.tt').forEach((word) => {
      if (word.__waveFor === word.textContent && word.querySelector('.wave-l')) return;
      const text = word.textContent;
      const cs = getComputedStyle(word);
      word.textContent = '';
      for (const ch of text) {
        const s = document.createElement('span');
        s.className = 'wave-l';
        s.textContent = ch;
        s.style.cssText =
          'display:inline-block;white-space:pre;color:transparent;' +
          '-webkit-text-fill-color:transparent;' +
          'background-image:' + cs.backgroundImage + ';' +
          'background-size:' + cs.backgroundSize + ';' +
          '-webkit-background-clip:text;background-clip:text';
        word.appendChild(s);
      }
      word.style.backgroundImage = 'none';
      word.__waveFor = word.textContent;
    });
    /* align each letter's texture slice with its resting position */
    h1.querySelectorAll('.tt').forEach((word) => {
      const base = word.getBoundingClientRect();
      word.querySelectorAll('.wave-l').forEach((s) => {
        const r = s.getBoundingClientRect();
        s.style.backgroundPosition = (base.left - r.left) + 'px ' + (base.top - r.top) + 'px';
      });
    });
  }

  function wave() {
    if (document.hidden) return;
    split();
    const letters = h1.querySelectorAll('.wave-l');
    if (!letters.length) return;
    gsap.timeline()
      .to(letters, { y: -12, rotation: -5, duration: 0.26, ease: 'power2.out', stagger: 0.03 })
      .to(letters, { y: 0, rotation: 0, duration: 0.45, ease: 'back.out(2.4)', stagger: 0.03 }, 0.24);
  }

  setInterval(wave, (opts.interval || 5) * 1000);
}

/* progress bar + hero parallax + drift + alternating slide-ins */
export function initScrollEffects(root) {
  if (reducedMotion()) return;
  const q = gsap.utils.selector(root);

  if (!document.body.__hyperBar) {
    document.body.__hyperBar = true;
    const accent = root.getAttribute('data-accent') || '#E8402A';
    const bar = document.createElement('div');
    bar.style.cssText = 'position:fixed;top:0;left:0;height:4px;width:100%;background:' + accent +
      ';transform-origin:0 50%;transform:scaleX(0);z-index:9999;pointer-events:none';
    document.body.appendChild(bar);
    gsap.to(bar, { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } });
  }

  /* fade/drift everything in the hero EXCEPT the 3D model slot (and its
     ancestor chain): a transform+opacity on a slot ancestor traps the model
     in a faded stacking context below the fixed paper overlay */
  const hero = q('[data-scroll="hero"]');
  if (hero.length) {
    const slot = hero[0].querySelector('.model-slot');
    let targets = [hero[0]];
    if (slot) {
      targets = [];
      let node = slot;
      while (node !== hero[0] && node.parentElement) {
        for (const sib of node.parentElement.children) {
          if (sib !== node) targets.push(sib);
        }
        node = node.parentElement;
      }
    }
    if (targets.length) gsap.to(targets, {
      yPercent: -14, opacity: 0.2, ease: 'none',
      scrollTrigger: { trigger: hero[0], start: 'top top', end: 'bottom top', scrub: true }
    });
  }

  q('[data-parallax]').forEach((el, i) => {
    let sp = parseFloat(el.getAttribute('data-parallax'));
    if (!Number.isFinite(sp)) sp = 6 + (i % 3) * 5;
    gsap.to(el, {
      yPercent: -sp, ease: 'none',
      scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true }
    });
  });

  q('[data-anim-alt]').forEach((wrap) => {
    Array.prototype.forEach.call(wrap.children, (child, i) => {
      gsap.from(child, {
        x: (i % 2 ? 70 : -70), opacity: 0, duration: 0.6, ease: 'power3.out',
        scrollTrigger: { trigger: child, start: 'top 90%' }
      });
    });
  });
}
