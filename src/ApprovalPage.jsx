// ════════════════════════════════════════════════════════════════════════════
// ApprovalPage — public, no login required.
// Client lands here from the WhatsApp link and taps Approve / Request Changes
// on each post. Styled to feel native on mobile.
// ════════════════════════════════════════════════════════════════════════════
import { useState, useEffect } from 'react';

const T = {
  bg:   '#0e1014', bg2: '#161922', card: '#1f232e',
  fg:   '#f0ede8', fg2: '#a6abb8', fg3: '#6b7180',
  acc:  '#d96b3a', grn: '#22c58b', red: '#f25c5c', amb: '#f5a623',
  brd:  '#252a36',
};
const SERIF = "'Fraunces',Georgia,serif";
const SANS  = "'Geist',system-ui,sans-serif";
const MONO  = "'Geist Mono',monospace";

const PLAT_COLOR = { instagram:'#e1306c', tiktok:'#69c9d0', facebook:'#4f87f5', youtube:'#ff4444', threads:'#9ca3af' };
const PLAT_ICON  = { instagram:'◉', tiktok:'◈', facebook:'◇', youtube:'▶', threads:'◎' };

async function fetchSession(token) {
  const res = await fetch(`/.netlify/functions/approval-get?token=${token}`);
  if (!res.ok) throw new Error('Approval not found');
  return res.json();
}

async function submitResponses(token, responses) {
  const res = await fetch('/.netlify/functions/approval-respond', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, responses }),
  });
  if (!res.ok) throw new Error('Submit failed');
  return res.json();
}

