/* mobile hamburger nav + paper theme toggle — injected into .nav (shared by
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
function nextPaper() {
  const i = PAPERS.findIndex((p) => p.id === currentPaper());
  return PAPERS[(i + 1) % PAPERS.length];
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

  /* round swatch showing the color you would switch TO */
  const swatch = document.createElement('button');
  swatch.type = 'button';
  swatch.className = 'paper-toggle';
  swatch.setAttribute('aria-label', 'Hintergrundfarbe wechseln');
  swatch.title = 'Hintergrundfarbe wechseln';
  const paint = () => { swatch.style.background = nextPaper().color; };
  paint();
  swatch.addEventListener('click', () => {
    const next = nextPaper().id;
    try { localStorage.setItem(PAPER_KEY, next); } catch (e) { /* ignore */ }
    applyPaper(next);
    paint();
  });
  nav.appendChild(swatch);

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'nav-burger';
  btn.setAttribute('aria-label', 'Menu');
  btn.setAttribute('aria-expanded', 'false');
  btn.innerHTML = '<span></span><span></span><span></span>';
  btn.addEventListener('click', () => {
    const open = nav.classList.toggle('nav--open');
    btn.setAttribute('aria-expanded', String(open));
  });
  nav.appendChild(btn);

  /* tapping a link (or picking a language) closes the panel */
  links.addEventListener('click', (e) => {
    if (e.target.closest('a, [data-lang]')) {
      nav.classList.remove('nav--open');
      btn.setAttribute('aria-expanded', 'false');
    }
  });

  /* Escape closes the panel too */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('nav--open')) {
      nav.classList.remove('nav--open');
      btn.setAttribute('aria-expanded', 'false');
      btn.focus();
    }
  });
}

init();
