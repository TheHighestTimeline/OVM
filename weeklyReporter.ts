/**
 * POST /api/voice/stream
 * Main WebSocket handler for all AI voice calls (inbound + outbound, all tiers).
 * Connects Twilio Media Streams to OpenAI Realtime API.
 */

import { NextRequest } from 'next/server';
import WebSocket from 'ws';
import OpenAI from 'openai';
import { getClientByPhone, getClientById } from '@/lib/clientManager';
import { TIER_RULES } from '@/../config/tierRules';
import { loadIntakeQuestions, buildDynamicQuestionsPrompt } from '@/lib/dynamicIntake';
import { startRecording } from '@/lib/callRecorder';
import { logError, logEvent } from '@/lib/logger';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';

// ── Agent prompt loader ───────────────────────────────────────────────────────

function loadAgentPrompt(tier: string): string {
  const fileName =
    tier === 'high'   ? 'high-tier-agent.txt'   :
    tier === 'medium' ? 'medium-tier-agent.txt'  :
                        'low-tier-agent.txt';

  const filePath = path.join(process.cwd(), 'agents', fileName);
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch (err) {
    console.error(`[stream] Could not load agent prompt for tier=${tier}:`, err);
    return 'You are a helpful AI receptionist. Greet the caller and take a message.';
  }
}

function injectClientVariables(prompt: string, client: any, direction: string): string {
  return prompt
    .replace(/\[BUSINESS_NAME\]/g,    client.businessName || 'this business')
    .replace(/\[AGENT_NAME\]/g,       client.agentName || 'Alex')
    .replace(/\[BUSINESS_HOURS\]/g,   `${client.businessHoursStart}–${client.businessHoursEnd}`)
    .replace(/\[NEXT_OPEN_DAY\]/g,    'tomorrow')
    .replace(/\[CALLBACK_TIMEFRAME\]/g, '1–2 business hours')
    .replace(/\[CALL_DIRECTION\]/g,   direction);
}

// ── Main handler ──────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const url        = new URL(req.url);
  const direction  = url.searchParams.get('direction') || 'inbound';
  const businessId = url.searchParams.get('businessId');
  const toNumber   = url.searchParams.get('to') || '';

  // Resolve client config
  let client: any = null;
  try {
    client = businessId
      ? await getClientById(businessId)
      : await getClientByPhone(toNumber);
  } catch (err) {
    console.error('[stream] Failed to load client config:', err);
  }

  if (!client) {
    console.warn('[stream] No client found — using default low-tier config');
    client = { tier: 'low', businessName: 'the business', agentName: 'Alex', businessId: 'unknown' };
  }

  const tier: 'low' | 'medium' | 'high' = client.tier;
  const features = TIER_RULES[tier] as any;

  // Build system prompt
  let systemPrompt = loadAgentPrompt(tier);
  systemPrompt = injectClientVariables(systemPrompt, client, direction);

  // Medium/High: inject dynamic intake questions
  if (features.dynamicIntake) {
    try {
      const serviceHint = url.searchParams.get('service') || '';
      const questions   = await loadIntakeQuestions(serviceHint, client.googleSheetId);
      const qBlock      = buildDynamicQuestionsPrompt(questions);
      systemPrompt = systemPrompt.replace('[DYNAMIC_QUESTIONS_PLACEHOLDER]', qBlock);
    } catch (err) {
      console.warn('[stream] Could not load dynamic intake:', err);
      systemPrompt = systemPrompt.replace('[DYNAMIC_QUESTIONS_PLACEHOLDER]', 'Use standard intake questions.');
    }
  }

  // High tier: inject pre-encoded outbound prompt if provided
  if (tier === 'high' && direction === 'outbound') {
    const encodedPrompt = url.searchParams.get('prompt');
    if (encodedPrompt) {
      systemPrompt = decodeURIComponent(encodedPrompt);
    }
  }

  // Connect to Twilio Media Stream and OpenAI Realtime
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  // Return TwiML to connect media stream
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Connect>
    <Stream url="wss://${url.host}/api/voice/stream/ws?businessId=${client.businessId}&amp;direction=${direction}&amp;tier=${tier}" />
  </Connect>
