/* HyperShatter — scroll-scrubbed particle dissolve for [data-shatter] elements.
   Port of hyper-shatter.js: samples the element's real pixels via html2canvas
   into particles drawn on one shared fixed canvas; scrubbed by ScrollTrigger
   so scrolling back reassembles seamlessly. */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import html2canvas from 'html2canvas';

gsap.registerPlugin(ScrollTrigger);

const COLS = 26, MAX_PARTS = 900;
let items = [], canvas = null, ctx = null, dpr = 1, running = false;

function seeded(i) { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }

function ensureCanvas() {
  if (canvas) return;
  canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;z-index:300;pointer-events:none';
  document.body.appendChild(canvas);
  ctx = canvas.getContext('2d');
  const fit = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(window.innerWidth * dpr);
    canvas.height = Math.round(window.innerHeight * dpr);
  };
  fit();
  window.addEventListener('resize', fit);
}

function sample(el) {
  const rect = el.getBoundingClientRect();
  if (rect.width < 60 || rect.height < 60) return Promise.resolve(null);
  const scale = COLS / rect.width;
  return html2canvas(el, { backgroundColor: null, scale, logging: false }).then((cv) => {
    const w = cv.width, h = cv.height;
    if (!w || !h) return null;
    let step = 1;
    while ((w / step) * (h / step) > MAX_PARTS) step++;
    const data = cv.getContext('2d').getImageData(0, 0, w, h).data;
    const parts = [];
    for (let y = 0; y < h; y += step) {
      for (let x = 0; x < w; x += step) {
        const o = (y * w + x) * 4;
        if (data[o + 3] < 40) continue;
        const i = parts.length;
        parts.push({
          fx: (x + step / 2) / w, fy: (y + step / 2) / h,
          r: data[o], g: data[o + 1], b: data[o + 2],
          dx: (seeded(i * 3 + 1) - 0.5) * 2,
          dy: (seeded(i * 3 + 2) - 0.5) * 2 - 0.5,
          dz: seeded(i * 3 + 3) * 1.6 - 0.4,       /* -0.4..1.2 → toward/away from viewer */
          spin: (seeded(i * 7 + 5) - 0.5)
        });
      }
    }
    return parts.length ? { parts, cols: Math.ceil(w / step) } : null;
  }).catch(() => null);
}

function draw() {
  let any = false;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let n = 0; n < items.length; n++) {
    const it = items[n];
    const p = it.p;
    if (p <= 0.001 || !it.data) continue;
    any = true;
    const rect = it.el.getBoundingClientRect();
    const cell = rect.width / it.data.cols;
    const parts = it.data.parts;
    const spreadX = Math.min(rect.width * 0.55, 360);
    const spreadY = Math.min(rect.height * 0.9, 300);
    for (let i = 0; i < parts.length; i++) {
      const pt = parts[i];
      let depth = 1 + pt.dz * p;                    /* 3D: grow toward viewer, shrink away */
      if (depth < 0.15) depth = 0.15;
      const px = rect.left + pt.fx * rect.width + pt.dx * spreadX * p;
      const py = rect.top + pt.fy * rect.height + pt.dy * spreadY * p - 90 * p * p;
      const s = cell * depth * (1 - 0.15 * p);
      const a = 1 - p * 0.92;
      if (a <= 0.02 || s < 0.4) continue;
      ctx.globalAlpha = a;
      ctx.fillStyle = 'rgb(' + pt.r + ',' + pt.g + ',' + pt.b + ')';
      const half = s / 2;
      if (p > 0.04 && Math.abs(pt.spin) > 0.15) {
        ctx.setTransform(dpr, 0, 0, dpr, px * dpr, py * dpr);
        ctx.rotate(pt.spin * p * 4);
        ctx.fillRect(-half, -half, s, s);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      } else {
        ctx.fillRect(px - half, py - half, s, s);
      }
    }
  }
  ctx.globalAlpha = 1;
  if (!any && running) { running = false; gsap.ticker.remove(draw); }
}

function wake() {
  if (!running) { running = true; gsap.ticker.add(draw); }
}

function attach(el) {
  el.__shattered = true;
  const it = { el, p: 0, data: null, sampling: false };
  items.push(it);
  gsap.to(it, {
    p: 1, ease: 'none',
    scrollTrigger: {
      trigger: el, start: 'top 22%', end: 'top -60%', scrub: 0.4,
      onUpdate: () => {
        if (!it.data && !it.sampling) {           /* lazy sample on first movement */
          it.sampling = true;
          sample(el).then((d) => { it.data = d; });
        }
        const fade = Math.max(0, 1 - it.p * 2.4);
        if (it.p > 0.001) {
          el.style.opacity = String(fade);
          wake();
        } else {
          el.style.removeProperty('opacity');
        }
      }
    }
  });
  /* pre-sample when idle so the first scroll is instant */
  setTimeout(() => {
    if (!it.data && !it.sampling) { it.sampling = true; sample(el).then((d) => { it.data = d; }); }
  }, 1800 + items.length * 350);
}

function scan() {
  const els = document.querySelectorAll('[data-shatter]');
  let found = 0;
  for (let i = 0; i < els.length; i++) {
    if (!els[i].__shattered) { attach(els[i]); found++; }
  }
  return found;
}

export function initShatter() {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (scan() > 0) {
    ensureCanvas();
    /* catch late-mounted elements a few more times */
    setTimeout(scan, 2500);
    setTimeout(() => { scan(); ScrollTrigger.refresh(); }, 5000);
  }
}
