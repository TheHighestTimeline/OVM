/**
 * outboundEligibility.ts — High Tier Only
 * Validates an outbound lead against 15 compliance and safety checks
 * before any call is placed. No check can be skipped.
 */

import { readSheetTab } from './googleSheets';
import { parsePhoneNumber } from './utils';

export interface OutboundQueueRow {
  lead_id: string;
  lead_name: string;
  phone_number: string;
  email?: string;
  source?: string;
  campaign_type: string;
  service_interest?: string;
  call_reason?: string;
  desired_outcome: string;
  relationship_type: string;
  consent_status: string;
  consent_source?: string;
  last_interaction_date?: string;
  preferred_call_window?: string;
  call_window_start?: string;
  call_window_end?: string;
  attempt_count: number;
  max_attempts: number;
  status: string;
  priority?: string;
  opt_out: boolean;
  client_attestation: boolean;
  validation_status?: string;
  validation_notes?: string;
  notes?: string;
}

export interface ClientConfig {
  businessId: string;
  googleSheetId: string;
  tier: 'low' | 'medium' | 'high';
  outbound_enabled: boolean;
  outbound_mode: 'manual' | 'scheduled_every_30_minutes' | 'paused';
  outbound_call_window_start?: string;  // e.g. "08:00"
  outbound_call_window_end?: string;    // e.g. "20:00"
  outbound_timezone?: string;
  monthlyOutboundLimit?: number;
  outboundCallsUsedThisMonth?: number;
}

export interface EligibilityCheck {
  name: string;
  passed: boolean;
  reason?: string;
}

export interface EligibilityResult {
  eligible: boolean;
  failedChecks: string[];
  validationNotes: string;
}

// ── Allowed / Blocked lists ────────────────────────────────────────────────────

export const ALLOWED_RELATIONSHIP_TYPES = [
  'Missed Caller',
  'Inbound Lead',
  'Website Form Lead',
  'Text/Email Responded',
  'Quote Request',
  'Existing Customer',
  'Past Customer',
  'No-Show',
  'Appointment Holder',
  'Review Request',
  'Referral With Permission',
  'Manual Review Approved',
];

export const BLOCKED_RELATIONSHIP_TYPES = [
  'Scraped Lead',
  'Purchased List',
  'Unknown Source',
  'Random Prospect',
  'Cold List',
];

export const ALLOWED_CONSENT_STATUSES = [
  'Approved',
  'Prior Inquiry',
  'Existing Customer',
  'Appointment Related',
  'Quote Requested',
  'Manual Review Approved',
];

export const BLOCKED_CONSENT_STATUSES = [
  'Unknown',
  'Rejected',
  'Do Not Call',
  'No Consent',
];

export const ALLOWED_CAMPAIGN_TYPES = [
  'missed_call_recovery',
  'inbound_lead_followup',
  'quote_followup',
  'calendly_not_booked',
  'appointment_confirmation',
  'no_show_recovery',
  'review_request',
  'existing_customer_reactivation',
];

/**
 * Run all 15 eligibility checks against an outbound lead.
 * ALL checks must pass — no exceptions.
 */
