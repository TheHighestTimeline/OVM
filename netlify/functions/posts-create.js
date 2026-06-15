// posts-create — creates a post in Airtable
import { ok, err, CORS } from './_notion.js';
import { requireAuth } from './_auth.js';
import { airtableCreate, fromAirtableRecord, POSTS_MAP } from './_airtable.js';

const VALID_PLATFORMS = new Set(['instagram','tiktok','facebook','youtube','threads']);
const VALID_STATUSES  = new Set(['draft','pending_review','pending_client_approval',
                                  'client_approved','changes_requested',
                                  'approved','scheduled','posted','failed']);

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: CORS, body: '' };
  const unauth = await requireAuth(event); if (unauth) return unauth;

  let body; try { body = JSON.parse(event.body || '{}'); } catch { return err(400, 'Invalid JSON'); }
  if (!body.client_id) return err(400, 'client_id required');
  if (body.platform && !VALID_PLATFORMS.has(body.platform)) return err(400, `Invalid platform: ${body.platform}`);
  if (body.status   && !VALID_STATUSES.has(body.status))   return err(400, `Invalid status: ${body.status}`);

  try {
    const record = await airtableCreate('Posts', {
      [POSTS_MAP.clientId]:   body.client_id,
      [POSTS_MAP.platform]:   body.platform     || 'instagram',
      [POSTS_MAP.type]:       body.type         || 'photo',
      [POSTS_MAP.caption]:    body.caption      || '',
      [POSTS_MAP.hashtags]:   body.hashtags     || '',
      [POSTS_MAP.assetUrl]:   body.asset_url    || '',
      [POSTS_MAP.status]:     body.status       || 'draft',
      [POSTS_MAP.scheduledAt]: body.scheduled_at || null,
    });

    const post = fromAirtableRecord(record, POSTS_MAP);
    return ok({
      id:           post.id,
      client_id:    post.clientId,
      platform:     post.platform,
      type:         post.type,
      caption:      post.caption,
      hashtags:     post.hashtags,
      asset_url:    post.assetUrl,
      status:       post.status || 'draft',
      scheduled_at: post.scheduledAt,
    });
  } catch (e) {
    console.error('[posts-create]', e.message);
    return err(500, e.message);
  }
};
