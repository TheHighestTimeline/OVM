import { getUser } from './_auth.js';
import { airtableCreate, airtableUpdate } from './_airtable.js';
import { CORS } from './_notion.js';

const ok  = b => ({ statusCode: 200, headers: { ...CORS, 'Content-Type': 'application/json' }, body: JSON.stringify(b) });
const err = (m, c=500) => ({ statusCode: c, headers: { ...CORS, 'Content-Type': 'application/json' }, body: JSON.stringify({ error: m }) });

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: CORS };
  const user = await getUser(event);
  if (!user) return err('Unauthorized', 401);

  let body; try { body = JSON.parse(event.body || '{}'); } catch { return err('Invalid JSON', 400); }

  const fields = {
    'Client ID':   body.client_id  || '',
    'Name':        body.name       || '',
    'Platform':    body.platform   || '',
    'Type':        body.type       || '',
    'Status':      body.status     || 'draft',
    'Budget':      body.budget     ?? null,
    'Spend':       body.spend      ?? null,
    'Impressions': body.impressions ?? null,
    'Clicks':      body.clicks     ?? null,
    'Asset URL':   body.asset_url  || '',
    'Notes':       body.notes      || '',
  };

  try {
    const record = body.id
      ? await airtableUpdate('Ads', body.id, fields)
      : await airtableCreate('Ads', fields);
    return ok({ id: record.id, ...record.fields });
  } catch (e) {
    return err(e.message);
  }
}
