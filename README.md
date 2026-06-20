# OVM Contract Funnel

A Netlify-ready funnel for OneVibeMedia:

**real website examples → iPad swipe CTA → order details form → dynamic SignWell agreement → Stripe 25% deposit or bank-transfer instructions → onboarding email with Tally link → Google Sheets tracking**

This repo is built to run in `MOCK_MODE=true` immediately so you can push it to GitHub, connect it to Netlify, and see the funnel before adding live API keys.

## What this includes

- A portfolio-first homepage that opens with real website examples.
- Example links/cards for:
  - `dockbridge.io`
  - `initpic.com`
  - `lilycrm.com`
- A fixed iPad-friendly swipe button at the bottom of the viewport.
- An order details form for name, email, business/artist/brand, project type, package, add-ons, timeline, budget range, notes, and inspiration links.
- Server-side pricing calculation in Netlify Functions.
- SignWell document generation from a template.
- Stripe Checkout Session generation for the exact deposit amount.
- Bank transfer screen with your instructions.
- Google Sheets append/update helpers for deal tracking.
- Onboarding email helper using Resend.
- Mock contract/payment mode for testing without keys.

## Funnel flow

```text
/              Website examples first
/order         Order details form
/contract/:id  SignWell agreement / mock agreement
/payment/:id   Deposit payment or bank transfer
/success       Confirmation
```

Legacy personalized preview URLs still work:

```text
/preview/demo-medspa
/preview/ats-demo
```

## Local setup

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:5173/
http://localhost:5173/order
```

For Netlify Functions locally, install the Netlify CLI and run:

```bash
npm install -g netlify-cli
npm run netlify:dev
```

## Deploy to Netlify

1. Push this folder to the `ovm-contract-funnel` branch.
2. Connect the repo/branch to Netlify.
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Functions directory: `netlify/functions`
6. Add environment variables from `.env.example`.

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

## Website example notes

The homepage uses live website preview frames for the portfolio examples. Some websites may block iframe embedding depending on their security headers. If that happens, the user can still tap **Open Live Site** to view the example in a new tab.

For a fully controlled production version, replace the live iframes with screenshots stored in the repo, such as:

```text
/public/examples/dockbridge.png
/public/examples/initpic.png
/public/examples/lilycrm.png
```

## Recommended Google Sheet columns

Create a sheet tab called `Deals` with this header row:

```csv
deal_id,created_at,status,client_slug,client_name,business_name,email,phone,selected_package,add_ons,project_total,deposit_due,remaining_due,monthly_total,payment_method,signwell_document_id,stripe_session_id,stripe_payment_status,onboarding_url,notes
```

The `notes` column now receives the project type, timeline, budget range, inspiration links, and special requests combined into one readable field.

Share the sheet with your Google service account email.

## SignWell template fields

Create one master service agreement template in SignWell and add merge/API fields with these names:

```text
deal_id
client_name
business_name
client_email
client_phone
project_type
project_timeline
budget_range
inspiration_links
project_notes
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
&project_type=...
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
