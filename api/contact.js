import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const TO_EMAIL = process.env.SESSION_TO_EMAIL || 'elevndjs@gmail.com';
const FROM_EMAIL = process.env.SESSION_FROM_EMAIL || 'ELEVN Sessions <onboarding@resend.dev>';

export const config = {
  maxDuration: 30,
  api: {
    bodyParser: { sizeLimit: '1mb' }
  }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!process.env.RESEND_API_KEY) {
    return res.status(500).json({ error: 'RESEND_API_KEY not configured' });
  }

  const body = req.body || {};
  if (body._honey) return res.status(200).json({ success: true });

  const name = (body.name || '').toString().slice(0, 200);
  const email = (body.email || '').toString().slice(0, 200);
  const eventType = (body.event_type || '').toString().slice(0, 200);
  const date = (body.date || '').toString().slice(0, 200);
  const message = (body.message || '').toString().slice(0, 5000);
  const consent = (body.consent || '').toString().slice(0, 200);

  if (!email || !message) {
    return res.status(400).json({ error: 'Missing email or message' });
  }

  const subject = `ELEVN contact, ${name || 'New lead'}${eventType ? ' / ' + eventType : ''}`;

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: TO_EMAIL,
      replyTo: email,
      subject,
      html: buildHtml({ name, email, eventType, date, message, consent }),
      text: buildText({ name, email, eventType, date, message, consent })
    });
    if (error) throw new Error(error.message || 'Resend error');
    return res.status(200).json({ success: true });
  } catch (e) {
    console.error('contact error', e);
    return res.status(500).json({ error: e.message || 'Send failed' });
  }
}

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function row(label, value) {
  if (value == null || value === '') return '';
  return `<tr><td style="padding:6px 12px 6px 0;color:#888;font-size:12px;letter-spacing:0.06em;text-transform:uppercase;vertical-align:top;white-space:nowrap;">${esc(label)}</td><td style="padding:6px 0;color:#111;font-size:14px;line-height:1.5;">${esc(value)}</td></tr>`;
}

function buildHtml(b) {
  return `<!doctype html><html><body style="margin:0;background:#fafafa;font-family:'Helvetica Neue',Arial,sans-serif;color:#111;">
    <div style="max-width:680px;margin:0 auto;background:#fff;">
      <div style="background:#0a0a0a;color:#f0ede8;padding:28px 32px;">
        <div style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;letter-spacing:0.2em;color:#888;text-transform:uppercase;">ELEVN // CONTACT FORM</div>
        <div style="font-family:Georgia,serif;font-size:30px;font-weight:800;line-height:1.05;margin-top:8px;letter-spacing:-0.01em;">${esc(b.name || 'New lead')}</div>
        <div style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:13px;color:#aaa;margin-top:10px;">${esc(b.eventType || '')}${b.date ? ' &middot; ' + esc(b.date) : ''}</div>
      </div>
      <div style="padding:24px 32px;">
        <table style="border-collapse:collapse;width:100%;">
          ${row('Name', b.name)}
          ${row('Email', b.email)}
          ${row('Event type', b.eventType)}
          ${row('Date', b.date)}
        </table>
        <h2 style="margin:28px 0 10px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:13px;letter-spacing:0.16em;text-transform:uppercase;color:#C46A35;border-top:1px solid #eee;padding-top:18px;">Message</h2>
        <p style="white-space:pre-wrap;color:#111;font-size:14px;line-height:1.6;margin:0;">${esc(b.message)}</p>
        ${b.consent ? `<p style="margin-top:24px;color:#888;font-size:11px;letter-spacing:0.04em;">${esc(b.consent)}</p>` : ''}
      </div>
      <div style="padding:18px 32px;background:#0a0a0a;color:#666;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;">elevndjs.com</div>
    </div>
  </body></html>`;
}

function buildText(b) {
  return [
    `ELEVN // CONTACT FORM`,
    `Name: ${b.name || ''}`,
    `Email: ${b.email || ''}`,
    `Event: ${b.eventType || ''}`,
    `Date: ${b.date || ''}`,
    '',
    'Message:',
    b.message || '',
    '',
    b.consent || ''
  ].join('\n');
}