// ── Individual post approval card ─────────────────────────────────────────────
function PostCard({ post, decision, note, onDecide, onNote, index }) {
  const platColor = PLAT_COLOR[post.platform] || T.acc;
  const platIcon  = PLAT_ICON[post.platform]  || '◇';
  const [showNote, setShowNote] = useState(false);

  return (
    <div style={{
      background: T.card,
      border: `1px solid ${decision === 'approved' ? T.grn : decision === 'changes' ? T.amb : T.brd}`,
      borderRadius: 16, marginBottom: 16, overflow: 'hidden',
      boxShadow: decision ? `0 0 0 1px ${decision === 'approved' ? T.grn : T.amb}30` : 'none',
      transition: 'border-color .2s, box-shadow .2s',
    }}>
      {/* Platform badge */}
      <div style={{ padding: '12px 16px', borderBottom: `1px solid ${T.brd}`, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ color: platColor, fontSize: 18 }}>{platIcon}</span>
        <span style={{ color: platColor, fontFamily: MONO, fontSize: 11, letterSpacing: '.06em', textTransform: 'uppercase' }}>
          {post.platform}
        </span>
        {post.type && (
          <span style={{ marginLeft: 'auto', color: T.fg3, fontFamily: MONO, fontSize: 10, letterSpacing: '.06em' }}>
            {post.type.toUpperCase()}
          </span>
        )}
      </div>

      {/* Asset preview */}
      {post.asset_url && (
        <div style={{ background: T.bg2, height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          <img src={post.asset_url} alt="Post asset" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
            onError={e => { e.currentTarget.style.display = 'none'; }} />
        </div>
      )}

      {/* Caption */}
      <div style={{ padding: '14px 16px' }}>
        {post.caption && (
          <p style={{ fontSize: 14, color: T.fg, lineHeight: 1.65, whiteSpace: 'pre-wrap', margin: '0 0 10px' }}>
            {post.caption}
          </p>
        )}
        {post.hashtags && (
          <p style={{ fontSize: 12, color: platColor, fontFamily: MONO, margin: 0, wordBreak: 'break-word' }}>
            {post.hashtags}
          </p>
        )}
      </div>

      {/* Decision buttons */}
      <div style={{ padding: '0 16px 14px', display: 'flex', gap: 8 }}>
        <button
          onClick={() => { onDecide('approved'); setShowNote(false); }}
          style={{
            flex: 1, padding: '12px', borderRadius: 10, border: 'none', cursor: 'pointer',
            fontFamily: SANS, fontSize: 13, fontWeight: 600,
            background: decision === 'approved' ? T.grn : T.brd,
            color: decision === 'approved' ? '#0e1014' : T.fg2,
            transition: 'all .15s',
          }}>
          {decision === 'approved' ? '✓ Approved' : 'Approve'}
        </button>
        <button
          onClick={() => { onDecide('changes'); setShowNote(true); }}
          style={{
            flex: 1, padding: '12px', borderRadius: 10, border: 'none', cursor: 'pointer',
            fontFamily: SANS, fontSize: 13, fontWeight: 600,
            background: decision === 'changes' ? T.amb : T.brd,
            color: decision === 'changes' ? '#0e1014' : T.fg2,
            transition: 'all .15s',
          }}>
          {decision === 'changes' ? '✎ Changes' : 'Request Changes'}
        </button>
      </div>

      {/* Note for changes */}
      {(showNote || decision === 'changes') && (
        <div style={{ padding: '0 16px 14px' }}>
          <textarea
            value={note || ''}
            onChange={e => onNote(e.target.value)}
            placeholder="What would you like changed? (optional)"
            rows={3}
            style={{
              width: '100%', boxSizing: 'border-box', padding: '10px 12px',
              background: T.bg, border: `1px solid ${T.amb}`,
              borderRadius: 8, color: T.fg, fontFamily: SANS, fontSize: 13,
              resize: 'none', outline: 'none', lineHeight: 1.6,
            }}
          />
        </div>
      )}
    </div>
  );
}

// ── Done screen ───────────────────────────────────────────────────────────────
function DoneScreen({ clientName, allApproved }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 24px' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>{allApproved ? '✓' : '✎'}</div>
      <h2 style={{ fontFamily: SERIF, fontSize: 26, fontWeight: 400, color: T.fg, margin: '0 0 10px' }}>
        {allApproved ? 'All posts approved!' : 'Feedback sent!'}
      </h2>
      <p style={{ color: T.fg2, fontSize: 14, fontFamily: SANS, lineHeight: 1.6, maxWidth: 320, margin: '0 auto' }}>
        Thanks{clientName ? `, ${clientName}` : ''}. The OneVibe team has been notified and will take care of the rest.
      </p>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function ApprovalPage({ token }) {
  const [session,   setSession]  = useState(null);
  const [loading,   setLoading]  = useState(true);
  const [error,     setError]    = useState(null);
  const [decisions, setDecisions] = useState({}); // postId → 'approved'|'changes'
  const [notes,     setNotes]    = useState({});   // postId → string
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSession(token)
      .then(s => {
        setSession(s);
        // Pre-fill any existing decisions (if client is returning)
        const preDecisions = {};
        const preNotes = {};
        for (const p of s.posts || []) {
          if (p.decision) preDecisions[p.id] = p.decision;
          if (p.note)     preNotes[p.id]     = p.note;
        }
        setDecisions(preDecisions);
        setNotes(preNotes);
        if (s.status === 'complete') setSubmitted(true);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  async function handleSubmit() {
    const posts = session?.posts || [];
    const undecided = posts.filter(p => !decisions[p.id]);
    if (undecided.length) {
      alert(`Please approve or request changes on all ${posts.length} post${posts.length !== 1 ? 's' : ''} before submitting.`);
      return;
    }
    setSubmitting(true);
    try {
      const responses = posts.map(p => ({
        postId:   p.id,
        decision: decisions[p.id],
        note:     notes[p.id] || '',
      }));
      await submitResponses(token, responses);
      setSubmitted(true);
    } catch (e) {
      alert('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  const decidedCount = Object.keys(decisions).length;
  const totalCount   = session?.posts?.length || 0;
  const allApproved  = session?.posts?.every(p => decisions[p.id] === 'approved');

  // ── Loading ──
  if (loading) return (
    <div style={{ minHeight: '100vh', background: T.bg, display: 'grid', placeItems: 'center', fontFamily: SANS }}>
      <div style={{ color: T.fg3, fontFamily: MONO, fontSize: 12, letterSpacing: '.1em' }}>Loading…</div>
    </div>
  );

  // ── Error ──
  if (error) return (
    <div style={{ minHeight: '100vh', background: T.bg, display: 'grid', placeItems: 'center', fontFamily: SANS, padding: 24 }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 32, marginBottom: 12, color: T.fg3 }}>◇</div>
        <p style={{ color: T.fg2, fontSize: 14 }}>This approval link is invalid or has expired.</p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: T.bg, fontFamily: SANS, color: T.fg }}>
      {/* Header */}
      <div style={{
        background: T.bg2, borderBottom: `1px solid ${T.brd}`,
        padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 10,
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <span style={{ fontFamily: SERIF, fontSize: 20, color: T.acc }}>◐</span>
        <div>
          <div style={{ fontFamily: SERIF, fontSize: 15, color: T.fg, lineHeight: 1 }}>OneVibe</div>
          <div style={{ fontFamily: MONO, fontSize: 9, color: T.fg3, letterSpacing: '.12em', marginTop: 2 }}>POST APPROVAL</div>
        </div>
        {!submitted && (
          <div style={{ marginLeft: 'auto', fontFamily: MONO, fontSize: 11, color: T.fg3 }}>
            {decidedCount}/{totalCount} reviewed
          </div>
        )}
      </div>

      <div style={{ maxWidth: 560, margin: '0 auto', padding: '24px 16px 100px' }}>
        {submitted ? (
          <DoneScreen clientName={session?.clientName} allApproved={allApproved} />
        ) : (
          <>
            {/* Intro */}
            <div style={{ marginBottom: 24, paddingBottom: 20, borderBottom: `1px solid ${T.brd}` }}>
              <h1 style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 400, color: T.fg, margin: '0 0 6px' }}>
                Your posts for approval
              </h1>
              <p style={{ color: T.fg2, fontSize: 13, margin: 0, lineHeight: 1.6 }}>
                Review each post below and tap <strong style={{ color: T.fg }}>Approve</strong> or{' '}
                <strong style={{ color: T.fg }}>Request Changes</strong>. When you're done, hit Submit.
              </p>
            </div>

            {/* Post cards */}
            {(session?.posts || []).map((post, i) => (
              <PostCard
                key={post.id || i}
                post={post}
                index={i}
                decision={decisions[post.id] || null}
                note={notes[post.id] || ''}
                onDecide={d => setDecisions(prev => ({ ...prev, [post.id]: d }))}
                onNote={n => setNotes(prev => ({ ...prev, [post.id]: n }))}
              />
            ))}
          </>
        )}
      </div>

      {/* Sticky submit bar */}
      {!submitted && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          background: T.bg2, borderTop: `1px solid ${T.brd}`,
          padding: '12px 16px', display: 'flex', gap: 10, alignItems: 'center',
        }}>
          <div style={{ flex: 1, fontFamily: MONO, fontSize: 11, color: T.fg3 }}>
            {decidedCount < totalCount
              ? `${totalCount - decidedCount} post${totalCount - decidedCount !== 1 ? 's' : ''} left to review`
              : 'All posts reviewed — ready to submit'}
          </div>
          <button
            onClick={handleSubmit}
            disabled={submitting || decidedCount < totalCount}
            style={{
              padding: '12px 28px', borderRadius: 10, border: 'none', cursor: 'pointer',
              background: decidedCount === totalCount ? T.acc : T.brd,
              color: decidedCount === totalCount ? '#0e1014' : T.fg3,
              fontFamily: SANS, fontSize: 14, fontWeight: 600,
              opacity: submitting ? 0.6 : 1, transition: 'all .15s',
            }}>
            {submitting ? 'Submitting…' : 'Submit →'}
          </button>
        </div>
      )}
    </div>
  );
}
