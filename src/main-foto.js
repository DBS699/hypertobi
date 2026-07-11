import './styles/main.css';
import './js/nav.js';
import { initI18n } from './js/i18n.js';
import { runIntro } from './js/intro.js';
import { wireCompose, wireDirectSend, wireMailHint, val } from './js/compose.js';
import { t } from './js/i18n.js';
import { initModelAmbient } from './js/model-reveal.js';
import { applyPhotos } from './js/content.js';

initI18n();
runIntro(document.querySelector('.page'));

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

/* ---- Apple-Photos-style print selection: tap to select, cart with size
   per photo, live to-scale preview in the sample living room ---- */
const SIZES = ['A4', 'A3', 'A2'];
const PRICES = { A4: 39, A3: 59, A2: 89 };   /* CHF, incl. CH shipping */
const SIZE_CM = { A4: [21, 29.7], A3: [29.7, 42], A2: [42, 59.4] };  /* short × long edge */
/* the sofa is ~1.8 m wide and spans 56% of the room → 1% of room ≈ 3.2 cm */
const CM_PER_PERCENT = 3.2;
const cart = new Map();      /* '01' -> 'A4' */
let activeNum = null;

const frames = () => [...document.querySelectorAll('.foto-frame')];
const numOf = (frame) => {
  const m = (frame.querySelector('.foto-meta span')?.textContent || '').match(/№\s*(\S+)/);
  return m ? m[1] : null;
};
const frameByNum = (num) => frames().find((f) => numOf(f) === num);

function ensureChecks() {
  frames().forEach((f) => {
    if (!f.querySelector('.sel-check')) {
      const c = document.createElement('span');
      c.className = 'sel-check';
      c.textContent = '✓';
      f.appendChild(c);
    }
  });
}

function syncGallery() {
  ensureChecks();
  frames().forEach((f) => {
    const n = numOf(f);
    f.classList.toggle('selected', cart.has(n));
    const chip = f.querySelector('.order-chip');
    if (chip) {
      chip.textContent = cart.has(n) ? t('ft_selected') : t('ft_order');
      chip.setAttribute('aria-pressed', String(cart.has(n)));
    }
  });
}

function renderCart() {
  const list = document.getElementById('cart-list');
  list.innerHTML = '';
  if (!cart.size) {
    const p = document.createElement('p');
    p.className = 'cart-empty';
    p.textContent = t('ft_cart_empty');
    list.appendChild(p);
  }
  cart.forEach((size, num) => {
    const row = document.createElement('div');
    row.className = 'cart-row' + (num === activeNum ? ' active' : '');
    row.setAttribute('role', 'button');
    row.tabIndex = 0;
    row.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activeNum = num; renderCart(); updatePreview(); }
    });
    const img = document.createElement('img');
    img.src = frameByNum(num)?.querySelector('img')?.src || '';
    img.alt = '№ ' + num;
    const cn = document.createElement('span');
    cn.className = 'cn';
    cn.textContent = '№ ' + num;
    const sizes = document.createElement('div');
    sizes.className = 'cart-sizes';
    SIZES.forEach((s) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'size-btn' + (s === size ? ' on' : '');
      b.textContent = s;
      b.addEventListener('click', (e) => {
        e.stopPropagation();
        cart.set(num, s);
        activeNum = num;
        refresh();
      });
      sizes.appendChild(b);
    });
    const price = document.createElement('span');
    price.className = 'cprice';
    price.textContent = 'CHF ' + PRICES[size];
    const x = document.createElement('button');
    x.type = 'button';
    x.className = 'cart-x';
    x.textContent = '×';
    x.setAttribute('aria-label', 'remove № ' + num);
    x.addEventListener('click', (e) => {
      e.stopPropagation();
      cart.delete(num);
      if (activeNum === num) activeNum = [...cart.keys()].pop() || null;
      refresh();
    });
    row.addEventListener('click', () => { activeNum = num; renderCart(); updatePreview(); });
    row.append(img, cn, sizes, price, x);
    list.appendChild(row);
  });
  const bar = document.getElementById('cart-bar');
  bar.hidden = !cart.size;
  document.getElementById('cart-count').textContent = cart.size;
  const totalEl = document.getElementById('cart-total');
  totalEl.hidden = !cart.size;
  document.getElementById('cart-total-num').textContent =
    [...cart.values()].reduce((sum, s) => sum + PRICES[s], 0);
}

