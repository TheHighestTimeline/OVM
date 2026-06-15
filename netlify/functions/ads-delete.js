import { getUser } from './_auth.js';
import { airtableDelete } from './_airtable.js';
import { CORS } from './_notion.js';

const ok  = b => ({ statusCode: 200, headers: { ...CORS, 'Content-Type': 'application/json' }, body: JSON.stringify(b) });
const err = (m, c=500) => ({ statusCode: c, headers: { ...CORS, 'Content-Type': 'application/json' }, body: JSON.stringify({ error: m }) });

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: CORS };
  const user = await getUser(event);
  if (!user) return err('Unauthorized', 401);

  const id = event.queryStringParameters?.id;
  if (!id) return err('id required', 400);

  try {
    await airtableDelete('Ads', id);
    return ok({ deleted: true });
  } catch (e) {
    return err(e.message);
  }
}
