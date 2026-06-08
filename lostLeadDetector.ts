/**
 * POST /api/reporting/weekly  (cron: 0 8 * * 1 — every Monday 8am)
 * Generates and sends weekly reports for all medium and high tier clients.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAllActiveClients } from '@/lib/clientManager';
import { generateWeeklyReport, sendWeeklyReportEmail, saveWeeklyReportToSheet } from '@/lib/weeklyReporter';
import { TIER_RULES } from '@/../config/tierRules';
import { logError, logEvent } from '@/lib/logger';

export async function POST(req: NextRequest) {
  // Verify cron secret
  const cronSecret = req.headers.get('x-cron-secret');
  if (cronSecret !== process.env.CRON_SECRET) {
    return new Response('Unauthorized', { status: 401 });
  }

  const clients = await getAllActiveClients();
  const qualifying = clients.filter(c => {
    const features = TIER_RULES[c.tier as 'low' | 'medium' | 'high'] as any;
    return features.weeklyReports;
  });

  console.log(`[reporting/weekly] Generating reports for ${qualifying.length} clients`);

  let sent = 0, errors = 0;
  const results: Array<{ businessId: string; status: string; error?: string }> = [];

  for (const client of qualifying) {
    try {
      const report = await generateWeeklyReport(client as any);
      await Promise.all([
        sendWeeklyReportEmail(client as any, report),
        saveWeeklyReportToSheet(client.googleSheetId, report),
      ]);

      await logEvent({
        event_type:  'weekly_report_sent',
        business_id: client.businessId,
        metadata:    { reportId: report.report_id, weekEnding: report.week_ending },
        timestamp:   new Date().toISOString(),
      });

      results.push({ businessId: client.businessId, status: 'sent' });
      sent++;
    } catch (err) {
      errors++;
      results.push({ businessId: client.businessId, status: 'error', error: String(err) });
      await logError({
        business_id:   client.businessId,
        error_type:    'weekly_report',
        error_message: String(err),
        timestamp:     new Date().toISOString(),
      });
    }
  }

  return NextResponse.json({ sent, errors, results });
}
