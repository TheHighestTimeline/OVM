# Airtable Setup

Add these two tables to your existing Airtable base (the same base used by the main OVMG dashboard).

---

## Table 1: Posts

| Field name | Field type | Notes |
|---|---|---|
| Caption | Long text | |
| Hashtags | Long text | |
| Platform | Single select | Options: instagram, tiktok, facebook, youtube, threads |
| Type | Single select | Options: photo, video, carousel, reel, short, story, quote |
| Asset URL | URL | |
| Status | Single select | Options: draft, pending_review, pending_client_approval, client_approved, changes_requested, approved, scheduled, posted, failed |
| Scheduled At | Date | Enable "Include time" |
| Client ID | Single line text | Matches the Airtable record ID of the artist/client |
| Approval Token | Single line text | Set by the app — do not edit manually |
| Client Approval Note | Long text | Feedback left by the client |
| Reminder Sent | Checkbox | Checked once the Zapier SMS has fired |

---

## Table 2: Approval Sessions

| Field name | Field type | Notes |
|---|---|---|
| Token | Single line text | **Make this the primary field** |
| Session Data | Long text | Full JSON blob — do not edit manually |
| Status | Single select | Options: pending, partial, complete |
| Client Name | Single line text | |
| Client ID | Single line text | |

---

## That's it

No migration SQL needed — Airtable creates the tables through the UI.
Once both tables exist and your `AIRTABLE_TOKEN` + `AIRTABLE_BASE_ID` are set in Netlify, everything connects automatically.

The app uses your existing Artists/Clients table for the client roster — no changes needed there.

---

## Table 3: Google Accounts

Stores connected Google OAuth accounts per user. Replaces the Supabase `user_google_accounts` table.

| Field Name     | Field Type        | Notes                                   |
|----------------|-------------------|-----------------------------------------|
| User ID        | Single line text  | **Primary field** — Clerk user ID       |
| Email          | Email             | Google account email                    |
| Display Name   | Single line text  | From Google profile                     |
| Avatar URL     | URL               | Profile photo URL                       |
| Refresh Token  | Long text         | OAuth refresh token (keep private)      |
| Access Token   | Long text         | Current access token                    |
| Access Expires | Single line text  | ISO date string of token expiry         |
| Scopes         | Long text         | JSON array of granted scopes            |
| Is Active      | Checkbox          | Which account is currently active       |
| Last Used At   | Single line text  | ISO date string                         |

---

## Table 4: OAuth State

Temporary CSRF tokens minted during Google OAuth flow. Replaces the Supabase `oauth_state` table. Records are deleted after use and periodically cleaned up.

| Field Name  | Field Type        | Notes                                        |
|-------------|-------------------|----------------------------------------------|
| State       | Single line text  | **Primary field** — random 48-char hex token |
| User ID     | Single line text  | Clerk user ID of the user who initiated flow |
| Expires At  | Single line text  | ISO date string (10 min from creation)       |

---

## Table 5: Ads

Tracks paid ad campaigns. Replaces the Supabase `ads` table.

| Field Name  | Field Type        | Notes                                       |
|-------------|-------------------|---------------------------------------------|
| Name        | Single line text  | **Primary field** — ad/campaign name        |
| Client ID   | Single line text  | Matches the client slug/ID                  |
| Platform    | Single select     | facebook, instagram, google, tiktok, etc.   |
| Status      | Single select     | active, paused, ended, draft                |
| Budget      | Number            | Budget in USD                               |
| Spend       | Number            | Amount spent to date                        |
| Impressions | Number            |                                             |
| Clicks      | Number            |                                             |
| Conversions | Number            |                                             |
| Start Date  | Date              |                                             |
| End Date    | Date              |                                             |
| Notes       | Long text         |                                             |

---

## Table 6: Client Platforms

Which social platforms each client is active on. Replaces the Supabase `client_platforms` table.

| Field Name | Field Type        | Notes                                          |
|------------|-------------------|------------------------------------------------|
| Client ID  | Single line text  | **Primary field** — matches client slug        |
| Platform   | Single select     | instagram, tiktok, facebook, youtube, threads  |
| Handle     | Single line text  | @username on that platform                     |
| Active     | Checkbox          | Is this platform currently active              |
| Notes      | Long text         |                                                |