</Response>`;

  return new Response(twiml, {
    status: 200,
    headers: { 'Content-Type': 'text/xml' },
  });
}

// ── WebSocket handler (ws upgrade) ────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const url        = new URL(req.url);
  const businessId = url.searchParams.get('businessId') || '';
  const direction  = url.searchParams.get('direction') || 'inbound';
  const tier       = (url.searchParams.get('tier') || 'low') as 'low' | 'medium' | 'high';

  // This endpoint is upgraded to WebSocket by the Next.js server
  // The actual WS handling is done via a custom server.js / middleware
  // See /src/server.ts for the WebSocket upgrade logic

  const client = await getClientById(businessId).catch(() => null);
  if (!client) return new Response('Client not found', { status: 404 });

  const features = TIER_RULES[tier] as any;
  let systemPrompt = loadAgentPrompt(tier);
  systemPrompt = injectClientVariables(systemPrompt, client, direction);

  // ── OpenAI Realtime session ────────────────────────────────────────────────
  const openaiWs = new WebSocket(
    'wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview',
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'OpenAI-Beta': 'realtime=v1',
      },
    }
  );

  openaiWs.on('open', () => {
    // Send session config
    openaiWs.send(JSON.stringify({
      type: 'session.update',
      session: {
        turn_detection: { type: 'server_vad' },
        input_audio_format:  'g711_ulaw',
        output_audio_format: 'g711_ulaw',
        voice: 'alloy',
        instructions: systemPrompt,
        modalities: ['text', 'audio'],
        temperature: 0.7,
      },
    }));

    // Send initial greeting
    openaiWs.send(JSON.stringify({
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'user',
        content: [{
          type: 'input_text',
          text: direction === 'outbound'
            ? 'The call has connected. Begin the outbound call following your instructions.'
            : 'The call has connected. Greet the caller warmly.',
        }],
      },
    }));

    openaiWs.send(JSON.stringify({ type: 'response.create' }));
  });

  // ── Post-call processing ───────────────────────────────────────────────────

  let fullTranscript = '';
  let callOutputJson: Record<string, unknown> = {};

  openaiWs.on('message', (data: WebSocket.RawData) => {
    try {
      const msg = JSON.parse(data.toString());

      if (msg.type === 'conversation.item.created' && msg.item?.content) {
        for (const c of msg.item.content) {
          if (c.type === 'text') fullTranscript += `\n${msg.item.role}: ${c.text}`;
          // Detect JSON output at end of call
          if (c.type === 'text' && c.text?.trim().startsWith('{')) {
            try { callOutputJson = JSON.parse(c.text); } catch { /* not JSON */ }
          }
        }
      }

      if (msg.type === 'session.ended') {
        handleCallEnd({
          client, tier, features, direction,
          transcript: fullTranscript,
          callOutput: callOutputJson,
        }).catch(err => console.error('[stream] Post-call error:', err));
      }
    } catch { /* ignore parse errors */ }
  });

  return new Response('WebSocket handler active', { status: 200 });
}

// ── Post-call handler ─────────────────────────────────────────────────────────

async function handleCallEnd(ctx: {
  client: any;
  tier: 'low' | 'medium' | 'high';
  features: any;
  direction: string;
  transcript: string;
  callOutput: Record<string, unknown>;
}): Promise<void> {
  const { client, tier, features, direction, transcript, callOutput } = ctx;

  // Start recording if enabled (medium/high)
  if (features.callRecording && callOutput.callId) {
    startRecording(String(callOutput.callId), client).catch(() => {});
  }

  // Log to client sheet via /api/leads/log
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  await fetch(`${baseUrl}/api/leads/log`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      businessId: client.businessId,
      tier,
      direction,
      transcript,
      ...callOutput,
    }),
  }).catch(err => console.error('[stream] Failed to log lead:', err));

  await logEvent({
    event_type:  direction === 'outbound' ? 'outbound_call_completed' : 'inbound_call_completed',
    business_id: client.businessId,
    metadata:    { tier, outcome: callOutput.callOutcome ?? callOutput.outcome },
    timestamp:   new Date().toISOString(),
  });
}
