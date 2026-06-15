// approval-create — creates an approval session in Airtable
import { requireAuth } from './_auth.js';
import { airtableCreate, airtableUpdate, airtableFindByField, POSTS_MAP, APPROVAL_SESSIONS_MAP } from './_airtable.js';
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

  const token      = randomUUID().replace(/-/g, '').slice(0, 16);
  const siteUrl    = process.env.URL || 'http://localhost:5173';
  const approvalUrl = `${siteUrl}/approve/${token}`;

  // Build session JSON (stored in Airtable long text field)
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
      asset_url: p.asset_url || p.media_url || '',
      decision:  null,
      note:      '',
    })),
  };

  try {
    // 1. Save approval session to Airtable
    await airtableCreate('Approval Sessions', {
      [APPROVAL_SESSIONS_MAP.token]:       token,
      [APPROVAL_SESSIONS_MAP.sessionData]: JSON.stringify(session),
      [APPROVAL_SESSIONS_MAP.status]:      'pending',
      [APPROVAL_SESSIONS_MAP.clientName]:  clientName || 'Client',
      [APPROVAL_SESSIONS_MAP.clientId]:    clientId   || '',
    });

    // 2. Update each post: status → pending_client_approval, token saved
    for (const post of posts) {
      if (!post.id) continue;
      await airtableUpdate('Posts', post.id, {
        [POSTS_MAP.status]:        'pending_client_approval',
        [POSTS_MAP.approvalToken]: token,
      });
    }

    return ok({ token, approvalUrl, clientName: session.clientName });
  } catch (e) {
    console.error('[approval-create]', e.message);
    return err(500, e.message);
  }
};
