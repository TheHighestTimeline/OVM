/**
 * POST /api/summary/morning  (cron: 0 8 * * *)
 * Sends differentiated morning summary emails based on client tier.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAllActiveClients } from '@/lib/clientManager';
import { readSheetTab } from '@/lib/googleSheets';
import { sendEmail } from '@/lib/emailSender';
import { TIER_RULES } from '@/../config/tierRules';
import { logEvent, logError } from '@/lib/logger';

export async function POST(req: NextRequest) {
  const clients = await getAllActiveClients();
  let sent = 0, errors = 0;

  for (const client of clients) {
    try {
      await sendMorningSummary(client);
      sent++;
    } catch (err) {
      errors++;
      await logError({ business_id: client.businessId, error_type: 'morning_summary', error_message: String(err), timestamp: new Date().toISOString() });
    }
  }

  return NextResponse.json({ sent, errors });
}

async function sendMorningSummary(client: any): Promise<void> {
  const features = TIER_RULES[client.tier as 'low' | 'medium' | 'high'] as any;
  const yesterday = getYesterdayDate();
  const calls     = await getYesterdayCalls(client.googleSheetId, yesterday);

  if (calls.length === 0 && client.tier === 'low') return; // skip quiet days for low tier

  const html = await (client.tier === 'high'
    ? buildHighTierSummary(client, calls, features)
    : client.tier === 'medium'
      ? buildMediumTierSummary(client, calls, features)
      : buildLowTierSummary(client, calls));

  await sendEmail({
    to:      client.ownerEmail,
    subject: `☀️ Daily AI Agent Summary — ${client.businessName} (${yesterday})`,
    html,
  });

  await logEvent({ event_type: 'morning_summary_sent', business_id: client.businessId, timestamp: new Date().toISOString() });
}

// ── Low Tier Summary ──────────────────────────────────────────────────────────

function buildLowTierSummary(client: any, calls: string[][]): string {
  const total       = calls.length;
  const leads       = calls.filter(c => !['Spam / Vendor','Wrong Number'].includes(c[8])).length;
  const callbacks   = calls.filter(c => c[16] === 'TRUE').length;
  const spam        = calls.filter(c => c[18] === 'TRUE').length;
  const urgent      = calls.filter(c => c[12] === 'Urgent' || c[12] === 'Emergency').length;
  const needsAttention = calls.filter(c => c[16] === 'TRUE' || c[12] === 'Urgent').slice(0, 5);

  return `
<html><body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#333">
<h2>☀️ Good Morning — ${client.businessName}</h2>
<p>Here's what your AI receptionist handled yesterday:</p>

<table style="width:100%;border-collapse:collapse">
  <tr><td style="padding:8px;border:1px solid #ddd"><strong>Total Calls</strong></td><td style="padding:8px;border:1px solid #ddd">${total}</td></tr>
  <tr><td style="padding:8px;border:1px solid #ddd"><strong>Leads Captured</strong></td><td style="padding:8px;border:1px solid #ddd">${leads}</td></tr>
  <tr><td style="padding:8px;border:1px solid #ddd"><strong>Callbacks Needed</strong></td><td style="padding:8px;border:1px solid #ddd;${callbacks > 0 ? 'color:red;font-weight:bold' : ''}">${callbacks}</td></tr>
  <tr><td style="padding:8px;border:1px solid #ddd"><strong>Urgent Calls</strong></td><td style="padding:8px;border:1px solid #ddd;${urgent > 0 ? 'color:red;font-weight:bold' : ''}">${urgent}</td></tr>
  <tr><td style="padding:8px;border:1px solid #ddd"><strong>Spam Filtered</strong></td><td style="padding:8px;border:1px solid #ddd">${spam}</td></tr>
</table>

${needsAttention.length > 0 ? `
<h3 style="color:#d32f2f">⚠️ Needs Attention Today</h3>
<table style="width:100%;border-collapse:collapse">
  <tr style="background:#f5f5f5"><th style="padding:8px;border:1px solid #ddd">Name</th><th>Phone</th><th>Service</th><th>Priority</th></tr>
  ${needsAttention.map(c => `<tr>
    <td style="padding:8px;border:1px solid #ddd">${c[3]}</td>
    <td style="padding:8px;border:1px solid #ddd">${c[4]}</td>
    <td style="padding:8px;border:1px solid #ddd">${c[7]}</td>
    <td style="padding:8px;border:1px solid #ddd">${c[10]}</td>
  </tr>`).join('')}
</table>` : '<p style="color:green">✅ No urgent follow-ups needed today.</p>'}

<p><a href="https://docs.google.com/spreadsheets/d/${client.googleSheetId}" style="background:#3a5bd9;color:white;padding:10px 20px;text-decoration:none;border-radius:4px;display:inline-block;margin-top:16px">Open My Sheet</a></p>
<p style="color:#999;font-size:0.8em">Voice Agent · ${client.businessName}</p>
</body></html>`;
}

// ── Medium Tier Summary ───────────────────────────────────────────────────────

async function buildMediumTierSummary(client: any, calls: string[][], features: any): Promise<string> {
  const total          = calls.length;
  const leads          = calls.filter(c => ['New Lead','High Intent Lead'].includes(c[8])).length;
  const highIntent     = calls.filter(c => c[8] === 'High Intent Lead').length;
  const lostLeads      = calls.filter(c => c[25] === 'TRUE').length;
  const callbacks      = calls.filter(c => c[16] === 'TRUE').length;
  const spam           = calls.filter(c => c[18] === 'TRUE').length;
  const avgScore       = avg(calls.map(c => parseInt(c[9] ?? '0', 10)));

  let avgQuality = 0;
  try {
    const qRows    = await readSheetTab(client.googleSheetId, 'AI Quality Scores');
    const yesterday = getYesterdayDate();
    const yRows    = qRows.slice(1).filter(r => r[3]?.startsWith(yesterday));
    avgQuality     = avg(yRows.map(r => parseInt(r[16] ?? '0', 10)));
  } catch {}

  const recs: string[] = [];
  if (lostLeads > 0) recs.push(`${lostLeads} lost lead(s) — review Lost Lead Alerts tab`);
  if (avgQuality < 70) recs.push('Quality score below 70 — review AI Quality Scores tab');
  if (callbacks > 3) recs.push(`${callbacks} callbacks pending — assign to team today`);

  return `
<html><body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#333">
<h2>☀️ Good Morning — ${client.businessName}</h2>

<table style="width:100%;border-collapse:collapse">
  ${row('Total Calls', total)}
  ${row('New Leads', leads)}
  ${row('High Intent Leads', highIntent, highIntent > 0 ? '#1b5e20' : '')}
  ${row('Lost Leads', lostLeads, lostLeads > 0 ? '#b71c1c' : '')}
  ${row('Callbacks Needed', callbacks, callbacks > 0 ? '#e65100' : '')}
  ${row('Spam Filtered', spam)}
  ${row('Avg Lead Score', `${avgScore.toFixed(0)} / 100`)}
  ${row('Avg Quality Score', `${avgQuality.toFixed(0)} / 100`, avgQuality < 70 ? '#b71c1c' : '')}
</table>

${recs.length > 0 ? `<h3>📌 Recommendations</h3>${recs.map(r => `<p style="background:#fff8e1;border-left:4px solid #f9a825;padding:8px 12px">${r}</p>`).join('')}` : '<p style="color:green">✅ Everything looks good today!</p>'}

<p><a href="https://docs.google.com/spreadsheets/d/${client.googleSheetId}" style="background:#3a5bd9;color:white;padding:10px 20px;text-decoration:none;border-radius:4px;display:inline-block;margin-top:16px">Open My Sheet</a></p>
<p style="color:#999;font-size:0.8em">Voice Agent Smart Plan · ${client.businessName}</p>
</body></html>`;
}

// ── High Tier Summary ─────────────────────────────────────────────────────────

async function buildHighTierSummary(client: any, calls: string[][], features: any): Promise<string> {
  const mediumHtml = await buildMediumTierSummary(client, calls, features);

  let outboundAttempted = 0, outboundAnswered = 0, outboundBooked = 0, hotLeads = 0, optOuts = 0;
  try {
    const oRows = await readSheetTab(client.googleSheetId, 'Outbound Attempts');
    const yesterday = getYesterdayDate();
    const yRows = oRows.slice(1).filter(r => r[7]?.startsWith(yesterday));
    outboundAttempted = yRows.length;
    outboundAnswered  = yRows.filter(r => r[8] !== 'No Answer').length;
    outboundBooked    = yRows.filter(r => r[8] === 'Booked').length;
    optOuts           = yRows.filter(r => r[9] === 'TRUE').length;
    hotLeads          = calls.filter(c => parseInt(c[9] ?? '0', 10) >= 75).length;
  } catch {}

  const outboundBlock = `
<h3>📞 Outbound Activity</h3>
<table style="width:100%;border-collapse:collapse">
  ${row('Outbound Attempted', outboundAttempted)}
  ${row('Answered', outboundAnswered)}
  ${row('Booked from Outbound', outboundBooked, outboundBooked > 0 ? '#1b5e20' : '')}
  ${row('Opt-Outs', optOuts, optOuts > 2 ? '#b71c1c' : '')}
  ${row('Hot Leads (score ≥75)', hotLeads, hotLeads > 0 ? '#1b5e20' : '')}
</table>`;

  // Insert outbound block before the closing button
  return mediumHtml.replace(
    '<p><a href="https://docs.google.com/spreadsheets',
    outboundBlock + '<p><a href="https://docs.google.com/spreadsheets'
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

async function getYesterdayCalls(sheetId: string, yesterday: string): Promise<string[][]> {
  try {
    const rows = await readSheetTab(sheetId, 'Call Log');
    return rows.slice(1).filter(r => r[1] === yesterday);
  } catch { return []; }
}

function getYesterdayDate(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

function avg(nums: number[]): number {
  const valid = nums.filter(n => !isNaN(n));
  return valid.length ? valid.reduce((a, b) => a + b, 0) / valid.length : 0;
}

function row(label: string, value: string | number, color = ''): string {
  return `<tr>
    <td style="padding:8px;border:1px solid #ddd"><strong>${label}</strong></td>
    <td style="padding:8px;border:1px solid #ddd;${color ? `color:${color};font-weight:bold` : ''}">${value}</td>
  </tr>`;
}
