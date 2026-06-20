import { formatMoney } from "./pricing.mjs";
import { buildOnboardingUrl } from "./signwell.mjs";

export async function sendOnboardingEmail(deal) {
  const onboardingUrl = buildOnboardingUrl(deal);
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.OVM_FROM_EMAIL || "OneVibeMedia <hello@onevibemedia.shop>";

  const subject = "Welcome to OneVibeMedia — Next Steps";
  const html = `
    <div style="font-family:Inter,Arial,sans-serif;line-height:1.6;color:#111827">
      <h1>Welcome to OneVibeMedia</h1>
      <p>Hey ${escapeHtml(deal.clientName)},</p>
      <p>We’re excited to get started. Your agreement has been signed and your deposit has been received/confirmed.</p>
      <p>The next step is to complete your onboarding form whenever you have time. The sooner we receive it, the sooner we can begin moving your project forward.</p>
      <p><a href="${onboardingUrl}" style="background:#144D83;color:#fff;padding:12px 18px;border-radius:999px;text-decoration:none;font-weight:700">Open Onboarding Form</a></p>
      <h3>Project Summary</h3>
      <ul>
        <li><strong>Deal ID:</strong> ${deal.dealId}</li>
        <li><strong>Package:</strong> ${deal.totals.basePackageName}</li>
        <li><strong>Add-ons:</strong> ${deal.totals.addOnNames.join(", ") || "None"}</li>
        <li><strong>Project Total:</strong> ${formatMoney(deal.totals.projectTotal)}</li>
        <li><strong>Deposit / Due at Signing:</strong> ${formatMoney(deal.totals.dueAtSigning)}</li>
        <li><strong>Remaining Project Balance:</strong> ${formatMoney(deal.totals.remainingDue)} due in 30 days</li>
      </ul>
      <p>— OneVibeMedia</p>
    </div>
  `;

  if (!apiKey) {
    console.log("[email] skipped; RESEND_API_KEY not set", { to: deal.email, subject, onboardingUrl });
    return { skipped: true, onboardingUrl };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json"
    },
    body: JSON.stringify({
      from,
      to: [deal.email],
      subject,
      html
    })
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Email send failed: ${JSON.stringify(data)}`);
  return { ...data, onboardingUrl };
}

function escapeHtml(str = "") {
  return String(str).replace(/[&<>"']/g, s => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[s]));
}
