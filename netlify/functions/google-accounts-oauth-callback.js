// google-accounts-oauth-callback — Phase 8.
// Google redirects here after the user consents (or denies). Exchanges the
// auth code for tokens, fetches the user's Google profile to know which email
// just connected, stores everything in Google Accounts table.
//
// Returns an HTML page that closes the popup (or redirects back to the
// dashboard if not in a popup). Errors render as an HTML error page so the
// user sees something useful.
//
// Note: this function is NOT auth-protected by Clerk because Google calls it
// without our session JWT. CSRF protection comes from the `state` token we
// minted in google-accounts-oauth-start and stored in OAuth State table.

import { CORS } from './_notion.js';
import {
  airtableList, airtableCreate, airtableUpdate, airtableDelete,
  GOOGLE_ACCOUNTS_MAP, OAUTH_STATE_MAP,
} from './_airtable.js';
import { makeOAuthClient } from './_google.js';
import { google } from 'googleapis';

function htmlResponse(body, status = 200) {
  return {
    statusCode: status,
    headers: { ...CORS, 'Content-Type': 'text/html; charset=utf-8' },
    body,
  };
}

function errorPage(msg) {
  return htmlResponse(`<!doctype html>
<html><head><meta charset="utf-8"><title>Google connection failed</title>
<style>body{font:14px -apple-system,BlinkMacSystemFont,sans-serif;padding:40px;background:#fbf8f2;color:#0e1014;max-width:520px;margin:0 auto}
h1{font-family:Georgia,serif;font-weight:500;font-size:24px;margin:0 0 12px}
.err{padding:14px 16px;background:#f1d6d6;border-radius:8px;color:#b03a3a;font-size:13px}
.note{margin-top:18px;font-size:12px;color:#6b7180}</style></head>
<body><h1>Couldn't connect Google account</h1>
<div class="err">${msg.replace(/[<>]/g, '')}</div>
<div class="note">You can close this tab and try again from the dashboard.</div>
</body></html>`, 400);
}

function successPage(email) {
  return htmlResponse(`<!doctype html>
<html><head><meta charset="utf-8"><title>Google account connected</title>
<style>body{font:14px -apple-system,BlinkMacSystemFont,sans-serif;padding:40px;background:#fbf8f2;color:#0e1014;text-align:center}
h1{font-family:Georgia,serif;font-weight:500;font-size:22px;margin:0 0 8px}
.ok{display:inline-block;width:56px;height:56px;line-height:56px;border-radius:50%;background:#2f7d5f;color:#fff;font-size:32px;margin-bottom:12px}
.email{font-family:'Courier New',monospace;font-size:13px;color:#3a4050;padding:6px 12px;background:#f4f0e6;border-radius:6px;display:inline-block;margin-top:6px}
.note{margin-top:18px;font-size:12px;color:#6b7180}</style></head>
<body>
<div class="ok">✓</div>
<h1>Connected</h1>
<div class="email">${email.replace(/[<>]/g, '')}</div>
<div class="note">You can close this tab. The dashboard will pick up the new account on next page load.</div>
<script>
  if (window.opener) {
    try { window.opener.postMessage({ type: 'ovmg.google.account.connected', email: ${JSON.stringify(email)} }, '*'); } catch(e) {}
    setTimeout(() => window.close(), 1200);
  }
</script>
</body></html>`);
}

