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
    const records = await airtableList('Client Platforms', {
      filterByFormula: `{Client ID} = '${clientId}'`,
    });
    const platforms = records.map(r => ({
      id:         r.id,
      client_id:  r.fields['Client ID']  || '',
      platform:   r.fields['Platform']   || '',
      handle:     r.fields['Handle']     || '',
      followers:  r.fields['Followers']  || null,
      enabled:    r.fields['Enabled']    !== false,
    }));
    return ok({ platforms });
  } catch (e) {
    return err(e.message);
  }
}
