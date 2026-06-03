import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const TO_EMAIL = process.env.SESSION_TO_EMAIL || 'elevndjs@gmail.com';
const FROM_EMAIL = process.env.SESSION_FROM_EMAIL || 'ELEVN Aperitivo <onboarding@resend.dev>';

export const config = {
  api: {
    bodyParser: { sizeLimit: '8mb' }
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

  // Honeypot: silently accept (so bots think they succeeded) but never send.
  if (body._honey) {
    return res.status(200).json({ success: true });
  }

  const { pdfBase64, pdfFilename, ...brief } = body;

  const couple = brief.couple || 'unnamed event';
  const subject = `ELEVN aperitivo brief, ${couple}${brief.event_date ? ' / ' + brief.event_date : ''}`;

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: TO_EMAIL,
      replyTo: brief.email || undefined,
      subject,
      html: buildHtml(brief),
      text: buildText(brief),
      attachments: pdfBase64 ? [{
        filename: pdfFilename || 'elevn-aperitivo-brief.pdf',
        content: pdfBase64
      }] : undefined
    });
    if (error) throw new Error(error.message || 'Resend error');
    return res.status(200).json({ success: true });
  } catch (e) {
    console.error('sax-brief error', e);
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

function section(title, inner) {
  return `<h2 style="margin:28px 0 10px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:13px;letter-spacing:0.16em;text-transform:uppercase;color:#C46A35;border-top:1px solid #eee;padding-top:18px;">${esc(title)}</h2>${inner}`;
}

function buildHtml(b) {
  const head = `
    <div style="background:#0a0a0a;color:#f0ede8;padding:28px 32px;">
      <div style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;letter-spacing:0.2em;color:#888;text-transform:uppercase;">ELEVN // SAX APERITIVO ${esc(b.session_id || '')}</div>
      <div style="font-family:Georgia,serif;font-size:30px;font-weight:800;line-height:1.05;margin-top:8px;letter-spacing:-0.01em;">${esc(b.couple || '')}</div>
      <div style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:13px;color:#aaa;margin-top:10px;">${esc(b.event_date || '')} &middot; ${esc(b.venue || '')} &middot; ${esc(b.guests ? b.guests + ' guests' : '')}</div>
    </div>`;

  const basics = `<table style="border-collapse:collapse;">${[
    row('Aperitivo window', b.aperitivo_window),
    row('Contact email', b.email),
    row('Locked at', b.locked_at)
  ].join('')}</table>`;

  const vibe = `<table style="border-collapse:collapse;">${[
    row('Style', b.style_main),
    row('Vibe notes', b.vibe_notes)
  ].join('')}</table>`;

  const moments = `<table style="border-collapse:collapse;">${[
    row('Aperitivo entrance?', b.has_entrance),
    row('Entrance moment', b.moment_entrance),
    row('Notes', b.moment_notes)
  ].join('')}</table>`;

  const must = b.must_hear
    ? `<ol style="margin:0;padding-left:20px;color:#111;font-size:14px;line-height:1.6;">${b.must_hear.split(' | ').map(t => `<li>${esc(t)}</li>`).join('')}</ol>`
    : '<p style="color:#999;font-style:italic;">none</p>';

  const playlists = b.inspo_playlists
    ? `<ul style="margin:0;padding-left:20px;color:#111;font-size:13px;line-height:1.6;">${b.inspo_playlists.split(' | ').map(u => `<li><a href="${esc(u)}" style="color:#C46A35;">${esc(u)}</a></li>`).join('')}</ul>`
    : '<p style="color:#999;font-style:italic;">none</p>';

  const refs = `${playlists}<table style="border-collapse:collapse;margin-top:10px;">${[
    row('Reference notes', b.inspo_notes)
  ].join('')}</table>`;

  const noplay = `<table style="border-collapse:collapse;">${[
    row('Genres / songs out', b.no_play)
  ].join('')}</table>`;

  const setup = `<table style="border-collapse:collapse;">${[
    row('Format', b.setup_format),
    row('Roaming among guests', b.setup_roaming),
    row('Outdoor / shade', b.setup_outdoor),
    row('Power on site', b.setup_power),
    row('Extra notes', b.extra_notes)
  ].join('')}</table>`;

  return `<!doctype html><html><body style="margin:0;background:#fafafa;font-family:'Helvetica Neue',Arial,sans-serif;color:#111;">
    <div style="max-width:680px;margin:0 auto;background:#fff;">
      ${head}
      <div style="padding:8px 32px 32px;">
        ${section('Basics', basics)}
        ${section('The vibe', vibe)}
        ${section('Key moments', moments)}
        ${section('Must hear', must)}
        ${section('References', refs)}
        ${section('No play', noplay)}
        ${section('Setup', setup)}
      </div>
      <div style="padding:18px 32px;background:#0a0a0a;color:#666;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;">PDF brief attached &middot; elevndjs.com</div>
    </div>
  </body></html>`;
}

function buildText(b) {
  return [
    `ELEVN // SAX APERITIVO ${b.session_id || ''}`,
    `Event: ${b.couple || ''}`,
    `Date: ${b.event_date || ''}`,
    `Venue: ${b.venue || ''}`,
    `Guests: ${b.guests || ''}`,
    `Aperitivo window: ${b.aperitivo_window || ''}`,
    `Contact: ${b.email || ''}`,
    '',
    `Style: ${b.style_main || ''}`,
    `Vibe notes: ${b.vibe_notes || ''}`,
    '',
    `Aperitivo entrance? ${b.has_entrance || ''}`,
    `Entrance moment: ${b.moment_entrance || ''}`,
    `Notes: ${b.moment_notes || ''}`,
    '',
    `Must hear: ${b.must_hear || 'none'}`,
    `Reference playlists: ${b.inspo_playlists || 'none'}`,
    `Reference notes: ${b.inspo_notes || ''}`,
    `No play: ${b.no_play || 'none'}`,
    '',
    `Format: ${b.setup_format || ''}`,
    `Roaming: ${b.setup_roaming || ''}`,
    `Outdoor / shade: ${b.setup_outdoor || ''}`,
    `Power: ${b.setup_power || ''}`,
    `Extra notes: ${b.extra_notes || ''}`,
    `Locked at: ${b.locked_at || ''}`
  ].join('\n');
}
