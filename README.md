# OVM Contract Funnel

A Netlify-ready funnel for OneVibeMedia:

**custom website preview → swipe CTA → add-ons → dynamic SignWell agreement → Stripe 25% deposit or bank-transfer instructions → onboarding email with Tally link → Google Sheets tracking**

This repo is built to run in `MOCK_MODE=true` immediately so you can push it to GitHub, connect it to Netlify, and see the funnel before adding live API keys.

## What this includes

- A scrollable personalized website preview per client.
- A fixed swipe button visible in the viewport.
- A base package + add-on selector.
- Server-side pricing calculation in Netlify Functions.
- SignWell document generation from a template.
- Stripe Checkout Session generation for the exact deposit amount.
- Bank transfer screen with your instructions.
- Google Sheets append/update helpers for deal tracking.
- Onboarding email helper using Resend.
- Mock contract/payment mode for testing without keys.

## Local setup

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:5173/preview/demo-medspa
http://localhost:5173/preview/ats-demo
```

For Netlify Functions locally, install the Netlify CLI and run:

```bash
npm install -g netlify-cli
npm run netlify:dev
```

## Deploy to Netlify

1. Create a new GitHub repo.
2. Upload this folder.
3. Connect the repo to Netlify.
4. Build command: `npm run build`
5. Publish directory: `dist`
6. Functions directory: `netlify/functions`
7. Add environment variables from `.env.example`.

The app runs in mock mode until you set:

```text
MOCK_MODE=false
SIGNWELL_API_KEY=...
SIGNWELL_TEMPLATE_ID=...
STRIPE_SECRET_KEY=...
GOOGLE_SHEETS_SPREADSHEET_ID=...
GOOGLE_SERVICE_ACCOUNT_EMAIL=...
GOOGLE_PRIVATE_KEY=...
```

## Client folders

Create a new client by copying:

```text
clients/demo-medspa.json
```

Example:

```text
clients/miami-medspa.json
```

Then send the client:

```text
https://your-site.netlify.app/preview/miami-medspa
```

The frontend loads the JSON file and renders the custom preview. The backend still calculates prices from the protected server-side pricing file.

## Recommended Google Sheet columns

Create a sheet tab called `Deals` with this header row:

```csv
deal_id,created_at,status,client_slug,client_name,business_name,email,phone,selected_package,add_ons,project_total,deposit_due,remaining_due,monthly_total,payment_method,signwell_document_id,stripe_session_id,stripe_payment_status,onboarding_url,notes
```

Share the sheet with your Google service account email.

## SignWell template fields

Create one master service agreement template in SignWell and add merge/API fields with these names:

```text
deal_id
client_name
business_name
client_email
client_phone
selected_package
selected_add_ons
project_total
deposit_due
remaining_due
monthly_total
remaining_due_date
payment_terms
onboarding_form_url
```

Set the signer placeholder/role to match:

```text
SIGNWELL_RECIPIENT_PLACEHOLDER=Client
```

The SignWell adapter is in:

```text
netlify/functions/_utils/signwell.mjs
```

SignWell template APIs can be customized per your exact template field IDs.

## Stripe

The backend creates a Checkout Session for the calculated deposit. By default it uses `automatic_payment_methods[enabled]=true` so Stripe can show eligible methods you enable in the Stripe Dashboard.

For Affirm, enable it in Stripe Dashboard. Stripe determines eligibility based on amount, customer, country, and your Stripe settings.

Webhook endpoint:

```text
https://your-site.netlify.app/.netlify/functions/stripe-webhook
```

Events to listen for:

```text
checkout.session.completed
checkout.session.async_payment_succeeded
checkout.session.async_payment_failed
```

## SignWell webhook

Webhook endpoint:

```text
https://your-site.netlify.app/.netlify/functions/signwell-webhook
```

Use it to update Google Sheets when a document is completed.

## Onboarding

The onboarding form should be sent after:

```text
contract signed + deposit paid/confirmed
```

For Stripe, the webhook can send it automatically. For bank transfer, update the Google Sheet manually and use the internal endpoint later if you build an admin button.

The Tally link can receive hidden fields:

```text
?deal_id=OVM-...
&client_name=...
&business_name=...
&package=...
&project_total=...
```

## Security notes

- Never calculate final totals only in the browser.
- Never expose Stripe, SignWell, Google, or email API keys in frontend code.
- Use Netlify environment variables for secrets.
- Do not store private signed documents in GitHub.
- Bank-transfer deals should remain `Bank Transfer Pending` until funds clear.

## Current MVP limits

- The frontend has a mock signing screen for testing.
- Live SignWell embedded signing may need small payload adjustments depending on your exact SignWell template/recipient field IDs.
- Google Sheets is fine for MVP tracking, but Supabase/Airtable would be better later for a true database.
