/* 3D product reveal — click the round thumbnail → the GLB pops up in a
   circular badge, does one fast 360° "shooting star" spin (comet-tail glow),
   optionally fires a camera flash, then flies along a curved path into its
   resting slot and becomes a drag-to-orbit viewer.
   Uses <model-viewer> (GLB + Draco handled automatically), loaded lazily on
   first click so the three.js payload never blocks initial page load. */
import { gsap } from 'gsap';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { reducedMotion } from './intro.js';
import { t } from './i18n.js';

gsap.registerPlugin(MotionPathPlugin);

function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch (e) { return false; }
}

function makeViewer({ glb, poster, alt, clip, orbit, polar }) {
  const mv = document.createElement('model-viewer');
  mv.setAttribute('src', glb);
  mv.setAttribute('poster', poster);
  mv.setAttribute('alt', alt || '3D model');
  mv.setAttribute('camera-orbit', (orbit || 0) + 'deg ' + (polar || 76) + 'deg auto');
  mv.setAttribute('interaction-prompt', 'none');
  mv.setAttribute('disable-zoom', '');
  mv.setAttribute('disable-pan', '');
  mv.setAttribute('shadow-intensity', '1');
  mv.setAttribute('tone-mapping', 'neutral');  /* keep Meshy's saturation */
  mv.setAttribute('exposure', '1.05');
  if (clip) mv.setAttribute('animation-name', clip);  /* no autoplay: rest pose = assembled */
  return mv;
}

/* play the baked "reveal" clip once (parts assemble, flash pops, film unspools).
   The timeline may start on the 4 s safety timeout while the GLB is still
   decoding — in that case play as soon as it loads. */
function playClip(mv) {
  const go = () => { try { mv.play({ repetitions: 1 }); } catch (e) { /* no animations */ } };
  if (mv.loaded) go();
  else mv.addEventListener('load', go, { once: true });
}

/* pulse the flash-window materials' emissive — the model "fires" its flash */
function pulseFlashMaterial(mv) {
  const mats = (mv.model && mv.model.materials) || [];
  const glow = mats.filter((m) =>
    m.name === 'flash_window' || m.name === 'fresnel' || m.name === 'lens_inner');
  if (!glow.length) return;
  const k = { v: 0 };
  gsap.timeline()
    .to(k, { v: 1, duration: 0.07, ease: 'power1.in', onUpdate: apply })
    .to(k, { v: 0, duration: 0.45, ease: 'power2.out', onUpdate: apply });
  function apply() {
    glow.forEach((m) => m.setEmissiveFactor([k.v, k.v, k.v]));
  }
}

function settle(mv, spin) {
  /* settled state: drag-to-orbit + auto-rotate (opts.spin overrides the lazy
     default — e.g. the pizza keeps turning right away) */
  mv.setAttribute('camera-controls', '');
  mv.setAttribute('auto-rotate', '');
  mv.setAttribute('auto-rotate-delay', String(spin && spin.delay != null ? spin.delay : 4000));
  mv.setAttribute('rotation-per-second', (spin && spin.speed ? spin.speed : 12) + 'deg');
}

function placeInSlot(slot, mv) {
  slot.innerHTML = '';
  const live = document.createElement('div');
  live.className = 'model-live';
  live.appendChild(mv);
  slot.appendChild(live);
}

/* make the model look toward the cursor — eased, and re-aimed on scroll too
   (the model's position under the cursor changes while scrolling) */
