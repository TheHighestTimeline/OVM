/**
 * dynamicIntake.ts — Medium / High Tier
 * Loads service-specific intake questions from the client workbook.
 * Falls back to built-in templates when no custom rules exist.
 */

import { readSheetTab } from './googleSheets';

export interface IntakeQuestion {
  question: string;
  required: boolean;
  fieldKey: string;   // maps to output JSON field (e.g., "urgency", "address")
}

export interface DynamicIntakeRule {
  service_name: string;
  trigger_keywords: string[];   // comma-separated keywords from sheet
  required_questions: string[];
  optional_questions: string[];
}

// ── Built-in service question templates ────────────────────────────────────────
// Used when client workbook has no custom Dynamic Intake Rules for a service.
const BUILTIN_SERVICE_QUESTIONS: Record<string, IntakeQuestion[]> = {
  roofing: [
    { question: 'Is this about a leak or a general estimate?',          required: true,  fieldKey: 'serviceDetail' },
    { question: 'Is water actively coming in right now?',              required: true,  fieldKey: 'urgencyDetail' },
    { question: 'Is this a residential or commercial property?',       required: true,  fieldKey: 'propertyType' },
    { question: "What's the property address?",                        required: true,  fieldKey: 'address' },
  ],
  medspa: [
    { question: 'Which treatment are you interested in?',              required: true,  fieldKey: 'serviceDetail' },
    { question: 'Is this your first time receiving this service?',     required: true,  fieldKey: 'isFirstTime' },
    { question: 'Are you looking for a consultation or a full appointment?', required: true, fieldKey: 'appointmentType' },
  ],
  dental: [
    { question: 'Are you a new or existing patient?',                  required: true,  fieldKey: 'patientStatus' },
    { question: 'What type of appointment do you need?',               required: true,  fieldKey: 'appointmentType' },
    { question: 'Are you experiencing any pain — is this urgent?',     required: true,  fieldKey: 'urgencyDetail' },
  ],
  hvac: [
    { question: 'Is this a repair or a new installation?',             required: true,  fieldKey: 'serviceDetail' },
    { question: 'Is your system currently not working?',              required: true,  fieldKey: 'urgencyDetail' },
    { question: 'Is this for a home or a commercial space?',           required: true,  fieldKey: 'propertyType' },
  ],
  salon: [
    { question: 'What service are you looking for today?',             required: true,  fieldKey: 'serviceDetail' },
    { question: 'Do you have a preferred stylist?',                    required: false, fieldKey: 'staffPreference' },
    { question: 'Would you like a morning or afternoon appointment?',  required: false, fieldKey: 'timePreference' },
  ],
  plumbing: [
    { question: 'Is there active water damage or flooding happening right now?', required: true, fieldKey: 'urgencyDetail' },
    { question: 'Is this a repair, inspection, or new installation?',  required: true,  fieldKey: 'serviceDetail' },
    { question: "What's the property address?",                        required: true,  fieldKey: 'address' },
  ],
  legal: [
    { question: 'What type of legal matter are you calling about?',    required: true,  fieldKey: 'serviceDetail' },
    { question: 'Is this matter time-sensitive?',                      required: true,  fieldKey: 'urgencyDetail' },
    { question: 'Have you worked with our firm before?',               required: true,  fieldKey: 'isNewCustomer' },
  ],
  realestate: [
    { question: 'Are you looking to buy, sell, or rent?',              required: true,  fieldKey: 'serviceDetail' },
    { question: 'Do you have a specific area or neighborhood in mind?', required: false, fieldKey: 'location' },
    { question: 'What is your target timeline?',                       required: false, fieldKey: 'timeline' },
  ],
};

// ── Default questions when no service match at all ─────────────────────────────
const DEFAULT_QUESTIONS: IntakeQuestion[] = [
  { question: 'What service are you interested in?',                    required: true,  fieldKey: 'serviceRequested' },
  { question: 'Is this urgent or can we schedule at your convenience?', required: true,  fieldKey: 'urgency' },
  { question: 'What day and time works best for you?',                  required: false, fieldKey: 'preferredTime' },
  { question: "What's the best number to reach you?",                   required: true,  fieldKey: 'callerPhone' },
];

