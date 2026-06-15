// approval-respond.js
// Public (no auth) — client submits their approve/changes decisions.
import { getSupabase } from './_supabase.js';
import { ok, err, CORS } from './_notion.js';

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: CORS };
  if (event.httpMethod !== 'POST') return err(405, 'Method not allowed');

  let body;
  try { body = JSON.parse(event.body || '{}'); } catch { return err(400, 'Invalid JSON'); }

  const { token, responses } = body;
  // responses: [{ postId, decision: 'approved'|'changes', note }]
  if (!token || !Array.isArray(responses)) return err(400, 'Invalid payload');

  try {
    const sb = getSupabase();

    // Load session
    const { data, error } = await sb
      .from('app_state')
      .select('value')
      .eq('key', `approval:${token}`)
      .single();

    if (error || !data) return err(404, 'Approval not found');

    const session = data.value;
    if (session.status === 'complete') return ok({ message: 'Already submitted' });

    // Merge responses into session
    const responseMap = Object.fromEntries(responses.map(r => [r.postId, r]));
    session.posts = session.posts.map(p => {
      const r = responseMap[p.id];
      return r ? { ...p, decision: r.decision, note: r.note || '' } : p;
    });

    const allDecided = session.posts.every(p => p.decision !== null);
    session.status     = allDecided ? 'complete' : 'partial';
    session.respondedAt = new Date().toISOString();

    // Save updated session
    await sb
      .from('app_state')
      .update({ value: session })
      .eq('key', `approval:${token}`);

    // Update individual post statuses in posts table
    for (const r of responses) {
      if (!r.postId) continue;
      const newStatus = r.decision === 'approved' ? 'client_approved' : 'changes_requested';
      await sb
        .from('posts')
        .update({ status: newStatus, client_approval_note: r.note || null })
        .eq('id', r.postId);
    }

    return ok({ success: true, status: session.status });
  } catch (e) {
    return err(500, e.message);
  }
};
