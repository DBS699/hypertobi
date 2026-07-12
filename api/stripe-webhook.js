// Stripe webhook: on completed checkout, email the order to the owner.
// The webhook payload is treated as an untrusted hint — we re-fetch the
// session from Stripe with our secret key, so spoofed calls can't fake
// orders (this replaces signature verification, which needs the raw body).
const OWNER = process.env.CONTACT_TO || 'boschungservices@gmail.com';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const resendKey = process.env.RESEND_API_KEY;
  if (!stripeKey || !resendKey) return res.status(503).json({ error: 'not configured' });

  const event = req.body || {};
  if (event.type !== 'checkout.session.completed') {
    return res.status(200).json({ ok: true, ignored: true });
  }
  const id = event.data && event.data.object && event.data.object.id;
  if (!id || !/^cs_[a-zA-Z0-9_]+$/.test(id)) return res.status(400).end();

  /* authoritative re-fetch */
  const resp = await fetch('https://api.stripe.com/v1/checkout/sessions/' + id, {
    headers: { Authorization: 'Bearer ' + stripeKey },
  });
  const s = await resp.json().catch(() => ({}));
  if (!resp.ok || s.payment_status !== 'paid') {
    return res.status(200).json({ ok: true, skipped: true });
  }

  const ship = (s.collected_information && s.collected_information.shipping_details) || s.shipping_details || {};
  const a = ship.address || {};
  const cust = s.customer_details || {};
  const text =
    'Neue Print-Bestellung (bezahlt via Stripe)\n\n' +
    'Prints: ' + ((s.metadata && s.metadata.items) || '—') + '\n' +
    'Betrag: CHF ' + (s.amount_total / 100).toFixed(2) + '\n' +
    (s.livemode ? '' : '⚠️ TESTMODUS — kein echtes Geld\n') +
    '\nLieferadresse:\n' +
    (ship.name || cust.name || '—') + '\n' +
    [a.line1, a.line2].filter(Boolean).join(', ') + '\n' +
    [(a.postal_code || ''), (a.city || '')].join(' ').trim() + '\n' +
    '\nKunde: ' + (cust.email || '—') + '\n' +
    'Stripe-Session: ' + s.id;

  const mail = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + resendKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.RESEND_FROM || 'Hypertobi <onboarding@resend.dev>',
      to: [OWNER],
      reply_to: cust.email || undefined,
      subject: '🖼 Print-Bestellung bezahlt — CHF ' + (s.amount_total / 100).toFixed(2),
      text,
    }),
  });
  if (!mail.ok) console.error('resend error on order mail', mail.status);

  return res.status(200).json({ ok: true });
}
