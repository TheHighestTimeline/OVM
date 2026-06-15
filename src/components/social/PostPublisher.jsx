// ════════════════════════════════════════════════════════════════════════════
// PostPublisher — mobile posting kit
//
// A bottom-sheet overlay the manager pulls up when it's time to actually post.
// Shows the full caption + hashtags with one-tap copy, platform deep-links
// (X/Threads pre-fill the text; Instagram/TikTok/Facebook copy-then-open),
// asset preview, and "Mark as Posted" confirmation.
//
// Designed for phone use: large tap targets, no hover states, high contrast.
// ════════════════════════════════════════════════════════════════════════════
import { useState, useRef } from 'react';

const T = {
  bg:   '#0e1014', bg2: '#161922', card: '#1f232e',
  fg:   '#f0ede8', fg2: '#a6abb8', fg3: '#6b7180',
  acc:  '#d96b3a', grn: '#22c58b', red: '#f25c5c', amb: '#f5a623',
  brd:  '#252a36',
};
const SERIF = "'Fraunces',Georgia,serif";
const SANS  = "'Geist',system-ui,sans-serif";
const MONO  = "'Geist Mono',monospace";

const PLATFORMS = {
  instagram: {
    label: 'Instagram',
    color: '#e1306c',
    icon: '◉',
    // Instagram doesn't allow pre-filled text via URL, so copy-then-open
    getUrl: () => 'https://www.instagram.com/',
    note: 'Caption copied — paste it when you create your post',
    copyFirst: true,
  },
  tiktok: {
    label: 'TikTok',
    color: '#69c9d0',
    icon: '◈',
    getUrl: () => 'https://www.tiktok.com/upload',
    note: 'Caption copied — paste it in TikTok',
    copyFirst: true,
  },
  facebook: {
    label: 'Facebook',
    color: '#4f87f5',
    icon: '◇',
    // Facebook sharer can pre-fill, but for full posts use composer
    getUrl: (caption) => `https://m.facebook.com/`,
    note: 'Caption copied — paste it in Facebook',
    copyFirst: true,
  },
  twitter: {
    label: 'X (Twitter)',
    color: '#e7e9ea',
    icon: '✕',
    // X supports pre-filled text via intent URL ✓
    getUrl: (caption, hashtags) => {
      const text = [caption, hashtags].filter(Boolean).join('\n\n');
      return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text.slice(0, 280))}`;
    },
    note: 'Opens X with your caption pre-filled',
    copyFirst: false,
  },
  threads: {
    label: 'Threads',
    color: '#9ca3af',
    icon: '◎',
    // Threads supports intent URL ✓
    getUrl: (caption, hashtags) => {
      const text = [caption, hashtags].filter(Boolean).join('\n\n');
      return `https://www.threads.net/intent/post?text=${encodeURIComponent(text.slice(0, 500))}`;
    },
    note: 'Opens Threads with your caption pre-filled',
    copyFirst: false,
  },
  youtube: {
    label: 'YouTube',
    color: '#ff4444',
    icon: '▶',
    getUrl: () => 'https://studio.youtube.com/',
    note: 'Caption copied — paste it in YouTube Studio',
    copyFirst: true,
  },
};

// ── Tiny copy hook with visual feedback ──────────────────────────────────────
function useCopy(text) {
  const [copied, setCopied] = useState(false);
  const timer = useRef(null);
  function copy() {
    navigator.clipboard.writeText(text || '').then(() => {
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2000);
    });
  }
  return [copied, copy];
}

// ── Big copy button ───────────────────────────────────────────────────────────
function CopyBtn({ text, label = 'Copy', style = {} }) {
  const [copied, doCopy] = useCopy(text);
  return (
    <button
      onClick={doCopy}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        padding: '13px 20px', borderRadius: 12, border: 'none', cursor: 'pointer',
        background: copied ? T.grn + '28' : T.brd,
        color: copied ? T.grn : T.fg2,
        fontFamily: SANS, fontSize: 14, fontWeight: 600,
        transition: 'all .15s', ...style,
      }}>
      {copied ? '✓ Copied!' : `Copy ${label}`}
    </button>
  );
}

