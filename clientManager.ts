/**
 * POST /api/outbound/worker
 * Triggers the outbound call worker — runs via cron every 30 minutes,
 * or manually via POST with ?manual=true.
 */

import { NextRequest, NextResponse } from 'next/server';
import { runOutboundWorker } from '@/lib/outboundWorker';
import { logError } from '@/lib/logger';

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const isManual = searchParams.get('manual') === 'true';

  // Verify cron trigger via secret header (skip check for manual runs from authenticated context)
  if (!isManual) {
    const cronSecret = req.headers.get('x-cron-secret');
    if (cronSecret !== process.env.CRON_SECRET) {
      return new Response('Unauthorized', { status: 401 });
    }
  } else {
    // Manual triggers require basic auth or internal header
    const internalKey = req.headers.get('x-internal-key');
    if (internalKey !== process.env.CRON_SECRET) {
      return new Response('Unauthorized — include x-internal-key header', { status: 401 });
    }
  }

  console.log(`[outbound/worker] Triggered — manual: ${isManual}`);

  try {
    const result = await runOutboundWorker();
    return NextResponse.json({
      status:    'completed',
      manual:    isManual,
      processed: result.processed,
      skipped:   result.skipped,
      errors:    result.errors,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    await logError({
      business_id:   'system',
      error_type:    'outbound_worker_crash',
      error_message: String(err),
      timestamp:     new Date().toISOString(),
    });
    return NextResponse.json(
      { status: 'error', message: String(err) },
      { status: 500 }
    );
  }
}

// Allow GET to check if worker is reachable (health check)
export async function GET(req: NextRequest) {
  const cronSecret = req.headers.get('x-cron-secret');
  if (cronSecret !== process.env.CRON_SECRET) {
    return new Response('Unauthorized', { status: 401 });
  }
  return NextResponse.json({ status: 'ok', message: 'Outbound worker is reachable' });
}
