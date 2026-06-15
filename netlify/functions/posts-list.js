// posts-list — lists posts for a client from Airtable
import { ok, err, CORS } from './_notion.js';
import { requireAuth } from './_auth.js';
import { airtableList, fromAirtableRecord, POSTS_MAP } from './_airtable.js';

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: CORS };
  const unauth = await requireAuth(event); if (unauth) return unauth;

  const p = event.queryStringParameters || {};

  try {
    const parts = [`{Client ID} != ''`];
    if (p.client_id) parts.push(`{Client ID} = '${p.client_id}'`);
    if (p.status)    parts.push(`{Status} = '${p.status}'`);
    if (p.platform)  parts.push(`{Platform} = '${p.platform}'`);

    const formula = parts.length > 1 ? `AND(${parts.join(',')})` : parts[0];

    const records = await airtableList('Posts', {
      filterByFormula: formula,
      sort: [{ field: 'Scheduled At', direction: 'asc' }],
      maxRecords: 500,
    });

    const posts = records.map(r => {
      const p = fromAirtableRecord(r, POSTS_MAP);
      // Normalise field names to snake_case for frontend compatibility
      return {
        id:                   p.id,
        client_id:            p.clientId,
        platform:             p.platform,
        type:                 p.type,
        caption:              p.caption,
        hashtags:             p.hashtags,
        asset_url:            p.assetUrl,
        status:               p.status     || 'draft',
        scheduled_at:         p.scheduledAt,
        approval_token:       p.approvalToken,
        client_approval_note: p.clientApprovalNote,
        reminder_sent:        p.reminderSent || false,
      };
    });

    return ok({ posts });
  } catch (e) {
    console.error('[posts-list]', e.message);
    return err(500, e.message);
  }
};
