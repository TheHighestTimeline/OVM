// google-accounts-set-active — Phase 8.
// Sets which connected Google account is the user's "active" one.
// Subsequent calls to Gmail / Calendar / Drive use the active account.

import { ok, err, CORS } from './_notion.js';
import { requireAuth, getUser } from './_auth.js';
import { airtableGet, airtableList, airtableUpdate, GOOGLE_ACCOUNTS_MAP } from './_airtable.js';

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

    // Verify the account belongs to this user
    let record;
    try {
      record = await airtableGet('Google Accounts', accountId);
    } catch {
      return err(404, 'Account not found');
    }
    if (!record || !record.fields) return err(404, 'Account not found');
    if (record.fields[GOOGLE_ACCOUNTS_MAP.userId] !== user.id) {
      return err(403, 'Not your account');
    }

    const email = record.fields[GOOGLE_ACCOUNTS_MAP.email] || '';

    // Deactivate all other accounts for this user
    const safeUserId = String(user.id).replace(/'/g, "\\'");
    const allAccounts = await airtableList('Google Accounts', {
      filterByFormula: `AND({${GOOGLE_ACCOUNTS_MAP.userId}} = '${safeUserId}', NOT(RECORD_ID() = '${accountId}'))`,
      maxRecords: 50,
    });

    // Deactivate each (sequential is fine — usually only 1-3 accounts)
    for (const r of allAccounts) {
      if (r.fields[GOOGLE_ACCOUNTS_MAP.isActive]) {
        await airtableUpdate('Google Accounts', r.id, {
          [GOOGLE_ACCOUNTS_MAP.isActive]: false,
        }).catch(e => console.warn('[google-accounts-set-active] deactivate failed:', e.message));
      }
    }

    // Activate the chosen account
    await airtableUpdate('Google Accounts', accountId, {
      [GOOGLE_ACCOUNTS_MAP.isActive]:   true,
      [GOOGLE_ACCOUNTS_MAP.lastUsedAt]: new Date().toISOString(),
    });

    return ok({ accountId, email, isActive: true });
  } catch (e) {
    console.error('[google-accounts-set-active]', e.message);
    return err(500, e.message);
  }
};
