// Form submissions -> email via Resend (https://resend.com).
// Requires env var RESEND_API_KEY (set in the Vercel project).
// Optional env var RESEND_FROM (e.g. "Hypertobi <hallo@hypertobi.ch>") —
// needs a verified domain in Resend and unlocks the confirmation copy
// to the customer; without it we fall back to the Resend sandbox sender,
// which may only deliver to the account owner's own inbox.
/* Resend sandbox (no verified domain) only delivers to the Resend account
   owner's address — CONTACT_TO overrides the recipient for that phase */
const OWNER = process.env.CONTACT_TO || 'boschungservices@gmail.com';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'method not allowed' });
  }

  const { subject, message, name, email, website } = req.body || {};

  /* honeypot: real visitors never fill this field */
  if (website) return res.status(200).json({ ok: true, copy: false });

  if (!subject || !message || !name || !email) {
    return res.status(400).json({ error: 'missing fields' });
  }
  if (String(message).length > 5000 || String(subject).length > 200) {
    return res.status(400).json({ error: 'too long' });
  }

  const key = process.env.RESEND_API_KEY;
  if (!key) return res.status(503).json({ error: 'not configured' });

  const from = process.env.RESEND_FROM || 'Hypertobi <onboarding@resend.dev>';
  const send = (payload) =>
    fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

  /* 1) the inquiry itself, reply-to the customer */
  const inquiry = await send({
    from,
    to: [OWNER],
    reply_to: String(email),
    subject: String(subject),
    text: String(message),
  });
  if (!inquiry.ok) {
    const detail = await inquiry.text().catch(() => '');
    console.error('resend error', inquiry.status, detail);
    return res.status(502).json({ error: 'send failed', detail: detail.slice(0, 300) });
  }

  /* 2) confirmation copy to the customer — only with a verified sender */
  let copy = false;
  if (process.env.RESEND_FROM) {
    const confirmation = await send({
      from,
      to: [String(email)],
      subject: 'Kopie deiner Anfrage — ' + String(subject),
      text:
        'Hallo ' + String(name) + '\n\n' +
        'Danke für deine Anfrage — hier deine Kopie. Ich melde mich so schnell wie möglich!\n\n' +
        '---\n' + String(message) + '\n---\n\n' +
        'Liebe Grüsse\nTobi · hypertobi.ch',
    });
    copy = confirmation.ok;
  }

  return res.status(200).json({ ok: true, copy });
}
