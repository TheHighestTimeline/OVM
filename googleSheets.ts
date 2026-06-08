/**
 * POST /api/reporting/monthly  (cron: 0 8 1 * * — 1st of each month 8am)
 * Generates monthly optimization reports for all medium and high tier clients.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAllActiveClients } from '@/lib/clientManager';
import { generateMonthlyReport, saveMonthlyReportToSheet } from '@/lib/monthlyReporter';
import { sendEmail } from '@/lib/emailSender';
import { TIER_RULES } from '@/../config/tierRules';
import { logError, logEvent } from '@/lib/logger';

export async function POST(req: NextRequest) {
  const cronSecret = req.headers.get('x-cron-secret');
  if (cronSecret !== process.env.CRON_SECRET) {
    return new Response('Unauthorized', { status: 401 });
  }

  const clients = await getAllActiveClients();
  const qualifying = clients.filter(c => {
    const features = TIER_RULES[c.tier as 'low' | 'medium' | 'high'] as any;
    return features.monthlyOptimizationReports;
  });

  console.log(`[reporting/monthly] Generating reports for ${qualifying.length} clients`);

  let saved = 0, errors = 0;

  for (const client of qualifying) {
    try {
      const report = await generateMonthlyReport(client as any);
      await saveMonthlyReportToSheet(client.googleSheetId, report);

      // Send summary email to owner
      await sendEmail({
        to:      client.ownerEmail,
        subject: `📈 Monthly Optimization Report — ${client.businessName} (${report.month})`,
        html: `
<html><body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
<h2>📈 Monthly Optimization Report</h2>
<p><strong>${client.businessName}</strong> · ${report.month}</p>
<table style="width:100%;border-collapse:collapse">
  <tr><td style="padding:8px;border:1px solid #ddd"><strong>Total Calls</strong></td><td style="padding:8px;border:1px solid #ddd">${report.total_calls}</td></tr>
  <tr><td style="padding:8px;border:1px solid #ddd"><strong>Total Leads</strong></td><td style="padding:8px;border:1px solid #ddd">${report.total_leads}</td></tr>
  <tr><td style="padding:8px;border:1px solid #ddd"><strong>Avg Lead Score</strong></td><td style="padding:8px;border:1px solid #ddd">${report.average_lead_score}/100</td></tr>
  <tr><td style="padding:8px;border:1px solid #ddd"><strong>Avg Quality Score</strong></td><td style="padding:8px;border:1px solid #ddd">${report.average_quality_score}/100</td></tr>
  <tr><td style="padding:8px;border:1px solid #ddd"><strong>Top Services</strong></td><td style="padding:8px;border:1px solid #ddd">${report.top_services_requested}</td></tr>
</table>
<h3>Recommendations</h3>
<p><strong>FAQ Updates:</strong> ${report.recommended_faq_updates}</p>
<p><strong>Script Updates:</strong> ${report.recommended_script_updates}</p>
<p><strong>Calendly Updates:</strong> ${report.recommended_calendly_updates}</p>
<p><em>${report.notes}</em></p>
<p>Full details saved to your Monthly Optimization Reports tab.</p>
<p><a href="https://docs.google.com/spreadsheets/d/${client.googleSheetId}" style="background:#3a5bd9;color:white;padding:10px 20px;text-decoration:none;border-radius:4px;display:inline-block;margin-top:16px">Open Sheet</a></p>
</body></html>`,
      });

      await logEvent({
        event_type:  'monthly_report_generated',
        business_id: client.businessId,
        metadata:    { reportId: report.report_id, month: report.month },
        timestamp:   new Date().toISOString(),
      });

      saved++;
    } catch (err) {
      errors++;
      await logError({
        business_id:   client.businessId,
        error_type:    'monthly_report',
        error_message: String(err),
        timestamp:     new Date().toISOString(),
      });
    }
  }

  return NextResponse.json({ saved, errors });
}
