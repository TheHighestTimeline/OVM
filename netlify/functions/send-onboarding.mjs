import { json, options, readJson, requireFields } from "./_utils/http.mjs";
import { calculateTotals } from "./_utils/pricing.mjs";
import { sendOnboardingEmail } from "./_utils/email.mjs";
import { updateDealStatus } from "./_utils/sheets.mjs";

export async function handler(event) {
  if (event.httpMethod === "OPTIONS") return options();
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });

  try {
    const body = await readJson(event);
    requireFields(body, ["dealId", "clientName", "businessName", "email", "basePackage"]);

    const deal = {
      ...body,
      totals: calculateTotals(body.basePackage, body.addOns || [])
    };

    const result = await sendOnboardingEmail(deal);
    await updateDealStatus(body.dealId, {
      status: "Onboarding Sent",
      onboardingUrl: result.onboardingUrl || ""
    });

    return json(200, { ok: true, result });
  } catch (err) {
    console.error(err);
    return json(err.statusCode || 500, { error: err.message || "Server error" });
  }
}
