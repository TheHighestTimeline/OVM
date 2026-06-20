import { json, options, readJson, requireFields } from "./_utils/http.mjs";
import { calculateTotals, makeDealId } from "./_utils/pricing.mjs";
import { appendDealRow } from "./_utils/sheets.mjs";
import { createSignWellDocument, buildOnboardingUrl } from "./_utils/signwell.mjs";

export async function handler(event) {
  if (event.httpMethod === "OPTIONS") return options();
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });

  try {
    const body = await readJson(event);
    requireFields(body, ["clientSlug", "clientName", "businessName", "email", "basePackage"]);

    const totals = calculateTotals(body.basePackage, body.addOns || []);
    const dealId = makeDealId();

    const deal = {
      dealId,
      createdAt: new Date().toISOString(),
      status: "Contract Generated",
      clientSlug: body.clientSlug,
      clientName: body.clientName,
      businessName: body.businessName,
      email: body.email,
      phone: body.phone || "",
      projectType: body.projectType || "Custom Website",
      timeline: body.timeline || "",
      budgetRange: body.budgetRange || "",
      inspirationLinks: body.inspirationLinks || "",
      notes: body.notes || "",
      basePackage: body.basePackage,
      addOns: body.addOns || [],
      paymentMethod: body.paymentMethod || "stripe",
      totals
    };

    deal.onboardingUrl = buildOnboardingUrl(deal);

    const signwell = await createSignWellDocument(deal);
    deal.signwellDocumentId = signwell.documentId;

    await appendDealRow(deal);

    return json(200, {
      ok: true,
      dealId,
      totals,
      signwell: {
        mock: signwell.mock,
        documentId: signwell.documentId,
        signingUrl: signwell.signingUrl
      },
      onboardingUrl: deal.onboardingUrl
    });
  } catch (err) {
    console.error(err);
    return json(err.statusCode || 500, { error: err.message || "Server error" });
  }
}
