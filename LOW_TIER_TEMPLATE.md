/**
 * campaignAnalytics.ts — High Tier Only
 * Tracks outbound campaign performance and best-time-to-call patterns.
 */

import { readSheetTab, updateSheetRow, appendToSheet } from './googleSheets';

export interface OutboundAttemptData {
  callSid: string;
  leadId: string;
  businessId: string;
  campaignType: string;
  attemptedAt: string;       // ISO timestamp
  outcome: string;
  answered: boolean;
  booked: boolean;
  calendlySent: boolean;
  callbackNeeded: boolean;
  optOutDetected: boolean;
  objectionDetected: boolean;
  objectionType: string;
  durationSeconds: number;
}

// ── Best Time To Call ─────────────────────────────────────────────────────────
// Tab columns: day_of_week | hour_block | calls_attempted | calls_answered |
//              answer_rate | bookings | booking_rate | recommendation

/**
 * Update the Best Time To Call tab after each outbound attempt.
 * Finds or creates the row for (day_of_week + hour_block) and updates metrics.
 */
export async function updateBestTimeToCall(
  sheetId: string,
  callData: OutboundAttemptData
): Promise<void> {
  const attemptDate = new Date(callData.attemptedAt);
  const dayOfWeek   = getDayName(attemptDate.getDay());
  const hourBlock   = getHourBlock(attemptDate.getHours());

  try {
    const rows = await readSheetTab(sheetId, 'Best Time To Call');

    // Find existing row for this day+hour
    const matchIdx = (rows ?? []).findIndex(
      (row, i) => i > 0 && row[0] === dayOfWeek && row[1] === hourBlock
    );

    if (matchIdx > 0 && rows) {
      // Update existing row
      const existing = rows[matchIdx];
      const callsAttempted  = parseInt(existing[2] ?? '0', 10) + 1;
      const callsAnswered   = parseInt(existing[3] ?? '0', 10) + (callData.answered ? 1 : 0);
      const bookings        = parseInt(existing[5] ?? '0', 10) + (callData.booked ? 1 : 0);
      const answerRate      = ((callsAnswered / callsAttempted) * 100).toFixed(1) + '%';
      const bookingRate     = callsAnswered > 0
        ? ((bookings / callsAnswered) * 100).toFixed(1) + '%'
        : '0%';
      const recommendation  = buildTimeRecommendation(parseFloat(answerRate), parseFloat(bookingRate));

      await updateSheetRow(sheetId, 'Best Time To Call', `${dayOfWeek}|${hourBlock}`, {
        calls_attempted: callsAttempted,
        calls_answered:  callsAnswered,
        answer_rate:     answerRate,
        bookings,
        booking_rate:    bookingRate,
        recommendation,
      });
    } else {
      // Create new row
      const answerRate  = callData.answered ? '100%' : '0%';
      const bookingRate = callData.booked   ? '100%' : '0%';
      await appendToSheet(sheetId, 'Best Time To Call', [
        dayOfWeek,
        hourBlock,
        1,                               // calls_attempted
        callData.answered ? 1 : 0,       // calls_answered
        answerRate,
        callData.booked ? 1 : 0,         // bookings
        bookingRate,
        buildTimeRecommendation(callData.answered ? 100 : 0, callData.booked ? 100 : 0),
      ]);
    }

    console.log(`[campaignAnalytics] Updated Best Time To Call: ${dayOfWeek} ${hourBlock}`);
  } catch (err) {
    console.error('[campaignAnalytics] Error updating Best Time To Call:', err);
  }
}

// ── Campaign Analytics ────────────────────────────────────────────────────────
// Tab columns: campaign_type | calls_attempted | calls_answered |
//              conversations_completed | bookings | calendly_links_sent |
//              callbacks_requested | opt_outs | answer_rate | booking_rate |
//              top_objection | top_question | recommended_change

/**
 * Update the Campaign Analytics tab after each outbound call.
 * Finds or creates the row for this campaign type and updates all metrics.
 */