/* hang the active print above the sofa, scaled true to size */
function updatePreview() {
  const holder = document.getElementById('rp-frame');
  const tag = document.getElementById('rp-size');
  if (!activeNum || !cart.has(activeNum)) { holder.hidden = true; tag.hidden = true; return; }
  const size = cart.get(activeNum);
  const src = frameByNum(activeNum)?.querySelector('img')?.src || '';
  const probe = new Image();
  probe.onload = () => {
    const landscape = probe.naturalWidth >= probe.naturalHeight;
    const [shortCm, longCm] = SIZE_CM[size];
    const wCm = landscape ? longCm : shortCm;
    document.getElementById('rp-img').src = src;
    holder.style.width = (wCm / CM_PER_PERCENT) + '%';
    holder.hidden = false;
    tag.textContent = size;
    tag.hidden = false;
  };
  probe.src = src;
}

function refresh() {
  syncGallery(); renderCart(); updatePreview();
  const box = document.getElementById('pr-box');
  if (box) box.hidden = true;
}

/* tap a photo (or its chip) to toggle selection — delegated so it survives
   the CMS rewriting the gallery */
document.querySelector('.gallery-cols').addEventListener('click', (e) => {
  const frame = e.target.closest('.foto-frame');
  if (!frame) return;
  const num = numOf(frame);
  if (!num) return;
  if (cart.has(num)) {
    cart.delete(num);
    if (activeNum === num) activeNum = [...cart.keys()].pop() || null;
  } else {
    cart.set(num, 'A4');
    activeNum = num;
  }
  refresh();
});

/* print order -> email to boschungservices@gmail.com */
wireCompose({
  trigger: document.getElementById('pr-send'),
  box: document.getElementById('pr-box'),
  msgEl: document.getElementById('pr-msg'),
  copyBtn: document.getElementById('pr-copy'),
  noteEl: document.getElementById('pr-note'),
  requiredIds: ['pr-name', 'pr-email'],
  watch: document.getElementById('prints'),
  build: () => {
    if (!cart.size) return t('ft_cart_empty');
    const total = [...cart.values()].reduce((sum, s) => sum + PRICES[s], 0);
    return 'Hi Tobi! Ich möchte Prints bestellen.\n' +
      [...cart.entries()].map(([n, s]) => '– Foto № ' + n + ' — ' + s + ' (CHF ' + PRICES[s] + ')').join('\n') +
      '\nTotal: CHF ' + total + ' inkl. Versand' +
      '\nName: ' + val('pr-name') +
      '\nE-Mail: ' + val('pr-email');
  }
});

/* fill the mailto link whenever the message box is (re)built */
document.getElementById('pr-send').addEventListener('click', () => {
  const msg = document.getElementById('pr-msg').textContent;
  const mail = document.getElementById('pr-mail');
  mail.href = 'mailto:boschungservices@gmail.com'
    + '?subject=' + encodeURIComponent('Print-Bestellung — ' + (document.getElementById('pr-name').value || ''))
    + '&body=' + encodeURIComponent(msg);
});
wireMailHint(document.getElementById('pr-mail'), document.getElementById('pr-note'));

/* CMS-managed gallery photos, then paint the initial cart/selection state */
applyPhotos('.gallery-cols').then(() => refresh());
refresh();
window.addEventListener('hyper:i18n', refresh);

wireDirectSend({
  button: document.getElementById('pr-direct'),
  noteEl: document.getElementById('pr-note'),
  getPayload: () => ({
    subject: 'Print-Bestellung — ' + val('pr-name'),
    message: document.getElementById('pr-msg').textContent,
    name: document.getElementById('pr-name').value,
    email: document.getElementById('pr-email').value,
    website: ''
  })
});
