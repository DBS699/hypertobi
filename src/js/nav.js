/* mobile hamburger + full-screen menu + paper theme toggle — injected into .nav (shared by
   every page). Import for side effect. */

/* paper theme: lime (default) -> soft sky -> cool silver -> lime …, persisted */
const PAPER_KEY = 'hypertobi_paper';
const PAPERS = [
  { id: 'lime', color: '#E3F0C4' },
  { id: 'sky', color: '#DCE8F2' },
  { id: 'silver', color: '#E4E6E9' }
];

function currentPaper() {
  try {
    const v = localStorage.getItem(PAPER_KEY);
    return PAPERS.some((p) => p.id === v) ? v : 'lime';
  } catch (e) { return 'lime'; }
}
function applyPaper(mode) {
  if (mode === 'lime') document.documentElement.removeAttribute('data-paper');
  else document.documentElement.setAttribute('data-paper', mode);
}
applyPaper(currentPaper());

function init() {
  const nav = document.querySelector('.nav');
  if (!nav || nav.querySelector('.nav-burger')) return;
  const links = nav.querySelector('.nav-links');
  if (!links) return;

  /* three visible swatches — the active one is marked, one click picks
     directly (a single cycling dot read as "current color" and confused) */
  const picker = document.createElement('div');
  picker.className = 'paper-picker';
  picker.setAttribute('role', 'group');
  picker.setAttribute('aria-label', 'Hintergrundfarbe');
  const paint = () => {
    [...picker.children].forEach((b, i) => {
      const on = PAPERS[i].id === currentPaper();
      b.classList.toggle('on', on);
      b.setAttribute('aria-pressed', String(on));
    });
  };
  PAPERS.forEach((p) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'paper-dot';
    b.style.background = p.color;
    b.setAttribute('data-i18n-title', 'paper_' + p.id);
    b.setAttribute('aria-label', 'Hintergrund: ' + p.id);
    b.addEventListener('click', () => {
      try { localStorage.setItem(PAPER_KEY, p.id); } catch (e) { /* ignore */ }
      applyPaper(p.id);
      paint();
    });
    picker.appendChild(b);
  });
  paint();
  nav.appendChild(picker);

  /* full-screen menu (mobile redesign): four counters in big crumple type,
     language switch, contacts + legal links. Built here so every page gets
     it; its .lang-toggle is wired by initI18n(), which runs after this. */
  const here = location.pathname.replace(/\.html$/, '').replace(/\/$/, '');
  const menu = document.createElement('div');
  menu.className = 'm-menu';
  menu.id = 'm-menu';
  menu.hidden = true;
  menu.setAttribute('role', 'dialog');
  menu.setAttribute('aria-modal', 'true');
  menu.setAttribute('aria-label', 'Menu');
  const items = [...links.querySelectorAll('.nav-link')].map((a) => {
    const c = a.getAttribute('data-c');
    const label = a.querySelector('[data-i18n]');
    const cur = a.getAttribute('href').replace(/\.html$/, '') === here ? ' aria-current="page"' : '';
    return '<a class="m-menu-link tt tt--lg tt--' + c + '" href="' + a.getAttribute('href') + '"' + cur + '>' +
      '<span data-i18n="' + label.getAttribute('data-i18n') + '">' + label.textContent + '</span></a>';
  }).join('');
  menu.innerHTML =
    '<div class="m-menu-head"><span class="m-menu-label">MENU</span>' +
    '<button type="button" class="m-menu-close" aria-label="Close">×</button></div>' +
    '<nav class="m-menu-links">' + items + '</nav>' +
    '<div class="lang-toggle m-menu-lang">' +
    ['de', 'en', 'fr', 'it'].map((l) => '<button type="button" data-lang="' + l + '">' + l.toUpperCase() + '</button>').join('') +
    '</div>' +
    '<div class="m-menu-foot">' +
    '<div class="m-menu-contacts">' +
    '<a class="pill" data-i18n="footer_wa" style="--sh:#1DA851" href="https://wa.me/41786108056?text=Hallo%20Tobi!" target="_blank" rel="noopener">WhatsApp → schreib mir</a>' +
    '<a class="pill" href="https://instagram.com/hypertobi" target="_blank" rel="noopener">@hypertobi</a></div>' +
    '<div class="m-menu-legal"><a href="/impressum.html" data-i18n="footer_imprint">Impressum</a> · ' +
    '<a href="/datenschutz.html" data-i18n="footer_privacy">Datenschutz</a></div>' +
    '</div>';
  document.body.appendChild(menu);

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'nav-burger';
  btn.setAttribute('aria-label', 'Menu');
  btn.setAttribute('aria-expanded', 'false');
  btn.setAttribute('aria-controls', 'm-menu');
  btn.innerHTML = '<span></span><span></span><span></span>';
  nav.appendChild(btn);

  const setOpen = (open) => {
    menu.hidden = !open;
    nav.classList.toggle('nav--open', open);
    btn.setAttribute('aria-expanded', String(open));
    document.documentElement.classList.toggle('m-menu-open', open);
    if (open) menu.querySelector('.m-menu-close').focus();
  };
  btn.addEventListener('click', () => setOpen(menu.hidden));
  menu.querySelector('.m-menu-close').addEventListener('click', () => { setOpen(false); btn.focus(); });
  /* following a link closes it (same-page anchors would otherwise stay covered) */
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });

  /* Escape closes it too */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !menu.hidden) {
      setOpen(false);
      btn.focus();
    }
  });
  /* rotating to a wide screen while open must not leave the page locked */
  window.matchMedia('(max-width: 760px)').addEventListener('change', (e) => { if (!e.matches) setOpen(false); });
}

init();
