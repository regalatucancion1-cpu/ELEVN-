import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const TO_EMAIL = process.env.SESSION_TO_EMAIL || 'elevndjs@gmail.com';
const FROM_EMAIL = process.env.SESSION_FROM_EMAIL || 'ELEVN Sessions <onboarding@resend.dev>';

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
  const { pdfBase64, pdfFilename, ...brief } = body;

  const couple = brief.couple || 'unnamed couple';
  const subject = `ELEVN session brief, ${couple}${brief.event_date ? ' / ' + brief.event_date : ''}`;

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: TO_EMAIL,
      subject,
      html: buildHtml(brief),
      text: buildText(brief),
      attachments: pdfBase64 ? [{
        filename: pdfFilename || 'elevn-session-brief.pdf',
        content: pdfBase64
      }] : undefined
    });
    if (error) throw new Error(error.message || 'Resend error');
    return res.status(200).json({ success: true });
  } catch (e) {
    console.error('lock-session error', e);
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
      <div style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;letter-spacing:0.2em;color:#888;text-transform:uppercase;">ELEVN // SESSION BRIEF ${esc(b.session_id || '')}</div>
      <div style="font-family:Georgia,serif;font-size:30px;font-weight:800;line-height:1.05;margin-top:8px;letter-spacing:-0.01em;">${esc(b.couple || '')}</div>
      <div style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:13px;color:#aaa;margin-top:10px;">${esc(b.event_date || '')} &middot; ${esc(b.venue || '')} &middot; ${esc(b.guests ? b.guests + ' guests' : '')}</div>
    </div>`;

  const basics = `<table style="border-collapse:collapse;">${[
    row('Profile', b.profile),
    row('Party hours', b.party_hours),
    row('Trust margin', b.trust + ' / 10'),
    row('Locked at', b.locked_at)
  ].join('')}</table>`;

  const energy = `<table style="border-collapse:collapse;">${[
    row('Peak time', b.peak_time),
    row('Peak energy', b.peak_energy + ' / 10'),
    row('Avg energy', b.avg_energy + ' / 10'),
    row('Drop track', b.drop_track)
  ].join('')}</table>`;

  const must = b.must_play
    ? `<ol style="margin:0;padding-left:20px;color:#111;font-size:14px;line-height:1.6;">${b.must_play.split(' | ').map(t => `<li>${esc(t)}</li>`).join('')}</ol>`
    : '<p style="color:#999;font-style:italic;">none</p>';

  const noplay = `<table style="border-collapse:collapse;">${[
    row('Genres out', b.no_play_genres),
    row('Songs / artists out', b.no_play_songs)
  ].join('')}</table>`;

  const moments = `<table style="border-collapse:collapse;">${[
    row('Opener', b.moment_opener),
    row('Entrance', b.moment_entrance),
    row('First dance', b.moment_firstdance),
    row('Parents dances', b.moment_parents),
    row('Last song', b.moment_last)
  ].join('')}</table>`;

  const crowd = `<table style="border-collapse:collapse;">${[
    row('Age brackets', b.crowd_age),
    row('Dance intent', b.crowd_dance),
    row('Languages', b.crowd_langs),
    row('Origins', b.crowd_origins)
  ].join('')}</table>`;

  const playlists = b.inspo_playlists
    ? `<ul style="margin:0;padding-left:20px;color:#111;font-size:13px;line-height:1.6;">${b.inspo_playlists.split(' | ').map(u => `<li><a href="${esc(u)}" style="color:#C46A35;">${esc(u)}</a></li>`).join('')}</ul>`
    : '<p style="color:#999;font-style:italic;">none</p>';

  const inspo = `${playlists}<table style="border-collapse:collapse;margin-top:10px;">${[
    row('Reference DJ set', b.inspo_set),
    row('Club / venue feel', b.inspo_club),
    row('Notes', b.inspo_notes)
  ].join('')}</table>`;

  const rider = b.rider
    ? `<table style="border-collapse:collapse;">${Object.entries(safeParse(b.rider)).map(([k, v]) => row(k.replace(/_/g, ' '), v ? 'YES' : 'no')).join('')}</table>`
    : '<p style="color:#999;font-style:italic;">none</p>';

  return `<!doctype html><html><body style="margin:0;background:#fafafa;font-family:'Helvetica Neue',Arial,sans-serif;color:#111;">
    <div style="max-width:680px;margin:0 auto;background:#fff;">
      ${head}
      <div style="padding:8px 32px 32px;">
        ${section('Basics', basics)}
        ${section('Energy curve', energy)}
        ${section('Must play', must)}
        ${section('No play', noplay)}
        ${section('Key moments', moments)}
        ${section('Crowd', crowd)}
        ${section('Inspo', inspo)}
        ${section('Rider', rider)}
      </div>
      <div style="padding:18px 32px;background:#0a0a0a;color:#666;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;">PDF brief attached &middot; elevndjs.com</div>
    </div>
  </body></html>`;
}

function buildText(b) {
  return [
    `ELEVN // SESSION BRIEF ${b.session_id || ''}`,
    `Couple: ${b.couple || ''}`,
    `Date: ${b.event_date || ''}`,
    `Venue: ${b.venue || ''}`,
    `Guests: ${b.guests || ''}`,
    `Party hours: ${b.party_hours || ''}`,
    `Profile: ${b.profile || ''}`,
    `Trust: ${b.trust || ''} / 10`,
    '',
    `Peak: ${b.peak_time || ''} @ ${b.peak_energy || ''}/10  |  Avg: ${b.avg_energy || ''}/10`,
    `Drop track: ${b.drop_track || ''}`,
    '',
    `Must play: ${b.must_play || 'none'}`,
    `No play (genres): ${b.no_play_genres || 'none'}`,
    `No play (songs): ${b.no_play_songs || 'none'}`,
    '',
    `Opener: ${b.moment_opener || ''}`,
    `Entrance: ${b.moment_entrance || ''}`,
    `First dance: ${b.moment_firstdance || ''}`,
    `Parents dances: ${b.moment_parents || ''}`,
    `Last song: ${b.moment_last || ''}`,
    '',
    `Crowd: ${b.crowd_age || ''} / ${b.crowd_dance || ''}`,
    `Languages: ${b.crowd_langs || ''}`,
    `Origins: ${b.crowd_origins || ''}`,
    '',
    `Inspo playlists: ${b.inspo_playlists || 'none'}`,
    `Inspo set: ${b.inspo_set || ''}`,
    `Inspo club: ${b.inspo_club || ''}`,
    `Inspo notes: ${b.inspo_notes || ''}`,
    '',
    `Rider: ${b.rider || ''}`,
    `Locked at: ${b.locked_at || ''}`
  ].join('\n');
}

function safeParse(s) {
  try { return JSON.parse(s) || {}; } catch (e) { return {}; }
}
