/**
 * monthlyReporter.ts — Medium / High Tier
 * Generates monthly optimization reports for each qualifying client.
 */

import { readSheetTab, appendToSheet } from './googleSheets';
import OpenAI from 'openai';
import { average, topN, generateId } from './utils';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface ClientConfig {
  businessId: string;
  businessName: string;
  ownerEmail: string;
  googleSheetId: string;
  tier: 'low' | 'medium' | 'high';
  monthlyOptimizationReports: boolean;
}

export interface MonthlyReport {
  report_id: string;
  month: string;                    // e.g. "2026-04"
  business_id: string;
  total_calls: number;
  total_leads: number;
  average_lead_score: number;
  average_quality_score: number;
  top_services_requested: string;
  common_questions: string;
  common_failure_points: string;
  recommended_faq_updates: string;
  recommended_script_updates: string;
  recommended_calendly_updates: string;
  notes: string;
}

/**
 * Generate a full monthly optimization report for a client.
 * Uses GPT-4o-mini to produce actionable recommendations.
 */
export async function generateMonthlyReport(client: ClientConfig): Promise<MonthlyReport> {
  const month     = getPreviousMonth();
  const calls     = await getMonthCalls(client.googleSheetId, month);
  const qualScores = await getMonthQualityScores(client.googleSheetId);
  const lostLeads = await getMonthLostLeads(client.googleSheetId);

  const totalCalls        = calls.length;
  const totalLeads        = calls.filter(c => c[8] !== 'Spam / Vendor' && c[8] !== 'Wrong Number').length;
  const avgLeadScore      = average(calls.map(c => parseInt(c[9] ?? '0', 10)));
  const avgQualityScore   = average(qualScores.map(s => parseInt(s[16] ?? '0', 10)));
  const topServices       = topN(calls.map(c => c[4]).filter(Boolean), 5);
  const failurePoints     = analyzeFailurePoints(calls, lostLeads);

  // Use AI to generate optimization recommendations
  const recommendations = await generateAIRecommendations({
    totalCalls, totalLeads, avgLeadScore, avgQualityScore,
    topServices, failurePoints, month, businessName: client.businessName,
  });

  return {
    report_id:                    generateId('MR'),
    month,
    business_id:                  client.businessId,
    total_calls:                  totalCalls,
    total_leads:                  totalLeads,
    average_lead_score:           Math.round(avgLeadScore * 10) / 10,
    average_quality_score:        Math.round(avgQualityScore * 10) / 10,
    top_services_requested:       topServices.join(', '),
    common_questions:             recommendations.commonQuestions,
    common_failure_points:        failurePoints.join('; '),
    recommended_faq_updates:      recommendations.faqUpdates,
    recommended_script_updates:   recommendations.scriptUpdates,
    recommended_calendly_updates: recommendations.calendlyUpdates,
    notes:                        recommendations.notes,
  };
}

/**
 * Write monthly report to the Monthly Optimization Reports tab.
 * Columns: report_id | month | business_id | total_calls | total_leads |
 *          average_lead_score | average_quality_score | top_services_requested |
 *          common_questions | common_failure_points | recommended_faq_updates |
 *          recommended_script_updates | recommended_calendly_updates | notes
 */
export async function saveMonthlyReportToSheet(
  sheetId: string,
  report: MonthlyReport
): Promise<void> {
  const row = [
    report.report_id,
    report.month,
    report.business_id,
    report.total_calls,
    report.total_leads,
    report.average_lead_score,
    report.average_quality_score,
    report.top_services_requested,
    report.common_questions,
    report.common_failure_points,
    report.recommended_faq_updates,
    report.recommended_script_updates,
    report.recommended_calendly_updates,
    report.notes,
  ];

  await appendToSheet(sheetId, 'Monthly Optimization Reports', row);
  console.log(`[monthlyReporter] Saved monthly report ${report.report_id} for ${report.month}`);
}

// ── Internal helpers ──────────────────────────────────────────────────────────

async function getMonthCalls(sheetId: string, month: string): Promise<string[][]> {
  const rows = await readSheetTab(sheetId, 'Call Log');
  return (rows ?? []).slice(1).filter(row => {
    const d = new Date(row[3]);
    if (isNaN(d.getTime())) return false;
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` === month;
  });
}

async function getMonthQualityScores(sheetId: string): Promise<string[][]> {
  try {
    return ((await readSheetTab(sheetId, 'AI Quality Scores')) ?? []).slice(1);
  } catch { return []; }
}

async function getMonthLostLeads(sheetId: string): Promise<string[][]> {
  try {
    return ((await readSheetTab(sheetId, 'Lost Lead Alerts')) ?? []).slice(1);
  } catch { return []; }
}

function analyzeFailurePoints(calls: string[][], lostLeads: string[][]): string[] {
  const points: string[] = [];

  const incompleteRate = calls.filter(c => c[8] === 'Incomplete Call').length / Math.max(calls.length, 1);
  if (incompleteRate > 0.10) points.push(`High incomplete call rate (${(incompleteRate * 100).toFixed(0)}%)`);

  const lostRate = lostLeads.length / Math.max(calls.length, 1);
  if (lostRate > 0.12) points.push(`Elevated lost lead rate (${(lostRate * 100).toFixed(0)}%)`);

  const calendlyRate = calls.filter(c => c[12] === 'TRUE').length / Math.max(calls.length, 1);
  if (calendlyRate < 0.20) points.push('Low Calendly offer/acceptance rate');

  return points.length > 0 ? points : ['No significant failure points detected'];
}

interface AIRecommendationInput {
  totalCalls: number;
  totalLeads: number;
  avgLeadScore: number;
  avgQualityScore: number;
  topServices: string[];
  failurePoints: string[];
  month: string;
  businessName: string;
}

interface AIRecommendations {
  commonQuestions: string;
  faqUpdates: string;
  scriptUpdates: string;
  calendlyUpdates: string;
  notes: string;
}

async function generateAIRecommendations(data: AIRecommendationInput): Promise<AIRecommendations> {
  const prompt = `
You are analyzing AI receptionist performance for ${data.businessName} for month ${data.month}.

DATA:
- Total calls: ${data.totalCalls}
- Total leads: ${data.totalLeads}  
- Avg lead score: ${data.avgLeadScore.toFixed(1)}/100
- Avg quality score: ${data.avgQualityScore.toFixed(1)}/100
- Top services: ${data.topServices.join(', ')}
- Failure points: ${data.failurePoints.join('; ')}

Provide JSON with these fields:
{
  "commonQuestions": "Top 3 questions callers asked this month (inferred from service types)",
  "faqUpdates": "Specific FAQ additions or updates recommended",
  "scriptUpdates": "Specific AI script improvements recommended",
  "calendlyUpdates": "Specific Calendly link or service-specific link recommendations",
  "notes": "1-2 sentence executive summary"
}

Be specific and actionable. No generic advice.
`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a business optimization analyst. Return only valid JSON.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    return JSON.parse(response.choices[0]?.message?.content ?? '{}');
  } catch {
    return {
      commonQuestions: 'Unable to generate — check API key',
      faqUpdates: 'Review call transcripts manually',
      scriptUpdates: 'Review quality scores for lowest-performing calls',
      calendlyUpdates: 'Ensure service-specific links are configured',
      notes: `Month ${data.month}: ${data.totalCalls} calls, ${data.totalLeads} leads, avg score ${data.avgLeadScore.toFixed(0)}.`,
    };
  }
}

function getPreviousMonth(): string {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}
