/**
 * POST /api/leads/log
 * Receives call output JSON and writes to the client's Google Sheet.
 * Triggers tier-appropriate post-call processing (quality score, lost lead, staff assign).
 */

import { NextRequest, NextResponse } from 'next/server';
import { getClientById } from '@/lib/clientManager';
import { appendToSheet } from '@/lib/googleSheets';
import { TIER_RULES } from '@/../config/tierRules';
import { scoreCallQuality, saveQualityScoreToSheet } from '@/lib/qualityScorer';
import { detectLostLead, saveLostLeadAlert } from '@/lib/lostLeadDetector';
import { assignStaff } from '@/lib/staffAssigner';
import { updateCampaignAnalytics, updateBestTimeToCall } from '@/lib/campaignAnalytics';
import { logError, logEvent } from '@/lib/logger';
import { generateId } from '@/lib/utils';

export async function POST(req: NextRequest) {
  let body: Record<string, any>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const {
    businessId, tier, direction = 'inbound', transcript = '',
    // Inbound call fields
    callerName, callerPhone, callerEmail, language, serviceRequested,
    callerIntent, intentConfidence, urgency, isNewCustomer,
    preferredDate, preferredTime, callbackNeeded, humanHandoffNeeded,
    isSpam, calendlyLinkSent, callOutcome, leadScore, lostLeadRisk,
    lostLeadReason, aiSummary, callReason, nextAction, dynamicQuestionsAsked,
    qualityFlags,
    // Outbound call fields
    outcome, booked, calendlySent, optOutDetected, objectionDetected,
    objectionType, callerSentiment, summary, nextFollowupDate,
    campaignType, leadId,
  } = body;

  if (!businessId) {
    return NextResponse.json({ error: 'businessId is required' }, { status: 400 });
  }

  // Load client config
  let client: any;
  try {
    client = await getClientById(businessId);
    if (!client) throw new Error('Client not found');
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 404 });
  }

  const features = TIER_RULES[(tier || client.tier) as keyof typeof TIER_RULES] as any;
  const callId        = generateId('CALL');
  const now           = new Date();
  const callDate      = now.toISOString().split('T')[0];
  const callTime      = now.toTimeString().split(' ')[0];

  // ── 1. Basic lead scoring (all tiers) ──────────────────────────────────────
  const computedLeadScore = leadScore ?? computeBasicLeadScore(body);

  // ── 2. Lead priority (all tiers) ───────────────────────────────────────────
  const leadPriority =
    urgency === 'Emergency' ? 'Critical' :
    urgency === 'Urgent'    ? 'Urgent'   :
    computedLeadScore >= 70 ? 'High'     :
    computedLeadScore >= 40 ? 'Medium'   : 'Low';

  // ── 3. Staff assignment (medium/high) ──────────────────────────────────────
  let assignedStaff = '';
  if (features.staffAssignment) {
    try {
      const assignment = await assignStaff(
        { callId, businessId, serviceRequested, callerPhone, urgency },
        client.googleSheetId
      );
      assignedStaff = assignment.staffName || '';
    } catch (err) {
      console.warn('[leads/log] Staff assignment failed:', err);
    }
  }

  // ── 4. Write to Call Log tab ────────────────────────────────────────────────
  const callRow = direction === 'inbound' ? [
    callId, callDate, callTime,
    callerName ?? '', callerPhone ?? '', callerEmail ?? '',
    language ?? 'en', serviceRequested ?? '',
    callOutcome ?? '', computedLeadScore, leadPriority,
    isNewCustomer ?? '', urgency ?? 'Low',
    callerIntent ?? '', callReason ?? '',
    calendlyLinkSent ?? false, callbackNeeded ?? false,
    humanHandoffNeeded ?? false, isSpam ?? false,
    aiSummary ?? '', nextAction ?? '',
    assignedStaff, '', // Assigned To, Notes
    intentConfidence ?? '', dynamicQuestionsAsked ? JSON.stringify(dynamicQuestionsAsked) : '',
    lostLeadRisk ?? false, lostLeadReason ?? '',
  ] : [
    callId, callDate, callTime,
    body.leadName ?? '', body.leadPhone ?? '', '',
    'en', body.serviceInterest ?? '',
    outcome ?? '', 0, leadPriority,
    '', '', '', campaignType ?? '',
    calendlySent ?? false, false, false, false,
    summary ?? '', body.nextAction ?? '',
    '', '', '', '',
    false, '',
  ];

  try {
    await appendToSheet(client.googleSheetId, 'Call Log', callRow);
  } catch (err) {
    await logError({ business_id: businessId, error_type: 'sheet_write', error_message: String(err), timestamp: new Date().toISOString() });
    return NextResponse.json({ error: 'Failed to write to sheet' }, { status: 500 });
  }

  // ── 5. Post-call tier-specific processing (non-blocking) ───────────────────

  const callData = {
    callId, businessId, callerName, callerPhone, serviceRequested,
    callerIntent, callOutcome: callOutcome ?? outcome,
    leadScore: computedLeadScore, leadPriority,
    urgency, appointmentRequested: callOutcome === 'Appointment Requested',
    calendlyLinkSent: calendlyLinkSent ?? calendlySent ?? false,
    callbackNeeded: callbackNeeded ?? false,
    isSpam: isSpam ?? false,
    humanHandoffNeeded: humanHandoffNeeded ?? false,
    aiSummary: aiSummary ?? summary ?? '',
  };

  // Medium + High: quality scoring (async, non-blocking)
  if (features.aiQualityScore) {
    scoreCallQuality(callData, transcript)
      .then(score => saveQualityScoreToSheet(client.googleSheetId, score))
      .catch(err => logError({ business_id: businessId, error_type: 'quality_score', error_message: String(err), timestamp: new Date().toISOString() }));
  }

  // Medium + High: lost lead detection (async, non-blocking)
  if (features.lostLeadAlerts && direction === 'inbound') {
    const alert = detectLostLead({ ...callData, lostLeadRisk, lostLeadReason } as any);
    if (alert) {
      saveLostLeadAlert(client.googleSheetId, alert)
        .catch(err => logError({ business_id: businessId, error_type: 'lost_lead', error_message: String(err), timestamp: new Date().toISOString() }));
    }
  }

  // High + outbound: campaign analytics and best-time-to-call
  if (features.campaignAnalytics && direction === 'outbound') {
    const attemptData = {
      callSid: callId, leadId: leadId ?? '', businessId, campaignType: campaignType ?? '',
      attemptedAt: now.toISOString(), outcome: outcome ?? '',
      answered: outcome !== 'No Answer' && !!outcome,
      booked: booked ?? false, calendlySent: calendlySent ?? false,
      callbackNeeded: body.callbackNeeded ?? false,
      optOutDetected: optOutDetected ?? false,
      objectionDetected: objectionDetected ?? false,
      objectionType: objectionType ?? '',
      durationSeconds: 0,
    };

    updateCampaignAnalytics(client.googleSheetId, attemptData)
      .catch(err => logError({ business_id: businessId, error_type: 'campaign_analytics', error_message: String(err), timestamp: new Date().toISOString() }));

    updateBestTimeToCall(client.googleSheetId, attemptData)
      .catch(err => logError({ business_id: businessId, error_type: 'best_time_to_call', error_message: String(err), timestamp: new Date().toISOString() }));
  }

  await logEvent({
    event_type:  'lead_logged',
    business_id: businessId,
    metadata:    { callId, tier, direction, outcome: callData.callOutcome },
    timestamp:   now.toISOString(),
  });

  return NextResponse.json({ success: true, callId }, { status: 200 });
}

// ── Basic lead score fallback for low tier ─────────────────────────────────────
function computeBasicLeadScore(data: Record<string, any>): number {
  let score = 0;
  if (data.callerIntent === 'new_appointment') score += 30;
  if (data.urgency === 'Urgent' || data.urgency === 'Emergency') score += 25;
  if (data.isNewCustomer === true) score += 15;
  if (data.calendlyLinkSent) score += 15;
  if (data.callerEmail) score += 10;
  if (data.preferredDate || data.preferredTime) score += 10;
  if (data.callbackNeeded && !data.calendlyLinkSent) score -= 5;
  if (data.isSpam) return 0;
  return Math.max(0, Math.min(100, score));
}
