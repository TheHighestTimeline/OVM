import { getUser } from './_auth.js';
import { airtableList, airtableCreate, airtableUpdate } from './_airtable.js';
import { CORS } from './_notion.js';

const ok  = b => ({ statusCode: 200, headers: { ...CORS, 'Content-Type': 'application/json' }, body: JSON.stringify(b) });
const err = (m, c=500) => ({ statusCode: c, headers: { ...CORS, 'Content-Type': 'application/json' }, body: JSON.stringify({ error: m }) });

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: CORS };
  const user = await getUser(event);
  if (!user) return err('Unauthorized', 401);

  let body; try { body = JSON.parse(event.body || '{}'); } catch { return err('Invalid JSON', 400); }
  const { clientId, platform, handle, followers, enabled } = body;
  if (!clientId || !platform) return err('clientId and platform required', 400);

  try {
    // Find existing record for this client+platform combo
    const existing = await airtableList('Client Platforms', {
      filterByFormula: `AND({Client ID} = '${clientId}', {Platform} = '${platform}')`,
    });

    const fields = {
      'Client ID': clientId,
      'Platform':  platform,
      'Handle':    handle    || '',
      'Followers': followers ?? null,
      'Enabled':   enabled   !== false,
    };

    const record = existing.length
      ? await airtableUpdate('Client Platforms', existing[0].id, fields)
      : await airtableCreate('Client Platforms', fields);

    return ok({ id: record.id, ...record.fields });
  } catch (e) {
    return err(e.message);
  }
}
