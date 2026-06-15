// ════════════════════════════════════════════════════════════════════════════
// ApprovalSender — modal the manager opens to send posts to client via WhatsApp
// ════════════════════════════════════════════════════════════════════════════
import { useState } from 'react';
import { T, SANS, SERIF, MONO } from './_shared.jsx';

const PLAT_ICON  = { instagram:'◉', tiktok:'◈', facebook:'◇', youtube:'▶', threads:'◎' };
const PLAT_COLOR = { instagram:'#e1306c', tiktok:'#69c9d0', facebook:'#4f87f5', youtube:'#ff4444', threads:'#9ca3af' };

async function callApi(fn, body) {
  const res = await fetch(`/.netlify/functions/${fn}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || `${fn} failed (${res.status})`);
  return json;
}

// Compact post preview card inside the sender modal
function PostPreviewCard({ post }) {
  const col  = PLAT_COLOR[post.platform] || T.acc;
  const icon = PLAT_ICON[post.platform]  || '◇';
  const cap  = post.caption || '';
  return (
    <div style={{
      background: T.bg, border: `1px solid ${T.brd}`, borderRadius: 10,
      padding: '10px 12px', display: 'flex', gap: 10, alignItems: 'flex-start',
    }}>
      <span style={{ color: col, fontSize: 16, marginTop: 1, flexShrink: 0 }}>{icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: MONO, fontSize: 10, color: col, letterSpacing: '.06em', marginBottom: 4 }}>
          {post.platform?.toUpperCase()} · {post.type || 'post'}
        </div>
        <p style={{
          fontFamily: SANS, fontSize: 12, color: T.fg2, margin: 0,
          lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box',
          WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
        }}>
          {cap || <em style={{ color: T.fg3 }}>No caption</em>}
        </p>
      </div>
    </div>
  );
}

/**
 * ApprovalSender
 *
 * Props:
 *   posts        — array of draft post objects to send for approval
 *   client       — { id, name, phone? } — Airtable client/artist record
 *   onClose      — close the modal
 *   showToast    — toast fn
 *   onSent       — called with the session token after successful submission
 */
export default function ApprovalSender({ posts = [], client, onClose, showToast, onSent }) {
  const [phone,    setPhone]    = useState(client?.phone || '');
  const [note,     setNote]     = useState('');
  const [loading,  setLoading]  = useState(false);
  const [sent,     setSent]     = useState(null); // { token, approvalUrl, whatsappUrl }

  async function handleSend() {
    const cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 7) {
      showToast?.('Enter a valid phone number for WhatsApp', 'error');
      return;
    }
    if (!posts.length) {
      showToast?.('No posts selected', 'error');
      return;
    }
    setLoading(true);
    try {
      const result = await callApi('approval-create', {
        posts:       posts.map(p => p.id),
        clientId:    client?.id,
        clientName:  client?.name || 'Client',
        clientPhone: phone,
      });

      // Build WhatsApp deep-link
      const customNote = note.trim()
        ? `\n\n${note.trim()}`
        : '';
      const waText = encodeURIComponent(
        `Hi${client?.name ? ` ${client.name}` : ''}! Here are your posts for review. Please tap each one to approve or request changes:\n${result.approvalUrl}${customNote}`
      );
      const whatsappUrl = `https://wa.me/${cleanPhone}?text=${waText}`;

      setSent({ ...result, whatsappUrl });
      onSent?.(result.token);
      showToast?.('Approval link ready — open WhatsApp to send', 'success');
    } catch (e) {
      showToast?.(e.message || 'Something went wrong', 'error');
    } finally {
      setLoading(false);
    }
  }

  // ── Overlay ───────────────────────────────────────────────────────────────
  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0, background: '#00000088',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: 16,
      }}>
      <div style={{
        background: T.bg2, border: `1px solid ${T.brd}`, borderRadius: 18,
        width: '100%', maxWidth: 520, maxHeight: '90vh',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '18px 20px 14px', borderBottom: `1px solid ${T.brd}`,
          display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0,
        }}>
          <span style={{ fontSize: 20 }}>✉</span>
          <div>
            <div style={{ fontFamily: SERIF, fontSize: 17, color: T.fg }}>Send for Approval</div>
            <div style={{ fontFamily: MONO, fontSize: 10, color: T.fg3, letterSpacing: '.06em', marginTop: 2 }}>
              {posts.length} post{posts.length !== 1 ? 's' : ''} · {client?.name || 'Client'}
            </div>
          </div>
          <button onClick={onClose} style={{
            marginLeft: 'auto', background: 'none', border: 'none',
            color: T.fg3, fontSize: 20, cursor: 'pointer', lineHeight: 1,
          }}>×</button>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
          {!sent ? (
            <>
              {/* Post previews */}
              <div style={{ fontFamily: MONO, fontSize: 10, color: T.fg3, letterSpacing: '.08em', marginBottom: 8 }}>
                POSTS BEING SENT
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                {posts.map((p, i) => <PostPreviewCard key={p.id || i} post={p} />)}
              </div>

              {/* Phone */}
              <label style={{ display: 'block', marginBottom: 14 }}>
                <div style={{ fontFamily: MONO, fontSize: 10, color: T.fg3, letterSpacing: '.08em', marginBottom: 6 }}>
                  CLIENT WHATSAPP NUMBER
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+1 555 000 0000"
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    padding: '10px 12px', background: T.bg, border: `1px solid ${T.brd}`,
                    borderRadius: 8, color: T.fg, fontFamily: SANS, fontSize: 13, outline: 'none',
                  }}
                />
                <div style={{ fontFamily: SANS, fontSize: 11, color: T.fg3, marginTop: 4 }}>
                  Include country code, e.g. +1 for US/Canada
                </div>
              </label>

              {/* Optional note */}
              <label style={{ display: 'block', marginBottom: 4 }}>
                <div style={{ fontFamily: MONO, fontSize: 10, color: T.fg3, letterSpacing: '.08em', marginBottom: 6 }}>
                  ADD A NOTE TO CLIENT (optional)
                </div>
                <textarea
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="e.g. 'These are for next week's campaign — let us know if anything needs tweaking!'"
                  rows={3}
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    padding: '10px 12px', background: T.bg, border: `1px solid ${T.brd}`,
                    borderRadius: 8, color: T.fg, fontFamily: SANS, fontSize: 13,
                    resize: 'none', outline: 'none', lineHeight: 1.55,
                  }}
                />
              </label>
            </>
          ) : (
            /* ── Success state ── */
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>✓</div>
              <div style={{ fontFamily: SERIF, fontSize: 20, color: T.fg, marginBottom: 6 }}>
                Approval link created
              </div>
              <p style={{ fontFamily: SANS, fontSize: 13, color: T.fg2, lineHeight: 1.6, marginBottom: 20 }}>
                Click the button below to open WhatsApp with the message pre-filled.
                Once you send it, the client can review and approve right on their phone.
              </p>

              {/* Approval URL (read-only, for copying) */}
              <div style={{ background: T.bg, border: `1px solid ${T.brd}`, borderRadius: 8, padding: '8px 12px', marginBottom: 16, textAlign: 'left' }}>
                <div style={{ fontFamily: MONO, fontSize: 9, color: T.fg3, letterSpacing: '.08em', marginBottom: 4 }}>APPROVAL LINK</div>
                <div style={{ fontFamily: MONO, fontSize: 11, color: T.acc, wordBreak: 'break-all' }}>
                  {sent.approvalUrl}
                </div>
              </div>

              <button
                onClick={() => window.open(sent.whatsappUrl, '_blank')}
                style={{
                  display: 'block', width: '100%', padding: '14px',
                  background: '#25d366', border: 'none', borderRadius: 12,
                  color: '#fff', fontFamily: SANS, fontSize: 15, fontWeight: 700,
                  cursor: 'pointer', marginBottom: 10,
                }}>
                Open in WhatsApp →
              </button>
              <button
                onClick={() => { navigator.clipboard.writeText(sent.approvalUrl); showToast?.('Link copied!', 'success'); }}
                style={{
                  display: 'block', width: '100%', padding: '11px',
                  background: T.brd, border: 'none', borderRadius: 12,
                  color: T.fg2, fontFamily: SANS, fontSize: 13, cursor: 'pointer',
                }}>
                Copy Link Only
              </button>
            </div>
          )}
        </div>

        {/* Footer — only shown pre-send */}
        {!sent && (
          <div style={{ padding: '14px 20px', borderTop: `1px solid ${T.brd}`, flexShrink: 0, display: 'flex', gap: 10 }}>
            <button onClick={onClose} style={{
              flex: 1, padding: '11px', background: T.brd, border: 'none',
              borderRadius: 10, color: T.fg2, fontFamily: SANS, fontSize: 13, cursor: 'pointer',
            }}>
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={loading}
              style={{
                flex: 2, padding: '11px', background: T.acc, border: 'none',
                borderRadius: 10, color: '#fff', fontFamily: SANS, fontSize: 14,
                fontWeight: 600, cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.7 : 1,
              }}>
              {loading ? 'Creating link…' : 'Create Approval Link →'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
