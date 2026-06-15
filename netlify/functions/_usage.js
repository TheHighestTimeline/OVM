// _usage.js — lightweight usage log (console only for standalone ovm-clients)
export async function logUsage({ model, inputTokens, outputTokens, action }) {
  try {
    console.log('[usage]', JSON.stringify({ model, inputTokens, outputTokens, action }));
  } catch {}
}