// ── One-tap mega action — saves image to share sheet AND copies caption ────────
function OneTapAction({ post, caption, hashtags, combined }) {
  const [phase, setPhase] = useState('idle'); // idle | copying | sharing | done

  async function handleOneTap() {
    if (!post.asset_url) {
      // No image — just copy text
      await navigator.clipboard.writeText(combined).catch(() => {});
      setPhase('done');
      setTimeout(() => setPhase('idle'), 2500);
      return;
    }
    setPhase('copying');
    // 1. Copy caption to clipboard first
    await navigator.clipboard.writeText(combined).catch(() => {});
    setPhase('sharing');
    // 2. Fetch image and trigger share sheet
    try {
      const res  = await fetch(post.asset_url);
      const blob = await res.blob();
      const ext  = blob.type.includes('png') ? 'png' : 'jpg';
      const file = new File([blob], `post.${ext}`, { type: blob.type });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Post' });
      } else {
        // fallback download
        const burl = URL.createObjectURL(blob);
        Object.assign(document.createElement('a'), { href: burl, download: `post.${ext}` }).click();
        URL.revokeObjectURL(burl);
      }
    } catch (e) {
      if (e.name !== 'AbortError') {
        // If share fails, at least text is copied — open image separately
        window.open(post.asset_url, '_blank');
      }
    }
    setPhase('done');
    setTimeout(() => setPhase('idle'), 3000);
  }

  const label = phase === 'copying' ? 'Copying text…'
              : phase === 'sharing' ? 'Opening share sheet…'
              : phase === 'done'    ? '✓ Text copied + image shared!'
              : post.asset_url      ? '⚡ Save Image + Copy Text'
              : '⚡ Copy Caption + Hashtags';

  return (
    <button
      onClick={handleOneTap}
      disabled={phase !== 'idle'}
      style={{
        display: 'block', width: '100%', padding: '18px 16px', marginBottom: 16,
        borderRadius: 16, border: 'none', cursor: phase !== 'idle' ? 'wait' : 'pointer',
        background: phase === 'done'
          ? `linear-gradient(135deg, ${T.grn}, #1a9e6e)`
          : `linear-gradient(135deg, ${T.acc}, #b85229)`,
        color: '#fff', fontFamily: SANS, fontSize: 17, fontWeight: 700,
        boxShadow: phase === 'idle' ? `0 4px 20px ${T.acc}44` : 'none',
        transition: 'all .2s', opacity: phase !== 'idle' && phase !== 'done' ? 0.8 : 1,
        letterSpacing: '-.01em',
      }}>
      {label}
    </button>
  );
}

// ── Image saver — Web Share API (opens native iOS/Android share sheet) ─────────
// On iOS: share sheet lets user "Save Image" to camera roll, or pick Instagram/TikTok directly
// On Android: same — share to Downloads, Gallery, or directly to any app
// Fallback: <a download> which saves to Downloads on Android or Files on iOS
function ImageSaver({ url, caption }) {
  const [state, setState] = useState('idle'); // idle | loading | done | error | fallback

  async function handleSave() {
    setState('loading');
    try {
      // Fetch image as blob
      const res  = await fetch(url);
      const blob = await res.blob();
      const ext  = blob.type.includes('png') ? 'png' : blob.type.includes('gif') ? 'gif' : 'jpg';
      const file = new File([blob], `post.${ext}`, { type: blob.type });

      if (navigator.canShare?.({ files: [file] })) {
        // Web Share API with files — opens native share sheet ✓
        await navigator.share({
          files: [file],
          title: 'Post Image',
        });
        setState('done');
        setTimeout(() => setState('idle'), 3000);
      } else {
        // Fallback: trigger browser download
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = `post.${ext}`;
        a.click();
        URL.revokeObjectURL(blobUrl);
        setState('fallback');
        setTimeout(() => setState('idle'), 3000);
      }
    } catch (e) {
      if (e.name === 'AbortError') { setState('idle'); return; } // user cancelled share
      // CORS fallback — open image in new tab so user can long-press save
      setState('error');
    }
  }

  // Compact image preview + action buttons
  return (
    <div style={{ marginBottom: 16, borderRadius: 14, overflow: 'hidden', background: T.bg, border: `1px solid ${T.brd}` }}>
      {/* Image preview — large enough to see, tappable to open full size */}
      <div style={{ position: 'relative', background: '#000', cursor: 'pointer' }} onClick={() => window.open(url, '_blank')}>
        <img
          src={url}
          alt="Post asset"
          style={{ width: '100%', maxHeight: 300, objectFit: 'contain', display: 'block' }}
          onError={e => { e.currentTarget.parentElement.parentElement.style.display = 'none'; }}
        />
        <div style={{
          position: 'absolute', bottom: 8, right: 8,
          background: '#00000088', borderRadius: 6, padding: '3px 8px',
          fontFamily: MONO, fontSize: 10, color: 'rgba(255,255,255,.7)',
        }}>tap to fullscreen</div>
      </div>

      {/* Action row */}
      <div style={{ padding: '10px 12px', display: 'flex', gap: 8 }}>
        {/* Primary: Save to camera roll / share sheet */}
        <button
          onClick={handleSave}
          disabled={state === 'loading'}
          style={{
            flex: 2, padding: '13px 10px', borderRadius: 10, border: 'none', cursor: 'pointer',
            background: state === 'done' ? T.grn + '28' : state === 'error' ? T.red + '22' : T.acc + '22',
            color: state === 'done' ? T.grn : state === 'error' ? T.red : T.acc,
            fontFamily: SANS, fontSize: 13, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
            transition: 'all .15s',
          }}>
          {state === 'loading' ? '⏳ Fetching…'
           : state === 'done'    ? '✓ Shared!'
           : state === 'fallback' ? '✓ Downloaded!'
           : state === 'error'   ? 'Long-press to save'
           : '⬇ Save Image'}
        </button>

        {/* Fallback: open in browser tab (long-press save on iOS if Web Share fails) */}
        <button
          onClick={() => window.open(url, '_blank')}
          style={{ flex: 1, padding: '13px 8px', borderRadius: 10, border: `1px solid ${T.brd}`, background: 'none', color: T.fg3, fontFamily: SANS, fontSize: 12, cursor: 'pointer' }}>
          Open ↗
        </button>
      </div>

      {/* Contextual hint */}
      <div style={{ padding: '0 12px 10px', fontFamily: SANS, fontSize: 11, color: T.fg3, lineHeight: 1.5 }}>
        {state === 'error'
          ? 'Tap "Open ↗" then long-press the image to save to your camera roll'
          : 'Tapping "Save Image" opens your share sheet — choose Save Image or post directly to Instagram/TikTok'}
      </div>
    </div>
  );
}

