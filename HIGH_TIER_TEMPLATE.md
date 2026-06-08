/**
 * callRecorder.ts — Medium / High Tier
 * Enables Twilio call recording. Writes recording metadata to Google Sheets.
 */

import twilio from 'twilio';
import { appendToSheet, readSheetTab } from './googleSheets';

export interface ClientConfig {
  businessId: string;
  googleSheetId: string;
  callRecording: boolean;
  tier: 'low' | 'medium' | 'high';
  twilioAccountSid?: string;
  twilioAuthToken?: string;
}

export interface RecordingData {
  recording_id: string;
  call_id: string;
  business_id: string;
  caller_name: string;
  caller_phone: string;
  call_date: string;
  call_time: string;
  recording_url: string;
  duration_seconds: number;
  service_requested: string;
  call_outcome: string;
  notes: string;
}

const MAX_RECORDING_POLL_ATTEMPTS = 20;
const RECORDING_POLL_INTERVAL_MS = 3000;

/**
 * Start recording a live call via Twilio Recordings API.
 * Returns the recording SID, or null if recording is not enabled for this client.
 */
export async function startRecording(
  callSid: string,
  config: ClientConfig
): Promise<string | null> {
  if (!config.callRecording) {
    console.log(`[callRecorder] Recording not enabled for ${config.businessId}`);
    return null;
  }

  const accountSid = config.twilioAccountSid || process.env.TWILIO_ACCOUNT_SID!;
  const authToken  = config.twilioAuthToken  || process.env.TWILIO_AUTH_TOKEN!;
  const client     = twilio(accountSid, authToken);

  try {
    const recording = await client
      .calls(callSid)
      .recordings
      .create({ recordingChannels: 'dual' }); // dual = separate tracks per speaker

    console.log(`[callRecorder] Started recording ${recording.sid} for call ${callSid}`);
    return recording.sid;
  } catch (err) {
    console.error(`[callRecorder] Failed to start recording for ${callSid}:`, err);
    return null;
  }
}

/**
 * Poll Twilio until a recording is ready and return its public URL.
 * Twilio recordings take a few seconds to process after the call ends.
 */
export async function getRecordingUrl(recordingSid: string): Promise<string> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID!;
  const authToken  = process.env.TWILIO_AUTH_TOKEN!;
  const client     = twilio(accountSid, authToken);

  for (let attempt = 0; attempt < MAX_RECORDING_POLL_ATTEMPTS; attempt++) {
    try {
      const recording = await client.recordings(recordingSid).fetch();

      if (recording.status === 'completed') {
        const url = `https://api.twilio.com${recording.uri.replace('.json', '.mp3')}`;
        console.log(`[callRecorder] Recording ready: ${url}`);
        return url;
      }

      if ((recording.status as string) === 'failed') {
        throw new Error(`Recording ${recordingSid} failed processing`);
      }

      // Still processing — wait and retry
      await sleep(RECORDING_POLL_INTERVAL_MS);
    } catch (err) {
      if (attempt === MAX_RECORDING_POLL_ATTEMPTS - 1) throw err;
      await sleep(RECORDING_POLL_INTERVAL_MS);
    }
  }

  throw new Error(`Recording ${recordingSid} did not complete within timeout`);
}

/**
 * Append a recording entry to the Recordings tab in the client's Google Sheet.
 * Columns: recording_id | call_id | business_id | caller_name | caller_phone |
 *          call_date | call_time | recording_url | duration_seconds |
 *          service_requested | call_outcome | notes
 */
export async function saveRecordingToSheet(
  sheetId: string,
  data: RecordingData
): Promise<void> {
  const row = [
    data.recording_id,
    data.call_id,
    data.business_id,
    data.caller_name,
    data.caller_phone,
    data.call_date,
    data.call_time,
    data.recording_url,
    data.duration_seconds,
    data.service_requested,
    data.call_outcome,
    data.notes,
  ];

  await appendToSheet(sheetId, 'Recordings', row);
  console.log(`[callRecorder] Saved recording ${data.recording_id} to sheet`);
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
