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
