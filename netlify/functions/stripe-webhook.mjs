import { json } from "./_utils/http.mjs";
import { verifyStripeSignature } from "./_utils/stripe.mjs";
import { updateDealStatus } from "./_utils/sheets.mjs";

export async function handler(event) {
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });

  try {
    if (!verifyStripeSignature(event)) return json(400, { error: "Invalid Stripe signature" });

    const payload = JSON.parse(event.body);
    const eventType = payload.type;
    const session = payload.data?.object;
    const dealId = session?.metadata?.deal_id;

    if (dealId && ["checkout.session.completed", "checkout.session.async_payment_succeeded"].includes(eventType)) {
      await updateDealStatus(dealId, {
        status: "Stripe Deposit Paid",
        stripePaymentStatus: session.payment_status || "paid",
        stripeSessionId: session.id
      });

      // To send onboarding automatically, store enough deal data in a database or retrieve it from Sheets.
      // This MVP updates Sheets here. You can add a getDealById helper later and call sendOnboardingEmail(deal).
    }

    if (dealId && eventType === "checkout.session.async_payment_failed") {
      await updateDealStatus(dealId, {
        status: "Stripe Payment Failed",
        stripePaymentStatus: "failed",
        stripeSessionId: session.id
      });
    }

    return json(200, { received: true });
  } catch (err) {
    console.error(err);
    return json(500, { error: err.message || "Server error" });
  }
}
