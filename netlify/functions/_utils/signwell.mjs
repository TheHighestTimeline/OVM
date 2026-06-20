import { envBool } from "./http.mjs";
import { dueDate, formatMoney } from "./pricing.mjs";

export function buildOnboardingUrl(deal) {
  const base = process.env.ONBOARDING_FORM_URL || "";
  if (!base) return "";
  const url = new URL(base);
  url.searchParams.set("deal_id", deal.dealId);
  url.searchParams.set("client_name", deal.clientName);
  url.searchParams.set("business_name", deal.businessName);
  url.searchParams.set("package", deal.totals.basePackageName);
  url.searchParams.set("project_type", deal.projectType || "Custom Website");
  url.searchParams.set("project_total", String(deal.totals.projectTotal));
  return url.toString();
}

export async function createSignWellDocument(deal) {
  const mock = envBool("MOCK_MODE", true);
  const apiKey = process.env.SIGNWELL_API_KEY;
  const templateId = process.env.SIGNWELL_TEMPLATE_ID;

  if (mock || !apiKey || !templateId) {
    return {
      mock: true,
      documentId: `mock-signwell-${deal.dealId}`,
      signingUrl: ""
    };
  }

  const remainingDueDate = dueDate(30);
  const onboardingFormUrl = buildOnboardingUrl(deal);

  // SignWell template payloads can vary slightly depending on template setup.
  // Adjust recipient placeholder and merge field names to match your SignWell template.
  const payload = {
    test_mode: envBool("SIGNWELL_TEST_MODE", true),
    template_id: templateId,
    name: `OVM Project Agreement - ${deal.businessName}`,
    subject: `Your OneVibeMedia Project Agreement`,
    message: `Please review and sign your OneVibeMedia agreement. Your deposit is due after signing.`,
    recipients: [
      {
        placeholder_name: process.env.SIGNWELL_RECIPIENT_PLACEHOLDER || "Client",
        name: deal.clientName,
        email: deal.email
      }
    ],
    fields: [
      { api_id: "deal_id", value: deal.dealId },
      { api_id: "client_name", value: deal.clientName },
      { api_id: "business_name", value: deal.businessName },
      { api_id: "client_email", value: deal.email },
      { api_id: "client_phone", value: deal.phone || "" },
      { api_id: "project_type", value: deal.projectType || "Custom Website" },
      { api_id: "project_timeline", value: deal.timeline || "" },
      { api_id: "budget_range", value: deal.budgetRange || "" },
      { api_id: "inspiration_links", value: deal.inspirationLinks || "" },
      { api_id: "project_notes", value: deal.notes || "" },
      { api_id: "selected_package", value: deal.totals.basePackageName },
      { api_id: "selected_add_ons", value: deal.totals.addOnNames.join(", ") || "None" },
      { api_id: "project_total", value: formatMoney(deal.totals.projectTotal) },
      { api_id: "deposit_due", value: formatMoney(deal.totals.dueAtSigning) },
      { api_id: "remaining_due", value: formatMoney(deal.totals.remainingDue) },
      { api_id: "monthly_total", value: `${formatMoney(deal.totals.monthlyTotal)} / month` },
      { api_id: "remaining_due_date", value: remainingDueDate },
      {
        api_id: "payment_terms",
        value: "Due at signing equals 25% of the one-time project total plus the first month of selected monthly services. Remaining one-time project balance is due within 30 calendar days of signing. Project begins after agreement is signed and deposit is received/cleared."
      },
      { api_id: "onboarding_form_url", value: onboardingFormUrl }
    ],
    embedded_signing: true
  };

  const res = await fetch("https://www.signwell.com/api/v1/document_templates/documents", {
    method: "POST",
    headers: {
      "X-Api-Key": apiKey,
      "content-type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`SignWell error: ${JSON.stringify(data)}`);

  return {
    mock: false,
    documentId: data.id || data.document_id,
    signingUrl: data.embedded_signing_url || data.signing_url || data.recipients?.[0]?.embedded_signing_url || data.recipients?.[0]?.signing_url || "",
    raw: data
  };
}
