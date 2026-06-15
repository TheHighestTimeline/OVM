// google-accounts-remove — Phase 8.
// Disconnects a Google account from a user. Revokes the refresh token on
// Google's side too, so the dashboard immediately loses access.

import { ok, err, CORS } from './_notion.js';
import { requireAuth, getUser } from './_auth.js';
import { airtableGet, airtableDelete, GOOGLE_ACCOUNTS_MAP } from './_airtable.js';

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: CORS };
  const unauth = await requireAuth(event);
  if (unauth) return unauth;

  let body;
  try { body = JSON.parse(event.body || '{}'); }
  catch { return err(400, 'Invalid JSON'); }

  const accountId = body.accountId || body.id;
  if (!accountId) return err(400, 'accountId required');

  try {
    const user = await getUser(event);
    if (!user) return err(401, 'No user');

    // Fetch the account record by Airtable record ID
    let record;
    try {
      record = await airtableGet('Google Accounts', accountId);
    } catch {
      return err(404, 'Account not found');
    }
    if (!record || !record.fields) return err(404, 'Account not found');

    // Verify ownership
    if (record.fields[GOOGLE_ACCOUNTS_MAP.userId] !== user.id) {
      return err(403, 'Not your account');
    }

    const email = record.fields[GOOGLE_ACCOUNTS_MAP.email] || '';
    const refreshToken = record.fields[GOOGLE_ACCOUNTS_MAP.refreshToken] || '';

    // Best-effort revoke on Google's side (don't fail the call if this errors)
    if (refreshToken) {
      try {
        await fetch(`https://oauth2.googleapis.com/revoke?token=${encodeURIComponent(refreshToken)}`, {
          method: 'POST',
        });
      } catch (e) {
        console.warn('[google-accounts-remove] revoke failed (non-fatal):', e.message);
      }
    }

    await airtableDelete('Google Accounts', accountId);

    return ok({ accountId, removed: true, email });
  } catch (e) {
    console.error('[google-accounts-remove]', e.message);
    return err(500, e.message);
  }
};
