// ════════════════════════════════════════════════════════════════════════════
// BatchCreator — create multiple posts in one sitting.
// Templates + per-post AI assist + platform selectors.
// ════════════════════════════════════════════════════════════════════════════
import { useState, useRef } from 'react';
import { T, SERIF, SANS, MONO, ALL_PLAT, PLAT_LIST, tag, btn, inputStyle, Lbl } from './_shared.jsx';

const TEMPLATES = [
  { id: 'blank',        label: '— Blank —',         caption: '',   hashtags: '',  type: 'photo'   },
  { id: 'announcement', label: '📣 Announcement',    caption: '',   hashtags: '#announcement #news', type: 'photo' },
  { id: 'bts',          label: '🎬 Behind the Scenes', caption: '', hashtags: '#behindthescenes #bts', type: 'video' },
  { id: 'promo',        label: '🔥 Promo / Offer',   caption: '',   hashtags: '#sale #promo #deal', type: 'photo' },
  { id: 'story',        label: '📖 Story / Narrative', caption: '', hashtags: '#story',  type: 'carousel' },
  { id: 'quote',        label: '💬 Quote',            caption: '"[Quote here]"\n— [Attribution]', hashtags: '#quote #inspiration', type: 'photo' },
  { id: 'reel',         label: '🎵 Reel / Short',     caption: '',  hashtags: '#reels #viral',  type: 'reel'  },
  { id: 'collab',       label: '🤝 Collab / Feature', caption: '',  hashtags: '#collab #feature', type: 'photo' },
];

const POST_TYPES = ['photo','video','carousel','reel','short','story'];

function blankPost(defaults = {}) {
  return {
    _id:       Math.random().toString(36).slice(2),
    platform:  defaults.platform  || 'instagram',
    type:      defaults.type      || 'photo',
    caption:   defaults.caption   || '',
    hashtags:  defaults.hashtags  || '',
    asset_url: '',
    status:    'draft',
    aiLoading: false,
  };
}

