// approval-get.js
// Public (no auth) — returns approval session for a given token.
// Used by the client-facing approval page.
import { getSupabase } from './_supabase.js';
import { ok, err, CORS } from './_notion.js';

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: CORS };

  const token = event.queryStringParameters?.token;
  if (!token) return err(400, 'Missing token');

  try {
    const sb = getSupabase();
    const { data, error } = await sb
      .from('app_state')
      .select('value')
      .eq('key', `approval:${token}`)
      .single();

    if (error || !data) return err(404, 'Approval not found');

    // Return the session without exposing the phone number to the client
    const session = data.value;
    const { clientPhone: _removed, ...safe } = session;

    return ok(safe);
  } catch (e) {
    return err(500, e.message);
  }
};
