// _audit.js — lightweight audit log (console only for standalone ovm-clients)
export async function logAudit({ event, actor, action, target, meta = {} }) {
  try {
    console.log('[audit]', JSON.stringify({ action, actor: actor?.email, target: target?.email, meta }));
  } catch {}
}