export async function checkOutboundEligibility(
  lead: OutboundQueueRow,
  client: ClientConfig
): Promise<EligibilityResult> {
  const onDNC = await isOnDNCList(lead.phone_number, client.googleSheetId);
  const hasUsage = await hasOutboundUsageRemaining(client);

  const checks: EligibilityCheck[] = [
    {
      name:   'tier_is_high',
      passed: client.tier === 'high',
      reason: 'Outbound calling requires High Tier (Sales package)',
    },
    {
      name:   'outbound_enabled',
      passed: client.outbound_enabled === true,
      reason: 'Outbound is disabled for this client — enable in Master Backend Sheet',
    },
    {
      name:   'outbound_mode_active',
      passed: ['manual', 'scheduled_every_30_minutes'].includes(client.outbound_mode),
      reason: `Outbound mode is "${client.outbound_mode}" — must be "manual" or "scheduled_every_30_minutes"`,
    },
    {
      name:   'status_ready',
      passed: lead.status === 'Ready',
      reason: `Lead status is "${lead.status}" — must be "Ready"`,
    },
    {
      name:   'client_attestation',
      passed: lead.client_attestation === true,
      reason: 'Client attestation not confirmed — client must certify this is a permitted contact',
    },
    {
      name:   'not_opted_out',
      passed: !lead.opt_out,
      reason: 'Lead has opted out — do not call',
    },
    {
      name:   'consent_status_allowed',
      passed: ALLOWED_CONSENT_STATUSES.includes(lead.consent_status),
      reason: `Consent status "${lead.consent_status}" is not in the allowed list`,
    },
    {
      name:   'relationship_type_allowed',
      passed: ALLOWED_RELATIONSHIP_TYPES.includes(lead.relationship_type),
      reason: `Relationship type "${lead.relationship_type}" is not permitted`,
    },
    {
      name:   'phone_valid',
      passed: isValidPhone(lead.phone_number),
      reason: `Phone number "${lead.phone_number}" is invalid`,
    },
    {
      name:   'not_on_dnc',
      passed: !onDNC,
      reason: 'Phone number is on the Do Not Call list',
    },
    {
      name:   'within_call_window',
      passed: isWithinCallWindow(client),
      reason: `Current time is outside the permitted call window (${client.outbound_call_window_start}–${client.outbound_call_window_end} ${client.outbound_timezone})`,
    },
    {
      name:   'under_max_attempts',
      passed: lead.attempt_count < lead.max_attempts,
      reason: `Max attempts reached (${lead.attempt_count}/${lead.max_attempts})`,
    },
    {
      name:   'outbound_usage_remaining',
      passed: hasUsage,
      reason: 'Monthly outbound call limit reached — upgrade package or wait until next billing cycle',
    },
    {
      name:   'campaign_type_allowed',
      passed: ALLOWED_CAMPAIGN_TYPES.includes(lead.campaign_type),
      reason: `Campaign type "${lead.campaign_type}" is not in the allowed list`,
    },
    {
      name:   'desired_outcome_present',
      passed: !!(lead.desired_outcome?.trim()),
      reason: 'Desired outcome is blank — cannot call without a defined goal',
    },
  ];

  const failed       = checks.filter(c => !c.passed);
  const eligible     = failed.length === 0;
  const failedChecks = failed.map(c => c.name);
  const validationNotes = failed.map(c => `${c.name}: ${c.reason}`).join(' | ');

  if (!eligible) {
    console.log(`[outboundEligibility] BLOCKED lead ${lead.lead_id}: ${validationNotes}`);
  }

  return { eligible, failedChecks, validationNotes };
}

// ── Validation helpers ─────────────────────────────────────────────────────────

export function isValidPhone(phone: string): boolean {
  if (!phone) return false;
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 15;
}

async function isOnDNCList(phone: string, sheetId: string): Promise<boolean> {
  try {
    const rows = await readSheetTab(sheetId, 'Do Not Call / Opt-Outs');
    const digits = phone.replace(/\D/g, '');
    return (rows ?? []).slice(1).some(row => {
      const rowDigits = (row[1] ?? '').replace(/\D/g, '');
      return rowDigits === digits;
    });
  } catch {
    return false; // If tab doesn't exist, allow call (safer than blocking all)
  }
}

function isWithinCallWindow(client: ClientConfig): boolean {
  const tz    = client.outbound_timezone || 'America/Chicago';
  const start = client.outbound_call_window_start || '08:00';
  const end   = client.outbound_call_window_end   || '20:00';

  try {
    const now  = new Date().toLocaleTimeString('en-US', { timeZone: tz, hour12: false, hour: '2-digit', minute: '2-digit' });
    return now >= start && now <= end;
  } catch {
    // Default: allow calls 8am–8pm local server time
    const h = new Date().getHours();
    return h >= 8 && h < 20;
  }
}

async function hasOutboundUsageRemaining(client: ClientConfig): Promise<boolean> {
  const limit = client.monthlyOutboundLimit ?? 100;
  const used  = client.outboundCallsUsedThisMonth ?? 0;
  return used < limit;
}
