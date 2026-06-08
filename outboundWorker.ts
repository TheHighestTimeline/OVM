/**
 * POST /api/sms/reminder  (cron: 0 * * * * — every hour)
 * Sends appointment reminder SMS messages via Twilio.
 */

import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';
import { getAllActiveClients } from '@/lib/clientManager';
import { readSheetTab, updateSheetRow } from '@/lib/googleSheets';
import { logError, logEvent } from '@/lib/logger';

const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export async function POST(req: NextRequest) {
  const cronSecret = req.headers.get('x-cron-secret');
  if (cronSecret !== process.env.CRON_SECRET) {
    return new Response('Unauthorized', { status: 401 });
  }

  const clients = await getAllActiveClients();
  let sent = 0, errors = 0;

  for (const client of clients) {
    try {
      const appointments = await getDueReminders(client.googleSheetId);
      for (const appt of appointments) {
        await sendReminderSMS(client, appt);
        sent++;
      }
    } catch (err) {
      errors++;
      await logError({ business_id: client.businessId, error_type: 'sms_reminder', error_message: String(err), timestamp: new Date().toISOString() });
    }
  }

  return NextResponse.json({ sent, errors });
}

async function getDueReminders(sheetId: string): Promise<any[]> {
  try {
    const rows  = await readSheetTab(sheetId, 'Appointments');
    const now   = new Date();
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    return rows.slice(1)
      .filter(row => {
        if (row[6] !== 'Confirmed' && row[6] !== 'Pending Confirmation') return false;
        if (row[8] === 'TRUE') return false; // already reminded
        const apptDate = new Date(`${row[4]}T${row[5] || '09:00'}`);
        return apptDate > now && apptDate <= in24h;
      })
      .map(row => ({
        appointmentId: row[0],
        name:          row[1],
        phone:         row[2],
        service:       row[3],
        date:          row[4],
        time:          row[5],
        language:      row[9] || 'en',
        rowKey:        row[0],
      }));
  } catch { return []; }
}

async function sendReminderSMS(client: any, appt: any): Promise<void> {
  const message = appt.language === 'es'
    ? `Hola ${appt.name}, le recordamos su cita en ${client.businessName} mañana a las ${appt.time}. Responda C para confirmar o L para cancelar.`
    : `Hi ${appt.name}, reminder: your appointment at ${client.businessName} is tomorrow at ${appt.time}. Reply C to confirm or X to cancel.`;

  await twilioClient.messages.create({
    body: message,
    from: client.twilioPhoneNumber || process.env.TWILIO_PHONE_NUMBER!,
    to:   appt.phone,
  });

  await updateSheetRow(client.googleSheetId, 'Appointments', appt.rowKey, { reminder_sent: 'TRUE' });

  await logEvent({ event_type: 'reminder_sms_sent', business_id: client.businessId,
    metadata: { appointmentId: appt.appointmentId }, timestamp: new Date().toISOString() });
}
