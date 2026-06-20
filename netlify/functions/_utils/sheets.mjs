import crypto from "node:crypto";

const SCOPE = "https://www.googleapis.com/auth/spreadsheets";

function base64url(input) {
  return Buffer.from(input).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

async function getAccessToken() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  let privateKey = process.env.GOOGLE_PRIVATE_KEY;

  if (!email || !privateKey) return null;
  privateKey = privateKey.replace(/\\n/g, "\n");

  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const claim = {
    iss: email,
    scope: SCOPE,
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now
  };

  const unsigned = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(claim))}`;
  const signer = crypto.createSign("RSA-SHA256");
  signer.update(unsigned);
  signer.end();
  const signature = signer.sign(privateKey, "base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  const assertion = `${unsigned}.${signature}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion
    })
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Google token error: ${text}`);
  }

  const data = await res.json();
  return data.access_token;
}

function sheetConfig() {
  return {
    spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
    tab: process.env.GOOGLE_SHEETS_TAB || "Deals"
  };
}

export async function appendDealRow(deal) {
  const { spreadsheetId, tab } = sheetConfig();
  if (!spreadsheetId) {
    console.log("[sheets] skipped append; GOOGLE_SHEETS_SPREADSHEET_ID not set", deal);
    return { skipped: true };
  }

  const token = await getAccessToken();
  if (!token) return { skipped: true };

  const values = [[
    deal.dealId,
    deal.createdAt,
    deal.status || "Add-ons Selected",
    deal.clientSlug,
    deal.clientName,
    deal.businessName,
    deal.email,
    deal.phone || "",
    deal.totals.basePackageName,
    deal.totals.addOnNames.join(", "),
    deal.totals.projectTotal,
    deal.totals.dueAtSigning,
    deal.totals.remainingDue,
    deal.totals.monthlyTotal,
    deal.paymentMethod,
    deal.signwellDocumentId || "",
    deal.stripeSessionId || "",
    deal.stripePaymentStatus || "",
    deal.onboardingUrl || "",
    deal.notes || ""
  ]];

  const range = encodeURIComponent(`${tab}!A:T`);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

  const res = await fetch(url, {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify({ values })
  });

  if (!res.ok) throw new Error(`Google Sheets append failed: ${await res.text()}`);
  return res.json();
}

export async function updateDealStatus(dealId, updates = {}) {
  const { spreadsheetId, tab } = sheetConfig();
  if (!spreadsheetId) {
    console.log("[sheets] skipped update; GOOGLE_SHEETS_SPREADSHEET_ID not set", { dealId, updates });
    return { skipped: true };
  }

  const token = await getAccessToken();
  if (!token) return { skipped: true };

  const getUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(`${tab}!A:T`)}`;
  const getRes = await fetch(getUrl, { headers: { authorization: `Bearer ${token}` } });
  if (!getRes.ok) throw new Error(`Google Sheets read failed: ${await getRes.text()}`);
  const data = await getRes.json();
  const rows = data.values || [];
  const rowIndex = rows.findIndex(row => row[0] === dealId);
  if (rowIndex < 0) return { notFound: true };

  const rowNumber = rowIndex + 1;
  const current = rows[rowIndex];
  const next = [...current];
  const map = {
    status: 2,
    paymentMethod: 14,
    signwellDocumentId: 15,
    stripeSessionId: 16,
    stripePaymentStatus: 17,
    onboardingUrl: 18,
    notes: 19
  };

  for (const [key, value] of Object.entries(updates)) {
    if (map[key] !== undefined) next[map[key]] = value;
  }

  const updateUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(`${tab}!A${rowNumber}:T${rowNumber}`)}?valueInputOption=USER_ENTERED`;
  const res = await fetch(updateUrl, {
    method: "PUT",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify({ values: [next] })
  });
  if (!res.ok) throw new Error(`Google Sheets update failed: ${await res.text()}`);
  return res.json();
}
