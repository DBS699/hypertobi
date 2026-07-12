// Checkout -> Stripe Checkout Session (hosted payment page).
// Requires env var STRIPE_SECRET_KEY. Prices are authoritative HERE —
// the client only sends sizes/counts, never amounts.
// Two flows: photo prints (shipped) and film development (drop-off).
const PRICES = { A4: 3900, A3: 5900, A2: 8900 };   /* rappen, incl. CH shipping */
const FILM_PRICE = 2000;                           /* rappen per roll incl. dev + scans */

const clean = (v, max) => String(v == null ? '' : v).replace(/[\r\n]/g, ' ').slice(0, max);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'method not allowed' });
  }
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return res.status(503).json({ error: 'not configured' });

  const body = req.body || {};
  const { lang } = body;
  const origin = 'https://' + (req.headers.host || 'hypertobi.ch');
  const params = new URLSearchParams();
  params.append('mode', 'payment');
  params.append('locale', ['de', 'en', 'fr', 'it'].includes(lang) ? lang : 'de');

  if (body.type === 'film') {
    /* film development: N rolls, sign-up details ride along in metadata */
    const count = parseInt(body.count, 10);
    if (!Number.isInteger(count) || count < 1 || count > 50) {
      return res.status(400).json({ error: 'bad count' });
    }
    const d = body.details || {};
    params.append('success_url', origin + '/danke.html?kind=film&session_id={CHECKOUT_SESSION_ID}');
    params.append('cancel_url', origin + '/film.html#devrun');
    if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(d.email || ''))) {
      params.append('customer_email', String(d.email));
    }
    params.append('line_items[0][quantity]', String(count));
    params.append('line_items[0][price_data][currency]', 'chf');
    params.append('line_items[0][price_data][unit_amount]', String(FILM_PRICE));
    params.append('line_items[0][price_data][product_data][name]', 'Filmentwicklung inkl. Scans (pro Film)');
    params.append('metadata[items]',
      ('Filmentwicklung × ' + count +
       ' — Typ: ' + clean(d.filmtype, 40) +
       ', Format: ' + clean(d.format, 40) +
       ', Push/Pull: ' + clean(d.push, 40) +
       ' | Name: ' + clean(d.name, 60) +
       ' | Bemerkungen: ' + clean(d.notes, 200)).slice(0, 490));
  } else {
    /* photo prints (default) */
    const items = body.items;
    if (!Array.isArray(items) || !items.length || items.length > 20) {
      return res.status(400).json({ error: 'bad items' });
    }
    params.append('success_url', origin + '/danke.html?session_id={CHECKOUT_SESSION_ID}');
    params.append('cancel_url', origin + '/foto.html#prints');
    params.append('shipping_address_collection[allowed_countries][0]', 'CH');
    const summary = [];
    for (let i = 0; i < items.length; i++) {
      const size = String(items[i].size);
      const num = String(items[i].num).replace(/[^\w-]/g, '').slice(0, 10);
      if (!PRICES[size] || !num) return res.status(400).json({ error: 'bad item' });
      params.append(`line_items[${i}][quantity]`, '1');
      params.append(`line_items[${i}][price_data][currency]`, 'chf');
      params.append(`line_items[${i}][price_data][unit_amount]`, String(PRICES[size]));
      params.append(`line_items[${i}][price_data][product_data][name]`, `Foto-Print № ${num} — ${size}`);
      summary.push(`№ ${num} — ${size}`);
    }
    params.append('metadata[items]', summary.join(', ').slice(0, 490));
  }

  const resp = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + key,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok || !data.url) {
    console.error('stripe checkout error', resp.status, data && data.error && data.error.message);
    return res.status(502).json({ error: 'stripe failed' });
  }
  return res.status(200).json({ url: data.url });
}
