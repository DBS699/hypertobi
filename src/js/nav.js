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
