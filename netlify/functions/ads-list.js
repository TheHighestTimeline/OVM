import { getUser } from './_auth.js';
import { airtableList } from './_airtable.js';
import { CORS } from './_notion.js';

const ok  = b => ({ statusCode: 200, headers: { ...CORS, 'Content-Type': 'application/json' }, body: JSON.stringify(b) });
const err = (m, c=500) => ({ statusCode: c, headers: { ...CORS, 'Content-Type': 'application/json' }, body: JSON.stringify({ error: m }) });

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: CORS };
  const user = await getUser(event);
  if (!user) return err('Unauthorized', 401);

  const clientId = event.queryStringParameters?.clientId;
  if (!clientId) return err('clientId required', 400);

  try {
    const records = await airtableList('Ads', {
      filterByFormula: `{Client ID} = '${clientId}'`,
      sort: [{ field: 'Created At', direction: 'desc' }],
    });
    const ads = records.map(r => ({
      id:          r.id,
      client_id:   r.fields['Client ID'],
      name:        r.fields['Name']        || '',
      platform:    r.fields['Platform']    || '',
      type:        r.fields['Type']        || '',
      status:      r.fields['Status']      || 'draft',
      budget:      r.fields['Budget']      || null,
      spend:       r.fields['Spend']       || null,
      impressions: r.fields['Impressions'] || null,
      clicks:      r.fields['Clicks']      || null,
      asset_url:   r.fields['Asset URL']   || '',
      notes:       r.fields['Notes']       || '',
      created_at:  r.fields['Created At']  || r.fields['Created time'] || null,
    }));
    return ok({ ads });
  } catch (e) {
    return err(e.message);
  }
}
