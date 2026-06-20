import { json, options, readJson, requireFields } from "./_utils/http.mjs";
import { calculateTotals } from "./_utils/pricing.mjs";
import { createStripeCheckout } from "./_utils/stripe.mjs";
import { updateDealStatus } from "./_utils/sheets.mjs";

export async function handler(event) {
  if (event.httpMethod === "OPTIONS") return options();
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });

  try {
    const body = await readJson(event);
    requireFields(body, ["dealId", "businessName", "email", "basePackage"]);

    const totals = calculateTotals(body.basePackage, body.addOns || []);
    const session = await createStripeCheckout({
      dealId: body.dealId,
      deal: body,
      totals
    });

    await updateDealStatus(body.dealId, {
      status: "Stripe Checkout Created",
      paymentMethod: "stripe",
      stripeSessionId: session.id || ""
    });

    return json(200, {
      ok: true,
      id: session.id,
      url: session.url,
      mock: !!session.mock
    });
  } catch (err) {
    console.error(err);
    return json(err.statusCode || 500, { error: err.message || "Server error" });
  }
}
