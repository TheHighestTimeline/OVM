// approval-get — public (no auth) — returns approval session for a token
import { airtableFindByField, APPROVAL_SESSIONS_MAP } from './_airtable.js';
import { ok, err, CORS } from './_notion.js';

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: CORS };

  const token = event.queryStringParameters?.token;
  if (!token) return err(400, 'Missing token');

  try {
    const records = await airtableFindByField('Approval Sessions', APPROVAL_SESSIONS_MAP.token, token);
    if (!records.length) return err(404, 'Approval not found');

    const raw     = records[0].fields?.[APPROVAL_SESSIONS_MAP.sessionData];
    const session = raw ? JSON.parse(raw) : null;
    if (!session) return err(404, 'Approval session data missing');

    // Strip phone number — clients don't need it
    const { clientPhone: _removed, ...safe } = session;
    return ok(safe);
  } catch (e) {
    console.error('[approval-get]', e.message);
    return err(500, e.message);
  }
};