async function getToken() {
  try { return (await window.Clerk?.session?.getToken?.()) ?? null; } catch { return null; }
}
async function callApi(path, opts = {}) {
  const token = await getToken();
  const res = await fetch(`/.netlify/functions/${path}`, {
    ...opts,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(opts.headers || {}) },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

// ── Single post card ──────────────────────────────────────────────────────────
function PostCard({ post, index, total, client, onChange, onRemove, onDuplicate, onAI, isFirst }) {
  const plat = ALL_PLAT[post.platform] || ALL_PLAT.instagram;

  return (
    <div style={{
      background: T.ink8, border: `1px solid ${T.ink6}`, borderRadius: 12,
      overflow: 'hidden', marginBottom: 12,
      borderLeft: `3px solid ${plat.color}`,
    }}>
      {/* Card header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 14px', borderBottom: `1px solid ${T.ink7}`,
        background: T.ink9,
      }}>
        <span style={{ fontFamily: MONO, fontSize: 11, color: T.ink3, minWidth: 22 }}>#{index + 1}</span>

        {/* Platform tabs */}
        <div style={{ display: 'flex', gap: 4, flex: 1 }}>
          {PLAT_LIST.map(pid => {
            const pm = ALL_PLAT[pid];
            const on = post.platform === pid;
            return (
              <button key={pid} onClick={() => onChange({ platform: pid })}
                style={{ padding: '3px 9px', borderRadius: 999, border: `1px solid ${on ? pm.color : T.ink6}`,
                  background: on ? pm.color + '22' : 'transparent', color: on ? pm.color : T.ink3,
                  fontSize: 10, fontFamily: MONO, cursor: 'pointer' }}>
                {pm.icon} {pm.label}
              </button>
            );
          })}
        </div>

        {/* Type selector */}
        <select value={post.type} onChange={e => onChange({ type: e.target.value })}
          style={{ ...inputStyle, width: 'auto', fontSize: 11, padding: '3px 8px', fontFamily: MONO }}>
          {POST_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        {/* Card actions */}
        <button onClick={onDuplicate} title="Duplicate" style={{ ...btn('ghost'), padding: '3px 8px', fontSize: 12 }}>⎘</button>
        {total > 1 && (
          <button onClick={onRemove} title="Remove" style={{ ...btn('ghost'), padding: '3px 8px', fontSize: 12, color: '#f25c5c', borderColor: '#f25c5c' }}>×</button>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: '14px 14px 10px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Caption */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
            <Lbl>Caption</Lbl>
            <button
              onClick={() => onAI(post._id)}
              disabled={post.aiLoading}
              style={{ ...btn('ghost'), padding: '2px 10px', fontSize: 10, opacity: post.aiLoading ? 0.5 : 1 }}>
              {post.aiLoading ? '✦ Writing…' : '✦ AI Write'}
            </button>
          </div>
          <textarea
            value={post.caption}
            onChange={e => onChange({ caption: e.target.value })}
            placeholder={`Write a ${plat.label} caption for ${client?.name || 'this client'}…`}
            rows={4}
            style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
          />
          <div style={{ textAlign: 'right', fontSize: 10, color: T.ink3, fontFamily: MONO, marginTop: 3 }}>
            {post.caption.length} chars
          </div>
        </div>

        {/* Hashtags */}
        <div>
          <Lbl>Hashtags</Lbl>
          <input
            value={post.hashtags}
            onChange={e => onChange({ hashtags: e.target.value })}
            placeholder="#tag1 #tag2 #tag3"
            style={inputStyle}
          />
        </div>

        {/* Asset URL */}
        <div>
          <Lbl>Asset / Media URL <span style={{ color: T.ink3 }}>(optional)</span></Lbl>
          <input
            value={post.asset_url}
            onChange={e => onChange({ asset_url: e.target.value })}
            placeholder="https://drive.google.com/... or paste direct link"
            style={inputStyle}
          />
        </div>
      </div>
    </div>
  );
}

// ── Main BatchCreator ─────────────────────────────────────────────────────────
export default function BatchCreator({ client, showToast, onSaved }) {
  const [posts, setPosts] = useState([blankPost()]);
  const [template, setTemplate] = useState('blank');
  const [saving, setSaving] = useState(false);

  function updatePost(id, patch) {
    setPosts(prev => prev.map(p => p._id === id ? { ...p, ...patch } : p));
  }

  function addPost() {
    const tpl = TEMPLATES.find(t => t.id === template) || TEMPLATES[0];
    setPosts(prev => [...prev, blankPost({ type: tpl.type, caption: tpl.caption, hashtags: tpl.hashtags })]);
  }

  function removePost(id) {
    setPosts(prev => prev.filter(p => p._id !== id));
  }

  function duplicatePost(id) {
    const src = posts.find(p => p._id === id);
    if (!src) return;
    const dup = { ...src, _id: Math.random().toString(36).slice(2) };
    const idx = posts.findIndex(p => p._id === id);
    setPosts(prev => [...prev.slice(0, idx + 1), dup, ...prev.slice(idx + 1)]);
  }

  function applyTemplate(tplId) {
    setTemplate(tplId);
    const tpl = TEMPLATES.find(t => t.id === tplId);
    if (!tpl || tpl.id === 'blank') return;
    // Apply to the last (most recent) post if it's empty
    setPosts(prev => {
      const last = prev[prev.length - 1];
      if (!last.caption && !last.hashtags) {
        return prev.map((p, i) => i === prev.length - 1 ? { ...p, type: tpl.type, caption: tpl.caption, hashtags: tpl.hashtags } : p);
      }
      return prev;
    });
  }

  async function generateCaption(postId) {
    if (!client) return showToast?.('Select a client first');
    updatePost(postId, { aiLoading: true });
    const post = posts.find(p => p._id === postId);
    try {
      const data = await callApi('social-ai', {
        method: 'POST',
        body: JSON.stringify({
          messages: [{ role: 'user', content: `Write a ${post?.platform} ${post?.type} caption for this client. Keep it on-brand. ${post?.caption ? 'Improve this draft: ' + post.caption : 'Write something fresh.'}` }],
          client: client ? { name: client.name, genre: client.genre, brandVoice: client.brandVoice, dos: client.dos, donts: client.donts, targetAudience: client.targetAudience } : null,
        }),
      });
      updatePost(postId, { caption: data.reply || '', aiLoading: false });
    } catch {
      updatePost(postId, { aiLoading: false });
      showToast?.('AI unavailable — try again');
    }
  }

  async function saveAll() {
    const valid = posts.filter(p => p.caption.trim());
    if (!valid.length) return showToast?.('Add captions before saving');
    setSaving(true);
    try {
      await Promise.all(valid.map(p =>
        callApi('posts-create', {
          method: 'POST',
          body: JSON.stringify({
            client_id: client?.id,
            platform:  p.platform,
            type:      p.type,
            caption:   p.caption.trim(),
            hashtags:  p.hashtags.trim(),
            media_url: p.asset_url.trim() || null,
            status:    'draft',
          }),
        })
      ));
      showToast?.(`${valid.length} post${valid.length > 1 ? 's' : ''} saved as drafts`);
      setPosts([blankPost()]);
      onSaved?.();
    } catch (e) {
      showToast?.('Save failed: ' + e.message);
    } finally {
      setSaving(false);
    }
  }

  const filledCount = posts.filter(p => p.caption.trim()).length;

  return (
    <div style={{ maxWidth: 800 }}>
      {/* Header toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontFamily: SANS, fontSize: 20, fontWeight: 500, color: T.fg }}>Create Posts</div>
          <div style={{ fontFamily: MONO, fontSize: 10, color: T.ink3, marginTop: 2 }}>
            {posts.length} post{posts.length !== 1 ? 's' : ''} · {filledCount} ready to save
          </div>
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Template picker */}
          <select value={template} onChange={e => applyTemplate(e.target.value)}
            style={{ ...inputStyle, width: 'auto', fontSize: 11, padding: '5px 10px' }}>
            {TEMPLATES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>

          <button onClick={addPost}
            style={{ ...btn('ghost'), display: 'flex', alignItems: 'center', gap: 5 }}>
            + Add Post
          </button>

          <button
            onClick={saveAll}
            disabled={saving || filledCount === 0}
            style={{ ...btn('primary'), opacity: (saving || filledCount === 0) ? 0.5 : 1 }}>
            {saving ? 'Saving…' : `Save ${filledCount || ''} Draft${filledCount !== 1 ? 's' : ''}`}
          </button>
        </div>
      </div>

      {/* Post cards */}
      {posts.map((post, index) => (
        <PostCard
          key={post._id}
          post={post}
          index={index}
          total={posts.length}
          client={client}
          isFirst={index === 0}
          onChange={patch => updatePost(post._id, patch)}
          onRemove={() => removePost(post._id)}
          onDuplicate={() => duplicatePost(post._id)}
          onAI={generateCaption}
        />
      ))}

      {/* Add more */}
      <button onClick={addPost}
        style={{
          width: '100%', padding: '14px', borderRadius: 10,
          border: `1.5px dashed ${T.ink6}`, background: 'transparent',
          color: T.ink3, fontFamily: MONO, fontSize: 12, cursor: 'pointer',
          letterSpacing: '.04em', transition: 'all .15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = T.acc; e.currentTarget.style.color = T.acc; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = T.ink6; e.currentTarget.style.color = T.ink3; }}>
        + ADD ANOTHER POST
      </button>
    </div>
  );
}
