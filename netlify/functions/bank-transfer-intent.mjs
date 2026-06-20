import { json, options, readJson, requireFields } from "./_utils/http.mjs";
import { updateDealStatus } from "./_utils/sheets.mjs";

export async function handler(event) {
  if (event.httpMethod === "OPTIONS") return options();
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });

  try {
    const body = await readJson(event);
    requireFields(body, ["dealId"]);

    await updateDealStatus(body.dealId, {
      status: "Bank Transfer Pending",
      paymentMethod: "bank_transfer",
      notes: "Client viewed bank transfer details. Confirm manually when funds clear."
    });

    return json(200, {
      ok: true,
      bank: {
        accountName: process.env.BANK_ACCOUNT_NAME || "OneVibeMediaGroup",
        bankName: process.env.BANK_NAME || "",
        routingNumber: process.env.BANK_ROUTING_NUMBER || "",
        accountNumber: process.env.BANK_ACCOUNT_NUMBER || "",
        wireDetails: process.env.BANK_WIRE_DETAILS || "",
        zelleEmail: process.env.BANK_ZELLE_EMAIL || "",
        memo: `${process.env.BANK_MEMO_PREFIX || "OVM"}-${body.dealId}`
      }
    });
  } catch (err) {
    console.error(err);
    return json(err.statusCode || 500, { error: err.message || "Server error" });
  }
}
