/* CMS content loader — pulls the JSON files that Sveltia CMS edits
   (public/content/*.json) and patches them into the static markup.
   The markup keeps sensible defaults, so a failed fetch changes nothing. */

/* photo gallery: update frames in place; add/remove frames if the count changed */
export async function applyPhotos(panelSel) {
  try {
    const res = await fetch('/content/photos.json');
    if (!res.ok) return;
    const { photos } = await res.json();
    if (!Array.isArray(photos) || !photos.length) return;
    const cols = document.querySelector(panelSel);
    if (!cols) return;
    let frames = [...cols.querySelectorAll('.foto-frame')];
    while (frames.length < photos.length) {
      const clone = frames[frames.length - 1].cloneNode(true);
      clone.removeAttribute('data-anim');
      frames[frames.length - 1].after(clone);
      frames = [...cols.querySelectorAll('.foto-frame')];
    }
    while (frames.length > photos.length) {
      frames.pop().remove();
    }
    photos.forEach((ph, i) => {
      const img = frames[i].querySelector('img');
      img.src = ph.src;
      img.alt = 'Photo № ' + ph.num;
      const meta = frames[i].querySelector('.foto-meta span');
      if (meta) meta.textContent = '№ ' + ph.num + ' · ' + ph.format;
    });
  } catch (e) { /* offline / missing content file — keep defaults */ }
}

/* pizza package prices: swap the numbers inside [data-price] slots */
export async function applyPizzaPrices() {
  try {
    const res = await fetch('/content/pizza.json');
    if (!res.ok) return;
    const data = await res.json();
    document.querySelectorAll('[data-price]').forEach((el) => {
      const v = data[el.getAttribute('data-price')];
      if (v) el.textContent = String(v).replace(/^CHF\s*/i, '');
    });
  } catch (e) { /* keep defaults */ }
}

/* film lab: next dev run date + free slots */
export async function applyFilmRun() {
  try {
    const res = await fetch('/content/film.json');
    if (!res.ok) return;
    const d = await res.json();
    const set = (k, v) => document.querySelectorAll('[data-film="' + k + '"]').forEach((el) => { el.textContent = v; });
    if (d.next_date_label) set('date', d.next_date_label);
    if (d.slots_free != null) set('free', d.slots_free);
    if (d.slots_total != null) set('total', d.slots_total);
    if (Number(d.slots_free) <= 0) {
      const badge = document.querySelector('.devrun-slots');
      if (badge) badge.classList.add('devrun-slots--full');
    }
  } catch (e) { /* keep defaults */ }
}

/* web portfolio: sync cards from JSON, then scale the live iframes to fit */
export async function applyPortfolio() {
  const grid = document.querySelector('.pf-grid');
  if (!grid) return;
  try {
    const res = await fetch('/content/portfolio.json');
    if (res.ok) {
      const { sites } = await res.json();
      if (Array.isArray(sites) && sites.length) {
        let cards = [...grid.querySelectorAll('.pf-card')];
        while (cards.length < sites.length) {
          const clone = cards[cards.length - 1].cloneNode(true);
          cards[cards.length - 1].after(clone);
          cards = [...grid.querySelectorAll('.pf-card')];
        }
        while (cards.length > sites.length) cards.pop().remove();
        sites.forEach((site, i) => {
          const card = cards[i];
          card.href = site.url;
          card.querySelector('.pf-url').textContent = site.url.replace(/^https?:\/\//, '');
          const fr = card.querySelector('iframe');
          if (fr.src !== site.url) fr.src = site.url;
          fr.title = site.name + ' — live preview';
          card.querySelector('.pf-meta strong').textContent = site.name;
          card.querySelector('.pf-tag').textContent = site.tag || '';
        });
      }
    }
  } catch (e) { /* keep the static defaults */ }

  const scale = () => {
    document.querySelectorAll('.pf-view').forEach((view) => {
      const fr = view.querySelector('iframe');
      const k = view.clientWidth / 1280;
      fr.style.transform = 'scale(' + k + ')';
      fr.style.height = Math.ceil(view.clientHeight / k) + 'px';
    });
  };
  scale();
  window.addEventListener('resize', scale, { passive: true });
}