function attachFollow(mv, opts) {
  const baseT = opts.orbit || 0;
  const baseP = opts.polar || 76;
  mv.removeAttribute('auto-rotate');            /* following replaces idling */
  mv.removeAttribute('camera-controls');        /* the cursor drives the view */
  const target = { t: baseT, p: baseP };
  const cur = { t: baseT, p: baseP };
  const mouse = { x: null, y: null };
  const aim = () => {
    if (mouse.x == null) return;
    const r = mv.getBoundingClientRect();
    if (!r.width) return;
    const dx = (mouse.x - (r.left + r.width / 2)) / (window.innerWidth / 2);
    const dy = (mouse.y - (r.top + r.height / 2)) / (window.innerHeight / 2);
    target.t = baseT - Math.max(-1.3, Math.min(1.3, dx)) * 40;
    target.p = baseP + Math.max(-1.3, Math.min(1.3, dy)) * 16;
  };
  window.addEventListener('pointermove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; aim(); }, { passive: true });
  window.addEventListener('scroll', aim, { passive: true });
  (function tick() {
    if (!mv.isConnected) return;                /* stop when torn down */
    cur.t += (target.t - cur.t) * 0.08;
    cur.p += (target.p - cur.p) * 0.08;
    if (Math.abs(cur.t - target.t) > 0.01 || Math.abs(cur.p - target.p) > 0.01) {
      mv.cameraOrbit = cur.t.toFixed(2) + 'deg ' +
        Math.max(35, Math.min(105, cur.p)).toFixed(2) + 'deg auto';
      mv.jumpCameraToGoal();
    }
    requestAnimationFrame(tick);
  })();
}

/* ambient mode: no click, no fly-in — the model is just THERE on page load,
   spinning (opts.spin) or watching the cursor (opts.follow).
   opts: { slot, glb, poster, alt, accent, orbit, polar, spin, follow } */
export function initModelAmbient(opts) {
  const slot = typeof opts.slot === 'string' ? document.querySelector(opts.slot) : opts.slot;
  if (!slot) return;
  slot.style.setProperty('--accent', opts.accent || '#201A17');
  if (!hasWebGL()) {
    slot.innerHTML = '<img src="' + opts.poster + '" alt="' + (opts.alt || '') +
      '" style="width:100%;height:100%;object-fit:contain;display:block">';
    return;
  }
  import('@google/model-viewer').then(() => {
    const mv = makeViewer(opts);
    if (opts.spin && !reducedMotion()) {
      /* pure turntable: no controls, so nothing can interrupt the turning */
      mv.setAttribute('auto-rotate', '');
      mv.setAttribute('auto-rotate-delay', String(opts.spin.delay != null ? opts.spin.delay : 0));
      mv.setAttribute('rotation-per-second', (opts.spin.speed || 20) + 'deg');
    } else {
      mv.setAttribute('camera-controls', '');
    }
    placeInSlot(slot, mv);
    if (opts.follow && !reducedMotion()) attachFollow(mv, opts);
  });
}

/* opts: { slot: element|selector, glb, poster, alt, accent, flash, orbit,
            spin: {delay, speed},
            auto: {delay, label} — fire the reveal on page load instead of on
            click; label (e.g. "Say cheese!") pops up just before it goes } */
export function initModelReveal(opts) {
  const slot = typeof opts.slot === 'string' ? document.querySelector(opts.slot) : opts.slot;
  if (!slot) return;
  const accent = opts.accent || '#201A17';
  slot.style.setProperty('--accent', accent);

  /* build the trigger thumb (static render + "View in 3D" chip) */
  const thumb = document.createElement('button');
  thumb.type = 'button';
  thumb.className = 'model-thumb';
  thumb.innerHTML =
    '<img src="' + opts.poster + '" alt="' + (opts.alt || '') + '">' +
    (opts.auto ? '' : '<span class="m3d-chip" data-i18n="view3d">' + t('view3d') + '</span>');
  slot.appendChild(thumb);

  if (!hasWebGL()) {
    /* fallback: keep the static render, drop the 3D affordance */
    thumb.querySelector('.m3d-chip').remove();
    thumb.disabled = true;
    thumb.style.cursor = 'default';
    return;
  }

  let launched = false;
  thumb.addEventListener('click', async () => {
    if (launched) return;
    launched = true;

    await import('@google/model-viewer');
    const mv = makeViewer(opts);

    if (reducedMotion()) {
      /* no clip: with animation-name set, the viewer would pause on the
         exploded first frame — the node rest pose is the assembled model */
      mv.removeAttribute('animation-name');
      settle(mv, opts.spin);
      placeInSlot(slot, mv);
      return;
    }

    const fly = document.createElement('div');
    fly.className = 'model-fly';
    let size = 0, popScale = 1, startLeft = 0, startTop = 0;
    const measure = () => {
      /* measured at animation start (not click time) so a mid-layout click
         can't bake in degenerate 0-width values */
      size = slot.getBoundingClientRect().width || 280;
      const vw = window.innerWidth || document.documentElement.clientWidth || 1280;
      const vh = window.innerHeight || document.documentElement.clientHeight || 800;
      popScale = Math.min(420, vw * 0.62) / size;
      startLeft = vw / 2 - size / 2;
      startTop = vh / 2 - size / 2;
      fly.style.width = size + 'px';
      fly.style.height = size + 'px';
      fly.style.left = startLeft + 'px';
      fly.style.top = startTop + 'px';
    };
    measure();

    const comet = document.createElement('div');
    comet.className = 'comet';
    comet.style.setProperty('--glow', accent);

    const badge = document.createElement('div');
    badge.className = 'model-badge';
    badge.appendChild(mv);

    const bloom = document.createElement('div');
    bloom.className = 'flash-bloom';
    badge.appendChild(bloom);

    fly.appendChild(comet);
    fly.appendChild(badge);
    document.body.appendChild(fly);
    gsap.set(fly, { scale: 0, transformOrigin: '50% 50%' });
    thumb.style.visibility = 'hidden';

    const start = () => {
      measure();
      /* spin a full turn, ending on the configured resting angle */
      const rest = opts.orbit || 0;
      const pol = opts.polar || 76;
      const orbit = { theta: rest };
      const tl = gsap.timeline();

      /* 1 — coin pop; the baked reveal clip starts with it, so the parts
         assemble while the badge pops and spins */
      tl.call(() => playClip(mv), null, 0);
      tl.to(fly, { scale: popScale, duration: 0.45, ease: 'back.out(1.7)' });

      /* 2 — shooting-star spin: one full turn, landing squarely on the
         resting angle so the model faces the viewer when it's done */
      orbit.theta = rest + 360;
      tl.add('spin');
      tl.to(orbit, {
        theta: rest, duration: 1.0, ease: 'power3.out',
        onUpdate: () => {
          mv.cameraOrbit = orbit.theta.toFixed(2) + 'deg ' + pol + 'deg auto';
          mv.jumpCameraToGoal();
        }
      }, 'spin');
      tl.fromTo(comet, { rotation: -80, opacity: 0 },
        { rotation: 280, opacity: 0.9, duration: 0.75, ease: 'power3.out' }, 'spin');
      tl.to(comet, { opacity: 0, duration: 0.3 }, 'spin+=0.7');

      /* 3 — camera flash (Photos page): fires AFTER the spin has settled, so
         the camera looks straight at the visitor when it takes the picture */
      if (opts.flash) {
        tl.add('flash', 'spin+=1.08');
        tl.call(() => pulseFlashMaterial(mv), null, 'flash');
        tl.to(bloom, { opacity: 1, duration: 0.07, ease: 'power1.in' }, 'flash');
        tl.to(bloom, { opacity: 0, duration: 0.38, ease: 'power2.out' }, 'flash+=0.09');
      }

      /* 4 — fly along a curved path to the resting slot */
      const target = slot.getBoundingClientRect();
      const dx = target.left - startLeft;
      const dy = target.top - startTop;
      tl.add('fly', opts.flash ? 'flash+=0.5' : 'spin+=0.85');
      tl.to(fly, {
        motionPath: {
          path: [{ x: 0, y: 0 }, { x: dx * 0.45, y: dy * 0.5 - 130 }, { x: dx, y: dy }],
          curviness: 1.4
        },
        scale: 1,
        duration: 0.9,
        ease: 'power2.inOut',
        onComplete: () => {
          /* 5 — settle as embedded interactive viewer */
          settle(mv, opts.spin);
          placeInSlot(slot, mv);
          fly.remove();
          if (opts.follow) attachFollow(mv, opts);
        }
      }, 'fly');
    };

    /* wait for the model (poster shows meanwhile); don't hang if it stalls */
    let started = false;
    const go = () => { if (!started) { started = true; start(); } };
    mv.addEventListener('load', go, { once: true });
    setTimeout(go, 4000);
  });

  /* auto mode: fire the reveal on page load — a label ("Say cheese!") pops
     over the poster right before it goes. A user click still works earlier. */
  if (opts.auto && !reducedMotion()) {
    const delay = opts.auto.delay != null ? opts.auto.delay : 1800;
    setTimeout(() => {
      if (launchedOnce()) return;
      if (opts.auto.label) {
        const bubble = document.createElement('div');
        bubble.className = 'say-cheese';
        bubble.textContent = opts.auto.label;
        slot.appendChild(bubble);
        setTimeout(() => bubble.remove(), 2600);
        setTimeout(() => thumb.click(), 900);
      } else {
        thumb.click();
      }
    }, delay);
  }
  function launchedOnce() { return thumb.style.visibility === 'hidden' || !thumb.isConnected; }
}
