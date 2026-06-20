import crypto from "node:crypto";
import { dollarsToCents, formatMoney } from "./pricing.mjs";
import { envBool } from "./http.mjs";

export async function createStripeCheckout({ dealId, deal, totals }) {
  const mock = envBool("MOCK_MODE", true);
  const secret = process.env.STRIPE_SECRET_KEY;
  const siteUrl = process.env.SITE_URL || "http://localhost:8888";
  const currency = (process.env.STRIPE_CURRENCY || "usd").toLowerCase();

  if (mock || !secret) {
    return {
      mock: true,
      id: `mock_stripe_${dealId}`,
      url: `${siteUrl}/success?deal_id=${encodeURIComponent(dealId)}&mock=1`
    };
  }

  const params = new URLSearchParams();
  params.set("mode", "payment");
  params.set("success_url", `${siteUrl}/success?deal_id=${encodeURIComponent(dealId)}&session_id={CHECKOUT_SESSION_ID}`);
  params.set("cancel_url", `${siteUrl}/payment/${encodeURIComponent(dealId)}?canceled=1`);
  params.set("customer_email", deal.email);
  params.set("automatic_payment_methods[enabled]", "true");
  params.set("line_items[0][quantity]", "1");
  params.set("line_items[0][price_data][currency]", currency);
  params.set("line_items[0][price_data][unit_amount]", String(dollarsToCents(totals.dueAtSigning)));
  params.set("line_items[0][price_data][product_data][name]", `OVM Project Deposit - ${deal.businessName}`);
  params.set("line_items[0][price_data][product_data][description]", `Deal ${dealId}: ${totals.basePackageName}. Deposit due now ${formatMoney(totals.dueAtSigning)}.`);
  params.set("metadata[deal_id]", dealId);
  params.set("metadata[business_name]", deal.businessName);
  params.set("metadata[client_email]", deal.email);

  const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      authorization: `Bearer ${secret}`,
      "content-type": "application/x-www-form-urlencoded"
    },
    body: params
  });

  const data = await res.json();
  if (!res.ok) throw new Error(`Stripe error: ${JSON.stringify(data)}`);
  return data;
}

export function verifyStripeSignature(event) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return true;

  const sig = event.headers["stripe-signature"] || event.headers["Stripe-Signature"];
  if (!sig) return false;

  const parts = Object.fromEntries(sig.split(",").map(part => {
    const [k, v] = part.split("=");
    return [k, v];
  }));

  const timestamp = parts.t;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${timestamp}.${event.body}`)
    .digest("hex");

  const received = parts.v1;
  if (!received) return false;

  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(received));
  } catch {
    return false;
  }
}
