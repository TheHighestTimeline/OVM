/**
 * POST /api/outbound/result
 * Twilio status callback — called when an outbound call ends.
 * Parses AI output, updates all relevant sheet tabs.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getClientById } from '@/lib/clientManager';
import { appendToSheet, readSheetTab, updateSheetRow } from '@/lib/googleSheets';
import { updateCampaignAnalytics, updateBestTimeToCall } from '@/lib/campaignAnalytics';
import { scoreCallQuality, saveQualityScoreToSheet } from '@/lib/qualityScorer';
import { sendEmail } from '@/lib/emailSender';
import { logError, logEvent } from '@/lib/logger';
import { generateId } from '@/lib/utils';

export async function POST(req: NextRequest) {
  // Twilio sends form data for status callbacks
  let body: Record<string, string>;
  try {
    const formData = await req.formData();
    body = Object.fromEntries(formData.entries()) as Record<string, string>;
  } catch {
    try {
      body = await req.json();
    } catch {
      return new Response('Bad Request', { status: 400 });
    }
  }

  const {
    CallSid, CallStatus, CallDuration,
    businessId, leadId, campaignType,
    // AI JSON output (passed via custom params or extracted from recording)
    aiOutput,
  } = body;

  if (!CallSid) return new Response('Missing CallSid', { status: 400 });

  console.log(`[outbound/result] Call ${CallSid} ended with status: ${CallStatus}`);

  // Load client
  const client = businessId ? await getClientById(businessId).catch(() => null) : null;
  if (!client) {
    console.warn(`[outbound/result] Client not found for businessId: ${businessId}`);
    return NextResponse.json({ received: true });
  }

  // Parse AI output JSON
  let aiData: Record<string, any> = {};
  if (aiOutput) {
    try { aiData = JSON.parse(aiOutput); } catch { /* use defaults */ }
  }

  const now              = new Date();
  const resultId         = generateId('OR');
  const callDate         = now.toISOString().split('T')[0];
  const callTime         = now.toTimeString().split(' ')[0];
  const outcome          = aiData.outcome || mapTwilioStatusToOutcome(CallStatus);
  const answered         = CallStatus === 'completed' && parseInt(CallDuration ?? '0') > 5;
  const booked           = aiData.booked ?? false;
  const optOutDetected   = aiData.optOutDetected ?? false;
  const humanFollowup    = aiData.humanFollowupNeeded ?? false;

  // ── 1. Handle opt-out ──────────────────────────────────────────────────────
  if (optOutDetected && aiData.leadPhone) {
    const dncRow = [
      generateId('DNC'),
      aiData.leadPhone,
      aiData.leadName ?? '',
      campaignType ?? '',
      'Opt-Out on Call',
      now.toISOString(),
    ];
    await appendToSheet(client.googleSheetId, 'Do Not Call / Opt-Outs', dncRow)
      .catch(err => console.error('[outbound/result] DNC write failed:', err));
  }

  // ── 2. Write to Outbound Results tab ───────────────────────────────────────
  const resultRow = [
    resultId,
    leadId ?? '',
    client.businessId,
    CallSid,
    campaignType ?? '',
    aiData.leadName ?? '',
    aiData.leadPhone ?? '',
    callDate, callTime,
    outcome,
    answered,
    booked,
    aiData.calendlySent ?? false,
    aiData.callbackNeeded ?? false,
    humanFollowup,
    optOutDetected,
    aiData.objectionDetected ?? false,
    aiData.objectionType ?? '',
    aiData.callerSentiment ?? 'Neutral',
    aiData.summary ?? '',
    aiData.nextAction ?? '',
    aiData.nextFollowupDate ?? '',
    parseInt(CallDuration ?? '0'),
  ];

  await appendToSheet(client.googleSheetId, 'Outbound Results', resultRow)
    .catch(err => logError({ business_id: client.businessId, error_type: 'outbound_result_write', error_message: String(err), timestamp: now.toISOString() }));

  // ── 3. Update Outbound Queue row ───────────────────────────────────────────
  if (leadId) {
    const newStatus =
      optOutDetected ? 'Opted Out' :
      booked         ? 'Booked'    :
      outcome === 'No Answer' ? 'No Answer' :
      'Completed';

    await updateSheetRow(client.googleSheetId, 'Outbound Queue', leadId, {
      status:               newStatus,
      last_interaction_date: now.toISOString(),
      validation_notes:     outcome,
    }).catch(() => {});
  }

  // ── 4. Update Campaign Analytics + Best Time To Call ──────────────────────
  const attemptData = {
    callSid: CallSid, leadId: leadId ?? '', businessId: client.businessId,
    campaignType: campaignType ?? '', attemptedAt: now.toISOString(),
    outcome, answered, booked,
    calendlySent:      aiData.calendlySent ?? false,
    callbackNeeded:    aiData.callbackNeeded ?? false,
    optOutDetected,
    objectionDetected: aiData.objectionDetected ?? false,
    objectionType:     aiData.objectionType ?? '',
    durationSeconds:   parseInt(CallDuration ?? '0'),
  };

  await Promise.allSettled([
    updateCampaignAnalytics(client.googleSheetId, attemptData),
    updateBestTimeToCall(client.googleSheetId, attemptData),
  ]);

  // ── 5. Human follow-up alert ───────────────────────────────────────────────
  if (humanFollowup) {
    sendEmail({
      to:      client.ownerEmail,
      subject: `🔔 Human Follow-Up Needed — ${aiData.leadName ?? 'A lead'} (${campaignType})`,
      html:    `<p><strong>${aiData.leadName}</strong> (${aiData.leadPhone}) requested to speak with a human during an outbound call.</p>
               <p><strong>Campaign:</strong> ${campaignType}</p>
               <p><strong>Summary:</strong> ${aiData.summary}</p>
               <p><strong>Recommended next action:</strong> ${aiData.nextAction}</p>`,
    }).catch(() => {});
  }

  // ── 6. Write to Appointments tab if booked ─────────────────────────────────
  if (booked) {
    await appendToSheet(client.googleSheetId, 'Appointments', [
      generateId('APT'),
      aiData.leadName ?? '', aiData.leadPhone ?? '',
      aiData.serviceInterest ?? '', callDate, callTime,
      'Pending Confirmation', 'Booked via Outbound', CallSid,
    ]).catch(() => {});
  }

  // ── 7. Quality score for outbound (high tier) ──────────────────────────────
  if (client.tier === 'high' && aiData.summary && body.transcript) {
    scoreCallQuality(
      { callId: resultId, businessId: client.businessId, callerName: aiData.leadName ?? '',
        callerPhone: aiData.leadPhone ?? '', callerIntent: campaignType ?? '',
        serviceRequested: aiData.serviceInterest ?? '', urgency: 'Standard',
        callOutcome: outcome, calendlyLinkSent: aiData.calendlySent ?? false,
        humanHandoffNeeded: humanFollowup, isSpam: false, leadScore: 0, aiSummary: aiData.summary },
      body.transcript ?? ''
    )
      .then(score => saveQualityScoreToSheet(client.googleSheetId, score))
      .catch(() => {});
  }

  await logEvent({
    event_type:  'outbound_result_processed',
    business_id: client.businessId,
    metadata:    { CallSid, outcome, booked, optOutDetected },
    timestamp:   now.toISOString(),
  });

  return NextResponse.json({ received: true, resultId });
}

function mapTwilioStatusToOutcome(status: string): string {
  switch (status) {
    case 'completed':   return 'Completed';
    case 'no-answer':   return 'No Answer';
    case 'busy':        return 'Busy';
    case 'failed':      return 'Failed';
    case 'canceled':    return 'Canceled';
    default:            return status ?? 'Unknown';
  }
}
