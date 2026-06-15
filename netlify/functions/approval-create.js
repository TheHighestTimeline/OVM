// approval-create.js
// Creates an approval batch: saves posts to app_state with a unique token.
// Called by the manager; auth required.
import { requireAuth, getUser } from './_auth.js';
import { getSupabase } from './_supabase.js';
import { ok, err, CORS } from './_notion.js';
import { randomUUID } from 'crypto';

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: CORS };
  const authErr = await requireAuth(event);
  if (authErr) return authErr;

  let body;
  try { body = JSON.parse(event.body || '{}'); } catch { return err(400, 'Invalid JSON'); }

  const { posts, clientId, clientName, clientPhone } = body;
  if (!posts?.length) return err(400, 'No posts provided');

  const token    = randomUUID().replace(/-/g, '').slice(0, 16);
  const siteUrl  = process.env.URL || 'http://localhost:5173';
  const approvalUrl = `${siteUrl}/approve/${token}`;

  const session = {
    token,
    approvalUrl,
    clientId,
    clientName:  clientName  || 'Client',
    clientPhone: clientPhone || '',
    createdAt:   new Date().toISOString(),
    status:      'pending',
    posts: posts.map(p => ({
      id:        p.id,
      platform:  p.platform,
      type:      p.type      || 'post',
      caption:   p.caption   || '',
      hashtags:  p.hashtags  || '',
      asset_url: p.media_url || p.asset_url || '',
      decision:  null, // null | 'approved' | 'changes'
      note:      '',
    })),
  };

  try {
    const sb = getSupabase();
    // Store in app_state table with key = "approval:TOKEN"
    const { error: sbErr } = await sb
      .from('app_state')
      .upsert({ key: `approval:${token}`, value: session }, { onConflict: 'key' });

    if (sbErr) throw new Error(sbErr.message);

    // Update each post's status to pending_client_approval
    if (posts.length > 0) {
      const ids = posts.map(p => p.id).filter(Boolean);
      if (ids.length) {
        await sb
          .from('posts')
          .update({ status: 'pending_client_approval', approval_token: token })
          .in('id', ids);
      }
    }

    return ok({ token, approvalUrl, clientName: session.clientName });
  } catch (e) {
    return err(500, e.message);
  }
};