export const handler = async (event) => {
  const params = event.queryStringParameters || {};
  const code  = params.code;
  const state = params.state;
  const error = params.error;

  if (error) return errorPage(`Google returned: ${error}`);
  if (!code || !state) return errorPage('Missing code or state parameter from Google.');

  try {
    // CSRF check — state must exist + not expired + tied to a user
    const stateRecords = await airtableList('OAuth State', {
      filterByFormula: `{${OAUTH_STATE_MAP.state}} = '${state.replace(/'/g, "\\'")}'`,
      maxRecords: 1,
    });
    const stateRow = stateRecords[0];
    if (!stateRow) {
      return errorPage('OAuth state token invalid or expired. Start the connection again from the dashboard.');
    }
    const expiresAt = stateRow.fields[OAUTH_STATE_MAP.expiresAt];
    if (expiresAt && new Date(expiresAt).getTime() < Date.now()) {
      return errorPage('OAuth state token expired. Start the connection again.');
    }
    const userId = stateRow.fields[OAUTH_STATE_MAP.userId];

    // Exchange the code for tokens
    const oauth2 = makeOAuthClient();
    const { tokens } = await oauth2.getToken(code);
    if (!tokens.refresh_token) {
      return errorPage(
        "Google didn't return a refresh token. " +
        "This usually means you've previously authorized this app — go to " +
        "your Google permissions (myaccount.google.com/permissions), " +
        "remove this app's access, then try again.",
      );
    }

    oauth2.setCredentials(tokens);

    // Get profile info — email, name, picture
    const userinfo = await google.oauth2('v2').userinfo.get({ auth: oauth2 });
    const profile = userinfo.data;
    const email = profile.email || '';
    if (!email) return errorPage('Google returned no email on the profile.');

    const grantedScopes = (tokens.scope || '').split(' ').filter(Boolean);
    const now = new Date().toISOString();

    // Upsert: find existing account for this user+email, update or create
    const safeUserId = String(userId).replace(/'/g, "\\'");
    const safeEmail  = String(email).replace(/'/g, "\\'");
    const existing = await airtableList('Google Accounts', {
      filterByFormula: `AND({${GOOGLE_ACCOUNTS_MAP.userId}} = '${safeUserId}', {${GOOGLE_ACCOUNTS_MAP.email}} = '${safeEmail}')`,
      maxRecords: 1,
    });

    const accountFields = {
      [GOOGLE_ACCOUNTS_MAP.userId]:        userId,
      [GOOGLE_ACCOUNTS_MAP.email]:         email,
      [GOOGLE_ACCOUNTS_MAP.displayName]:   profile.name    || '',
      [GOOGLE_ACCOUNTS_MAP.avatarUrl]:     profile.picture || '',
      [GOOGLE_ACCOUNTS_MAP.refreshToken]:  tokens.refresh_token,
      [GOOGLE_ACCOUNTS_MAP.accessToken]:   tokens.access_token || '',
      [GOOGLE_ACCOUNTS_MAP.accessExpires]: tokens.expiry_date
        ? new Date(tokens.expiry_date).toISOString() : '',
      [GOOGLE_ACCOUNTS_MAP.scopes]:        JSON.stringify(grantedScopes),
      [GOOGLE_ACCOUNTS_MAP.lastUsedAt]:    now,
    };

    let accountRecordId;
    if (existing[0]) {
      await airtableUpdate('Google Accounts', existing[0].id, accountFields);
      accountRecordId = existing[0].id;
    } else {
      const created = await airtableCreate('Google Accounts', {
        ...accountFields,
        [GOOGLE_ACCOUNTS_MAP.isActive]: false,
      });
      accountRecordId = created.id;
    }

    // If this is the user's first account, make it active automatically
    const allAccounts = await airtableList('Google Accounts', {
      filterByFormula: `{${GOOGLE_ACCOUNTS_MAP.userId}} = '${safeUserId}'`,
      maxRecords: 2,
    });
    if (allAccounts.length === 1) {
      await airtableUpdate('Google Accounts', accountRecordId, {
        [GOOGLE_ACCOUNTS_MAP.isActive]: true,
      });
    }

    // Delete the state token (one-time use)
    await airtableDelete('OAuth State', stateRow.id);

    return successPage(email);
  } catch (e) {
    console.error('[google-accounts-oauth-callback]', e.message);
    return errorPage('Connection failed: ' + e.message);
  }
};
