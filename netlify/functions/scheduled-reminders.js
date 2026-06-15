// ════════════════════════════════════════════════════════════════════════════
// scheduled-reminders — Netlify scheduled function (every 5 min)
//
// For each post that is 'client_approved' AND has a scheduled_at within
// the next 10 minutes (and hasn't had a reminder sent), fires a Zapier
// webhook with post details. Zapier sends the SMS to the manager.
//
// Netlify.toml config:
//   [[functions]]
//   schedule = "*/5 * * * *"
//
// Env vars needed:
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ZAPIER_WEBHOOK_URL
// ════════════════════════════════════════════════════════════════════════════

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const ZAPIER_WEBHOOK = process.env.ZAPIER_WEBHOOK_URL;

exports.handler = async function() {
  if (!ZAPIER_WEBHOOK) {
    console.warn('[reminders] ZAPIER_WEBHOOK_URL not set — skipping');
    return { statusCode: 200, body: 'no webhook configured' };
  }

  const now   = new Date();
  const soon  = new Date(now.getTime() + 10 * 60 * 1000); // 10 min window
  const fiveM = new Date(now.getTime() + 5  * 60 * 1000); // sweet-spot target

  // Find posts approved + scheduled in the next 10 min + no reminder sent yet
  const { data: posts, error } = await supabase
    .from('posts')
    .select('id, caption, platform, type, scheduled_at, client_id, approval_token')
    .eq('status', 'client_approved')
    .eq('reminder_sent', false)
    .gte('scheduled_at', now.toISOString())
    .lte('scheduled_at', soon.toISOString());

  if (error) {
    console.error('[reminders] supabase error:', error.message);
    return { statusCode: 500, body: error.message };
  }

  if (!posts || posts.length === 0) {
    console.log('[reminders] nothing due');
    return { statusCode: 200, body: 'ok' };
  }

  const results = [];

  for (const post of posts) {
    try {
      const scheduledAt  = new Date(post.scheduled_at);
      const minutesAway  = Math.round((scheduledAt - now) / 60000);
      const scheduledStr = scheduledAt.toLocaleTimeString('en-US', {
        hour: 'numeric', minute: '2-digit', timeZone: 'America/New_York'
      });

      // Fire Zapier webhook
      const zapRes = await fetch(ZAPIER_WEBHOOK, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          post_id:       post.id,
          platform:      post.platform,
          type:          post.type,
          caption:       (post.caption || '').slice(0, 100),
          scheduled_at:  post.scheduled_at,
          scheduled_str: scheduledStr,
          minutes_away:  minutesAway,
          message:       `⏰ Reminder: ${post.platform?.toUpperCase()} ${post.type || 'post'} is due in ${minutesAway} min (${scheduledStr}). Time to post!`,
        }),
      });

      if (!zapRes.ok) throw new Error(`Zapier HTTP ${zapRes.status}`);

      // Mark reminder_sent = true so we don't fire again
      const { error: updErr } = await supabase
        .from('posts')
        .update({ reminder_sent: true })
        .eq('id', post.id);

      if (updErr) console.error(`[reminders] failed to mark post ${post.id}:`, updErr.message);
      else results.push({ id: post.id, ok: true });

    } catch (e) {
      console.error(`[reminders] post ${post.id} failed:`, e.message);
      results.push({ id: post.id, error: e.message });
    }
  }

  console.log('[reminders] done', results);
  return { statusCode: 200, body: JSON.stringify({ processed: results.length, results }) };
};