// ── Platform launch button ────────────────────────────────────────────────────
function PlatformBtn({ platform: key, caption, hashtags }) {
  const p = PLATFORMS[key];
  if (!p) return null;
  const [state, setState] = useState('idle'); // idle | copied | opening

  async function handleLaunch() {
    const url = p.getUrl(caption, hashtags);
    if (p.copyFirst) {
      const fullText = [caption, hashtags].filter(Boolean).join('\n\n');
      try { await navigator.clipboard.writeText(fullText); } catch {}
      setState('copied');
      setTimeout(() => {
        window.open(url, '_blank');
        setState('opening');
        setTimeout(() => setState('idle'), 3000);
      }, 400);
    } else {
      window.open(url, '_blank');
    }
  }

  const label = state === 'copied' ? 'Copied! Opening…'
              : state === 'opening' ? `${p.label} opening…`
              : `Open ${p.label}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <button
        onClick={handleLaunch}
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '15px 18px', borderRadius: 14, border: `1.5px solid ${p.color}33`,
          background: p.color + '14', cursor: 'pointer',
          fontFamily: SANS, fontSize: 15, fontWeight: 600,
          color: p.color, transition: 'all .15s',
          opacity: state !== 'idle' ? 0.8 : 1,
        }}>
        <span style={{ fontSize: 20 }}>{p.icon}</span>
        <span style={{ flex: 1, textAlign: 'left' }}>{label}</span>
        <span style={{ fontSize: 12, color: T.fg3, fontWeight: 400 }}>→</span>
      </button>
      {p.copyFirst && (
        <div style={{ fontFamily: SANS, fontSize: 11, color: T.fg3, paddingLeft: 8 }}>
          {p.note}
        </div>
      )}
    </div>
  );
}

/**
 * PostPublisher
 *
 * Props:
 *   post       — the post object (caption, hashtags, platform, asset_url, type, etc.)
 *   client     — client/artist object
 *   onClose    — close handler
 *   onMarkPosted — called when manager confirms it's been posted
 */
export default function PostPublisher({ post, client, onClose, onMarkPosted }) {
  const [confirming, setConfirming] = useState(false);
  const fullCaption = post.caption || '';
  const hashtags    = post.hashtags || '';
  const combined    = [fullCaption, hashtags].filter(Boolean).join('\n\n');
  const platInfo    = PLATFORMS[post.platform];
  const platColor   = platInfo?.color || T.acc;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: '#000000bb', zIndex: 1010 }}
      />

      {/* Bottom sheet */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1020,
        background: T.bg2, borderTop: `1px solid ${T.brd}`,
        borderRadius: '20px 20px 0 0',
        maxHeight: '92dvh', overflowY: 'auto',
        // iOS momentum scrolling
        WebkitOverflowScrolling: 'touch',
      }}>
        {/* Handle bar */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 0' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: T.brd }} />
        </div>

        {/* Header */}
        <div style={{ padding: '14px 20px 12px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 11, background: platColor + '20',
            display: 'grid', placeItems: 'center', fontSize: 22, color: platColor, flexShrink: 0,
          }}>
            {platInfo?.icon || '◇'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: SERIF, fontSize: 17, color: T.fg, lineHeight: 1 }}>Ready to Post</div>
            <div style={{ fontFamily: MONO, fontSize: 10, color: platColor, letterSpacing: '.06em', marginTop: 3 }}>
              {platInfo?.label || post.platform} · {client?.name || ''}
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: T.fg3, fontSize: 22, cursor: 'pointer', padding: '0 4px', lineHeight: 1 }}>×</button>
        </div>

        <div style={{ padding: '0 16px 32px' }}>

          {/* ── ONE-TAP: Save image + copy text ────────────────────────── */}
          <OneTapAction post={post} caption={fullCaption} hashtags={hashtags} combined={combined} />

          {/* ── Asset — Save to camera roll via Web Share API ── */}
          {post.asset_url && (
            <ImageSaver url={post.asset_url} caption={combined} />
          )}

          {/* ── Caption ── */}
          <div style={{ marginBottom: 12, background: T.card, border: `1px solid ${T.brd}`, borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ padding: '10px 14px 6px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontFamily: MONO, fontSize: 10, color: T.fg3, letterSpacing: '.08em', flex: 1 }}>CAPTION</span>
              <span style={{ fontFamily: MONO, fontSize: 10, color: T.fg3 }}>{fullCaption.length} chars</span>
            </div>
            <p style={{ margin: '0 14px 12px', fontFamily: SANS, fontSize: 14, color: T.fg, lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>
              {fullCaption || <em style={{ color: T.fg3 }}>No caption</em>}
            </p>
            <div style={{ padding: '0 12px 12px' }}>
              <CopyBtn text={fullCaption} label="Caption" style={{ width: '100%' }} />
            </div>
          </div>

          {/* ── Hashtags ── */}
          {hashtags && (
            <div style={{ marginBottom: 12, background: T.card, border: `1px solid ${T.brd}`, borderRadius: 14, overflow: 'hidden' }}>
              <div style={{ padding: '10px 14px 6px', fontFamily: MONO, fontSize: 10, color: T.fg3, letterSpacing: '.08em' }}>HASHTAGS</div>
              <p style={{ margin: '0 14px 12px', fontFamily: MONO, fontSize: 12, color: platColor, lineHeight: 1.7, wordBreak: 'break-word' }}>
                {hashtags}
              </p>
              <div style={{ padding: '0 12px 12px' }}>
                <CopyBtn text={hashtags} label="Hashtags" style={{ width: '100%' }} />
              </div>
            </div>
          )}

          {/* ── Copy everything ── */}
          <CopyBtn
            text={combined}
            label="Caption + Hashtags"
            style={{ width: '100%', marginBottom: 20, padding: '15px', fontSize: 15, background: T.acc + '18', color: T.acc, border: `1px solid ${T.acc}33` }}
          />

          {/* ── Platform launch buttons ── */}
          <div style={{ fontFamily: MONO, fontSize: 10, color: T.fg3, letterSpacing: '.1em', marginBottom: 10 }}>
            OPEN PLATFORM
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
            {/* Primary platform first */}
            {post.platform && PLATFORMS[post.platform] && (
              <PlatformBtn platform={post.platform} caption={fullCaption} hashtags={hashtags} />
            )}
            {/* Other platforms the client uses */}
            {(client?.platforms || [])
              .filter(p => p !== post.platform && PLATFORMS[p])
              .map(p => (
                <PlatformBtn key={p} platform={p} caption={fullCaption} hashtags={hashtags} />
              ))
            }
          </div>

          {/* ── Mark as Posted ── */}
          {!confirming ? (
            <button
              onClick={() => setConfirming(true)}
              style={{
                width: '100%', padding: '16px', borderRadius: 14, border: 'none',
                background: T.grn, color: '#0e1014', fontFamily: SANS,
                fontSize: 16, fontWeight: 700, cursor: 'pointer',
              }}>
              Mark as Posted ✓
            </button>
          ) : (
            <div style={{ background: T.grn + '14', border: `1.5px solid ${T.grn}33`, borderRadius: 14, padding: 16 }}>
              <div style={{ fontFamily: SANS, fontSize: 14, color: T.fg, marginBottom: 12, textAlign: 'center' }}>
                Confirm post went live on {platInfo?.label || post.platform}?
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setConfirming(false)} style={{ flex: 1, padding: '12px', background: T.brd, border: 'none', borderRadius: 10, color: T.fg2, fontFamily: SANS, fontSize: 14, cursor: 'pointer' }}>
                  Not yet
                </button>
                <button onClick={onMarkPosted} style={{ flex: 2, padding: '12px', background: T.grn, border: 'none', borderRadius: 10, color: '#0e1014', fontFamily: SANS, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                  Yes, it's live! ✓
                </button>
              </div>
            </div>
          )}

          {/* Scheduled time reminder */}
          {post.scheduled_at && (
            <div style={{ marginTop: 14, textAlign: 'center', fontFamily: MONO, fontSize: 11, color: T.fg3 }}>
              Scheduled for {new Date(post.scheduled_at).toLocaleString('en-US', { weekday:'short', month:'short', day:'numeric', hour:'numeric', minute:'2-digit' })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
