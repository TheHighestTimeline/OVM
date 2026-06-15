// scheduled-reminders — Netlify scheduled function (every 5 min)
// Finds posts due within 10 minutes, fires Zapier webhook → SMS to manager.
// Netlify.toml: schedule = "*/5 * * * *"
import { airtableList, airtableUpdate, POSTS_MAP } from './_airtable.js';

const ZAPIER_WEBHOOK = process.env.ZAPIER_WEBHOOK_URL;

export const handler = async () => {
  if (!ZAPIER_WEBHOOK) {
    console.warn('[reminders] ZAPIER_WEBHOOK_URL not set — skipping');
    return { statusCode: 200, body: 'no webhook configured' };
  }

  const now  = new Date();
  const soon = new Date(now.getTime() + 10 * 60 * 1000); // 10-min window

  try {
    // Airtable formula: approved/scheduled posts, no reminder sent, due within window
    // We filter by status and reminder_sent in Airtable, then check the date in JS
    const formula = `AND(
      OR({Status} = 'client_approved', {Status} = 'scheduled'),
      {Reminder Sent} = FALSE(),
      {Scheduled At} != ''
    )`;

    const records = await airtableList('Posts', {
      filterByFormula: formula,
      fields: ['Status','Caption','Platform','Type','Scheduled At','Client ID','Approval Token','Reminder Sent'],
    });

    // Filter to only posts due within the next 10 minutes
    const due = records.filter(r => {
      const t = r.fields?.['Scheduled At'];
      if (!t) return false;
      const d = new Date(t);
      return d >= now && d <= soon;
    });

    if (!due.length) {
      console.log('[reminders] nothing due');
      return { statusCode: 200, body: 'ok' };
    }

    const results = [];

    for (const record of due) {
      const f           = record.fields;
      const scheduledAt = new Date(f['Scheduled At']);
      const minutesAway = Math.round((scheduledAt - now) / 60000);
      const scheduledStr = scheduledAt.toLocaleTimeString('en-US', {
        hour: 'numeric', minute: '2-digit', timeZone: 'America/New_York',
      });

      try {
        const zapRes = await fetch(ZAPIER_WEBHOOK, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            post_id:       record.id,
            platform:      f['Platform'],
            type:          f['Type'],
            caption:       (f['Caption'] || '').slice(0, 100),
            scheduled_at:  f['Scheduled At'],
            scheduled_str: scheduledStr,
            minutes_away:  minutesAway,
            message:       `⏰ Reminder: ${(f['Platform'] || '').toUpperCase()} ${f['Type'] || 'post'} is due in ${minutesAway} min (${scheduledStr}). Time to post!`,
          }),
        });

        if (!zapRes.ok) throw new Error(`Zapier HTTP ${zapRes.status}`);

        // Mark reminder sent so it doesn't fire again
        await airtableUpdate('Posts', record.id, { [POSTS_MAP.reminderSent]: true });
        results.push({ id: record.id, ok: true });
      } catch (e) {
        console.error(`[reminders] post ${record.id} failed:`, e.message);
        results.push({ id: record.id, error: e.message });
      }
    }

    console.log('[reminders] done', results);
    return { statusCode: 200, body: JSON.stringify({ processed: results.length, results }) };

  } catch (e) {
    console.error('[reminders] fatal:', e.message);
    return { statusCode: 500, body: e.message };
  }
};
