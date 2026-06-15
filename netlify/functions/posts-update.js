// posts-update — updates a post in Airtable by record ID
import { ok, err, CORS } from './_notion.js';
import { requireAuth } from './_auth.js';
import { airtableUpdate, fromAirtableRecord, POSTS_MAP } from './_airtable.js';

const VALID_STATUSES = new Set(['draft','pending_review','pending_client_approval',
                                 'client_approved','changes_requested',
                                 'approved','scheduled','posted','failed']);

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: CORS, body: '' };
  const unauth = await requireAuth(event); if (unauth) return unauth;

  let body; try { body = JSON.parse(event.body || '{}'); } catch { return err(400, 'Invalid JSON'); }
  if (!body.id) return err(400, 'id required');
  if (body.status && !VALID_STATUSES.has(body.status)) return err(400, `Invalid status: ${body.status}`);

  try {
    const fields = {};
    if (body.status               !== undefined) fields[POSTS_MAP.status]             = body.status;
    if (body.caption              !== undefined) fields[POSTS_MAP.caption]             = body.caption;
    if (body.hashtags             !== undefined) fields[POSTS_MAP.hashtags]            = body.hashtags;
    if (body.asset_url            !== undefined) fields[POSTS_MAP.assetUrl]            = body.asset_url;
    if (body.scheduled_at         !== undefined) fields[POSTS_MAP.scheduledAt]         = body.scheduled_at;
    if (body.approval_token       !== undefined) fields[POSTS_MAP.approvalToken]       = body.approval_token;
    if (body.client_approval_note !== undefined) fields[POSTS_MAP.clientApprovalNote]  = body.client_approval_note;
    if (body.reminder_sent        !== undefined) fields[POSTS_MAP.reminderSent]        = body.reminder_sent;

    const record = await airtableUpdate('Posts', body.id, fields);
    const post   = fromAirtableRecord(record, POSTS_MAP);

    return ok({
      id:                   post.id,
      client_id:            post.clientId,
      platform:             post.platform,
      status:               post.status,
      scheduled_at:         post.scheduledAt,
      caption:              post.caption,
      hashtags:             post.hashtags,
      asset_url:            post.assetUrl,
      approval_token:       post.approvalToken,
      client_approval_note: post.clientApprovalNote,
      reminder_sent:        post.reminderSent,
    });
  } catch (e) {
    console.error('[posts-update]', e.message);
    return err(500, e.message);
  }
};