/**
 * Load service-specific intake questions.
 * Priority: client workbook custom rules > built-in templates > defaults.
 *
 * @param serviceRequested - The service name identified on the call
 * @param sheetId          - Google Sheet ID of the client workbook
 * @returns Array of IntakeQuestion objects to ask
 */
export async function loadIntakeQuestions(
  serviceRequested: string,
  sheetId: string
): Promise<IntakeQuestion[]> {
  // 1. Try to load custom rules from client workbook
  try {
    const rows = await readSheetTab(sheetId, 'Dynamic Intake Rules');
    const customRules = parseIntakeRulesFromSheet(rows);
    const matched = findMatchingRule(customRules, serviceRequested);

    if (matched) {
      console.log(`[dynamicIntake] Found custom rule for service: "${serviceRequested}"`);
      return [
        ...matched.required_questions.map(q => ({ question: q, required: true, fieldKey: inferFieldKey(q) })),
        ...matched.optional_questions.map(q => ({ question: q, required: false, fieldKey: inferFieldKey(q) })),
      ];
    }
  } catch (err) {
    console.warn('[dynamicIntake] Could not load custom rules, falling back to built-in:', err);
  }

  // 2. Try built-in templates
  const builtIn = findBuiltinQuestions(serviceRequested);
  if (builtIn) {
    console.log(`[dynamicIntake] Using built-in questions for: "${serviceRequested}"`);
    return builtIn;
  }

  // 3. Fall back to defaults
  console.log('[dynamicIntake] No match found — using default intake questions');
  return DEFAULT_QUESTIONS;
}

/**
 * Format loaded questions into a string for injection into the agent prompt.
 */
export function buildDynamicQuestionsPrompt(questions: IntakeQuestion[]): string {
  return questions
    .map((q, i) => `  ${i + 1}. ${q.required ? '[REQUIRED]' : '[OPTIONAL]'} ${q.question}`)
    .join('\n');
}

// ── Internal helpers ──────────────────────────────────────────────────────────

function parseIntakeRulesFromSheet(rows: string[][]): DynamicIntakeRule[] {
  if (!rows || rows.length < 2) return [];
  // Expected columns: service_name | trigger_keywords | required_questions | optional_questions
  return rows.slice(1).map(row => ({
    service_name:       row[0] ?? '',
    trigger_keywords:   (row[1] ?? '').split(',').map(k => k.trim().toLowerCase()),
    required_questions: (row[2] ?? '').split('|').map(q => q.trim()).filter(Boolean),
    optional_questions: (row[3] ?? '').split('|').map(q => q.trim()).filter(Boolean),
  }));
}

function findMatchingRule(rules: DynamicIntakeRule[], service: string): DynamicIntakeRule | null {
  const normalizedService = service.toLowerCase();
  for (const rule of rules) {
    const nameMatch = normalizedService.includes(rule.service_name.toLowerCase());
    const keywordMatch = rule.trigger_keywords.some(k => k && normalizedService.includes(k));
    if (nameMatch || keywordMatch) return rule;
  }
  return null;
}

function findBuiltinQuestions(service: string): IntakeQuestion[] | null {
  const normalized = service.toLowerCase();
  for (const [key, questions] of Object.entries(BUILTIN_SERVICE_QUESTIONS)) {
    if (normalized.includes(key)) return questions;
  }
  return null;
}

function inferFieldKey(question: string): string {
  const q = question.toLowerCase();
  if (q.includes('address')) return 'address';
  if (q.includes('urgent') || q.includes('active') || q.includes('emergency')) return 'urgencyDetail';
  if (q.includes('treatment') || q.includes('service') || q.includes('repair') || q.includes('install')) return 'serviceDetail';
  if (q.includes('commercial') || q.includes('residential') || q.includes('home')) return 'propertyType';
  if (q.includes('stylist') || q.includes('preferred')) return 'staffPreference';
  if (q.includes('morning') || q.includes('afternoon') || q.includes('time')) return 'timePreference';
  if (q.includes('first time') || q.includes('new patient')) return 'isFirstTime';
  if (q.includes('consultation') || q.includes('appointment type')) return 'appointmentType';
  return 'notes';
}