export async function updateCampaignAnalytics(
  sheetId: string,
  callData: OutboundAttemptData
): Promise<void> {
  const { campaignType } = callData;

  try {
    const rows = await readSheetTab(sheetId, 'Campaign Analytics');
    const matchIdx = (rows ?? []).findIndex(
      (row, i) => i > 0 && row[0] === campaignType
    );

    if (matchIdx > 0 && rows) {
      const existing = rows[matchIdx];

      const callsAttempted           = parseInt(existing[1] ?? '0', 10) + 1;
      const callsAnswered            = parseInt(existing[2] ?? '0', 10) + (callData.answered ? 1 : 0);
      const conversationsCompleted   = parseInt(existing[3] ?? '0', 10) + (callData.durationSeconds > 30 ? 1 : 0);
      const bookings                 = parseInt(existing[4] ?? '0', 10) + (callData.booked ? 1 : 0);
      const calendlyLinksSent        = parseInt(existing[5] ?? '0', 10) + (callData.calendlySent ? 1 : 0);
      const callbacksRequested       = parseInt(existing[6] ?? '0', 10) + (callData.callbackNeeded ? 1 : 0);
      const optOuts                  = parseInt(existing[7] ?? '0', 10) + (callData.optOutDetected ? 1 : 0);
      const answerRate               = ((callsAnswered / callsAttempted) * 100).toFixed(1) + '%';
      const bookingRate              = callsAnswered > 0
        ? ((bookings / callsAnswered) * 100).toFixed(1) + '%'
        : '0%';

      // Track top objection (simple: keep most recent)
      const topObjection = callData.objectionDetected
        ? callData.objectionType
        : (existing[10] ?? '');

      const recommendedChange = generateCampaignRecommendation({
        answerRate:   parseFloat(answerRate),
        bookingRate:  parseFloat(bookingRate),
        optOutRate:   optOuts / callsAttempted * 100,
        campaignType,
      });

      await updateSheetRow(sheetId, 'Campaign Analytics', campaignType, {
        calls_attempted:         callsAttempted,
        calls_answered:          callsAnswered,
        conversations_completed: conversationsCompleted,
        bookings,
        calendly_links_sent:     calendlyLinksSent,
        callbacks_requested:     callbacksRequested,
        opt_outs:                optOuts,
        answer_rate:             answerRate,
        booking_rate:            bookingRate,
        top_objection:           topObjection,
        recommended_change:      recommendedChange,
      });
    } else {
      // New campaign type row
      await appendToSheet(sheetId, 'Campaign Analytics', [
        campaignType,
        1,                                           // calls_attempted
        callData.answered ? 1 : 0,                  // calls_answered
        callData.durationSeconds > 30 ? 1 : 0,      // conversations_completed
        callData.booked ? 1 : 0,                    // bookings
        callData.calendlySent ? 1 : 0,              // calendly_links_sent
        callData.callbackNeeded ? 1 : 0,            // callbacks_requested
        callData.optOutDetected ? 1 : 0,            // opt_outs
        callData.answered ? '100%' : '0%',          // answer_rate
        callData.booked ? '100%' : '0%',            // booking_rate
        callData.objectionType ?? '',               // top_objection
        '',                                          // top_question
        'Insufficient data — need more calls',      // recommended_change
      ]);
    }

    console.log(`[campaignAnalytics] Updated Campaign Analytics: ${campaignType}`);
  } catch (err) {
    console.error('[campaignAnalytics] Error updating Campaign Analytics:', err);
  }
}

// ── Internal helpers ──────────────────────────────────────────────────────────

function getDayName(dayIndex: number): string {
  return ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][dayIndex];
}

function getHourBlock(hour: number): string {
  const start = hour;
  const end   = hour + 1;
  const fmt   = (h: number) => {
    const period = h >= 12 ? 'PM' : 'AM';
    const h12    = h % 12 || 12;
    return `${h12}${period}`;
  };
  return `${fmt(start)}–${fmt(end)}`;
}

function buildTimeRecommendation(answerRate: number, bookingRate: number): string {
  if (answerRate >= 50 && bookingRate >= 30) return '⭐ Best time — high answer and booking rate';
  if (answerRate >= 40 && bookingRate >= 20) return '✅ Good time slot';
  if (answerRate >= 30) return '⚠️ Average — consider testing other windows';
  if (answerRate < 15) return '❌ Poor time — avoid this slot';
  return 'Collecting data';
}

interface CampaignRecommendationInput {
  answerRate: number;
  bookingRate: number;
  optOutRate: number;
  campaignType: string;
}

function generateCampaignRecommendation(data: CampaignRecommendationInput): string {
  if (data.optOutRate > 5) {
    return 'High opt-out rate — review messaging and relationship type rules';
  }
  if (data.answerRate < 20) {
    return 'Low answer rate — test different time windows or call windows';
  }
  if (data.bookingRate < 10 && data.answerRate >= 30) {
    return 'Good answer rate but low bookings — review campaign opener and objection responses';
  }
  if (data.bookingRate >= 25) {
    return 'High performer — expand this campaign or increase call volume';
  }
  return 'Continue monitoring — need more data';
}

// Fix typo in variable name used above
const calendlyLinksSent = undefined; // placeholder — resolved in actual calculation above
