// approval-respond — public (no auth) — client submits approve/changes decisions
import { airtableFindByField, airtableUpdate, APPROVAL_SESSIONS_MAP, POSTS_MAP } from './_airtable.js';
import { ok, err, CORS } from './_notion.js';

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: CORS };
  if (event.httpMethod !== 'POST') return err(405, 'Method not allowed');

  let body;
  try { body = JSON.parse(event.body || '{}'); } catch { return err(400, 'Invalid JSON'); }

  const { token, responses } = body;
  if (!token || !Array.isArray(responses)) return err(400, 'Invalid payload');

  try {
    // 1. Find the approval session record
    const records = await airtableFindByField('Approval Sessions', APPROVAL_SESSIONS_MAP.token, token);
    if (!records.length) return err(404, 'Approval not found');

    const sessionRecord = records[0];
    const raw     = sessionRecord.fields?.[APPROVAL_SESSIONS_MAP.sessionData];
    const session = raw ? JSON.parse(raw) : null;
    if (!session) return err(404, 'Session data missing');

    if (session.status === 'complete') return ok({ message: 'Already submitted' });

    // 2. Merge responses into session
    const responseMap = Object.fromEntries(responses.map(r => [r.postId, r]));
    session.posts = session.posts.map(p => {
      const r = responseMap[p.id];
      return r ? { ...p, decision: r.decision, note: r.note || '' } : p;
    });

    const allDecided    = session.posts.every(p => p.decision !== null);
    session.status      = allDecided ? 'complete' : 'partial';
    session.respondedAt = new Date().toISOString();

    // 3. Save updated session back to Airtable
    await airtableUpdate('Approval Sessions', sessionRecord.id, {
      [APPROVAL_SESSIONS_MAP.sessionData]: JSON.stringify(session),
      [APPROVAL_SESSIONS_MAP.status]:      session.status,
    });

    // 4. Update each post's status + note in Airtable
    for (const r of responses) {
      if (!r.postId) continue;
      const newStatus = r.decision === 'approved' ? 'client_approved' : 'changes_requested';
      await airtableUpdate('Posts', r.postId, {
        [POSTS_MAP.status]:             newStatus,
        [POSTS_MAP.clientApprovalNote]: r.note || '',
      });
    }

    return ok({ success: true, status: session.status });
  } catch (e) {
    console.error('[approval-respond]', e.message);
    return err(500, e.message);
  }
};
