export function json(statusCode, body, headers = {}) {
  return {
    statusCode,
    headers: {
      "content-type": "application/json",
      "access-control-allow-origin": "*",
      "access-control-allow-headers": "content-type,stripe-signature",
      ...headers
    },
    body: JSON.stringify(body)
  };
}

export function options() {
  return json(200, { ok: true });
}

export async function readJson(event) {
  if (!event.body) return {};
  return JSON.parse(event.body);
}

export function envBool(name, fallback = false) {
  const value = process.env[name];
  if (value === undefined || value === "") return fallback;
  return ["1", "true", "yes", "on"].includes(String(value).toLowerCase());
}

export function requireFields(obj, fields) {
  const missing = fields.filter(f => !obj[f]);
  if (missing.length) {
    const err = new Error(`Missing required field(s): ${missing.join(", ")}`);
    err.statusCode = 400;
    throw err;
  }
}
