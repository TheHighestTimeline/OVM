import { json } from "./_utils/http.mjs";
import { updateDealStatus } from "./_utils/sheets.mjs";

export async function handler(event) {
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });

  try {
    const payload = JSON.parse(event.body || "{}");

    // SignWell webhook payload shapes can vary by event.
    // This tries common locations. Adjust once you inspect a real webhook payload.
    const documentId = payload.document_id || payload.document?.id || payload.id;
    const status = payload.status || payload.document?.status || payload.event || payload.type;
    const dealId =
      payload.metadata?.deal_id ||
      payload.document?.metadata?.deal_id ||
      payload.fields?.deal_id ||
      payload.document?.fields?.deal_id;

    if (dealId && String(status).toLowerCase().includes("complete")) {
      await updateDealStatus(dealId, {
        status: "Contract Signed",
        signwellDocumentId: documentId || ""
      });
    }

    return json(200, { ok: true });
  } catch (err) {
    console.error(err);
    return json(500, { error: err.message || "Server error" });
  }
}
