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

  const lead = {
    eventType: clip(body.eventType),
    name: clip(body.name),
    email: clip(body.email),
    phone: clip(body.phone),
    company: clip(body.company),
    date: clip(body.date),
    venue: clip(body.venue),
    guests: clip(body.guests),
    format: clip(body.format),
    service: clip(body.service),
    brand: clip(body.brand),
    mc: clip(body.mc),
    reference: clip(body.reference, 4000),
    avoid: clip(body.avoid, 4000),
    notes: clip(body.notes, 4000),
    profile: clip(body.profile),
    scores: clip(body.scores),
    consent: clip(body.consent)
  };

  if (!lead.email) {
    return res.status(400).json({ error: 'Missing email' });
  }

  const subject = `ELEVN match, ${lead.name || 'New lead'} (${lead.eventType || '?'} / ${lead.profile || '?'})`;

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: TO_EMAIL,
      replyTo: lead.email,
      subject,
      html: buildHtml(lead),
      text: buildText(lead)
    });
    if (error) throw new Error(error.message || 'Resend error');
    return res.status(200).json({ success: true });
  } catch (e) {
    console.error('match error', e);
    return res.status(500).json({ error: e.message || 'Send failed' });
  }
}

function clip(s, max = 500) {
  return String(s == null ? '' : s).slice(0, max);
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

function section(title, inner) {
  return `<h2 style="margin:28px 0 10px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:13px;letter-spacing:0.16em;text-transform:uppercase;color:#C46A35;border-top:1px solid #eee;padding-top:18px;">${esc(title)}</h2>${inner}`;
}

function paragraph(text) {
  if (!text) return '<p style="color:#999;font-style:italic;margin:0;">none</p>';
  return `<p style="white-space:pre-wrap;color:#111;font-size:14px;line-height:1.6;margin:0;">${esc(text)}</p>`;
}

function buildHtml(b) {
  const head = `
    <div style="background:#0a0a0a;color:#f0ede8;padding:28px 32px;">
      <div style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;letter-spacing:0.2em;color:#888;text-transform:uppercase;">ELEVN // MATCH FORM</div>
      <div style="font-family:Georgia,serif;font-size:30px;font-weight:800;line-height:1.05;margin-top:8px;letter-spacing:-0.01em;">${esc(b.name || 'New lead')}</div>
      <div style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:13px;color:#aaa;margin-top:10px;">${esc(b.eventType || '')}${b.profile ? ' &middot; ' + esc(b.profile) : ''}${b.date ? ' &middot; ' + esc(b.date) : ''}</div>
    </div>`;

  const contact = `<table style="border-collapse:collapse;">${[
    row('Name', b.name),
    row('Email', b.email),
    row('Phone', b.phone),
    row('Company', b.company)
  ].join('')}</table>`;

  const event = `<table style="border-collapse:collapse;">${[
    row('Event type', b.eventType),
    row('Date', b.date),
    row('Venue', b.venue),
    row('Guests', b.guests),
    row('Service', b.service),
    row('Format', b.format),
    row('Brand alignment', b.brand),
    row('MC needed', b.mc)
  ].join('')}</table>`;

  const profile = `<table style="border-collapse:collapse;">${[
    row('Profile', b.profile),
    row('Scores', b.scores)
  ].join('')}</table>`;

  return `<!doctype html><html><body style="margin:0;background:#fafafa;font-family:'Helvetica Neue',Arial,sans-serif;color:#111;">
    <div style="max-width:680px;margin:0 auto;background:#fff;">
      ${head}
      <div style="padding:8px 32px 32px;">
        ${section('Contact', contact)}
        ${section('Event', event)}
        ${section('Profile match', profile)}
        ${section('Reference', paragraph(b.reference))}
        ${section('Exclusions', paragraph(b.avoid))}
        ${section('Notes', paragraph(b.notes))}
        ${b.consent ? `<p style="margin-top:24px;color:#888;font-size:11px;letter-spacing:0.04em;">${esc(b.consent)}</p>` : ''}
      </div>
      <div style="padding:18px 32px;background:#0a0a0a;color:#666;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;">elevndjs.com</div>
    </div>
  </body></html>`;
}

function buildText(b) {
  return [
    `ELEVN // MATCH FORM`,
    `Event type: ${b.eventType || ''}`,
    `Name: ${b.name || ''}`,
    `Email: ${b.email || ''}`,
    `Phone: ${b.phone || ''}`,
    b.company ? `Company: ${b.company}` : '',
    `Date: ${b.date || ''}`,
    `Venue: ${b.venue || ''}`,
    `Guests: ${b.guests || ''}`,
    `Service: ${b.service || ''}`,
    b.format ? `Format: ${b.format}` : '',
    b.brand ? `Brand alignment: ${b.brand}` : '',
    b.mc ? `MC: ${b.mc}` : '',
    '',
    `Profile: ${b.profile || ''}`,
    `Scores: ${b.scores || ''}`,
    '',
    `Reference: ${b.reference || ''}`,
    `Exclusions: ${b.avoid || ''}`,
    `Notes: ${b.notes || ''}`,
    '',
    b.consent || ''
  ].filter(Boolean).join('\n');
}
