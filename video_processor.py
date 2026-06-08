<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>OVM Ad Engine</title>
<style>
  :root { --bg:#0f172a; --card:#1e293b; --accent:#FFE000; --text:#e2e8f0; --muted:#94a3b8; --ok:#22c55e; }
  * { box-sizing: border-box; }
  body { margin:0; font-family: system-ui, sans-serif; background:var(--bg); color:var(--text); }
  header { padding:20px 28px; border-bottom:1px solid #334155; display:flex; align-items:center; gap:12px; }
  header h1 { font-size:20px; margin:0; }
  .tag { background:var(--accent); color:#000; font-weight:700; padding:2px 8px; border-radius:6px; font-size:12px; }
  main { max-width:920px; margin:0 auto; padding:24px; display:grid; gap:20px; }
  .card { background:var(--card); border:1px solid #334155; border-radius:12px; padding:20px; }
  .card h2 { margin:0 0 4px; font-size:16px; }
  .card p.hint { margin:0 0 14px; color:var(--muted); font-size:13px; }
  label { display:block; font-size:13px; margin:10px 0 4px; color:var(--muted); }
  input, select, textarea { width:100%; background:#0f172a; border:1px solid #334155; color:var(--text);
    border-radius:8px; padding:10px; font-size:14px; font-family:inherit; }
  textarea { min-height:140px; resize:vertical; font-family:ui-monospace, monospace; }
  .row { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
  .row3 { display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px; }
  button { background:var(--accent); color:#000; font-weight:700; border:none; border-radius:8px;
    padding:11px 18px; font-size:14px; cursor:pointer; }
  button.secondary { background:#334155; color:var(--text); }
  .check { display:flex; align-items:center; gap:8px; margin:10px 0; }
  .check input { width:auto; }
  .pill { display:inline-block; background:#334155; padding:3px 10px; border-radius:20px; font-size:12px; margin:3px 4px 0 0; }
  .set { color:var(--ok); } .unset { color:#f87171; }
  .saved { color:var(--ok); font-size:12px; margin-left:8px; }
  #log { background:#020617; border-radius:8px; padding:12px; font-family:ui-monospace,monospace;
    font-size:12px; white-space:pre-wrap; max-height:260px; overflow:auto; color:#cbd5e1; }
  video { width:100%; border-radius:8px; margin-top:12px; background:#000; }
  .renderbtn { font-size:16px; padding:14px; width:100%; }
  a.dl { color:var(--accent); }
</style>
</head>
<body>
<header>
  <h1>🎬 OVM Ad Engine</h1><span class="tag">LOCAL</span>
  <span style="color:var(--muted);font-size:13px;margin-left:auto;">Runs on your machine · your GPU · your files</span>
</header>
<main>

  <!-- 1. API KEYS -->
  <div class="card">
    <h2>1 · Your API keys <span id="keys-saved" class="saved"></span></h2>
    <p class="hint">Stored locally in <code>.env</code> on this machine. Leave blank to keep the current value.
      Status — Claude: <span class="{{ 'set' if keys_set.anthropic else 'unset' }}">{{ 'set' if keys_set.anthropic else 'not set' }}</span> ·
      Pexels: <span class="{{ 'set' if keys_set.pexels else 'unset' }}">{{ 'set' if keys_set.pexels else 'not set' }}</span> ·
      Pixabay: <span class="{{ 'set' if keys_set.pixabay else 'unset' }}">{{ 'set' if keys_set.pixabay else 'not set' }}</span></p>
    <form id="keys-form">
      <div class="row3">
        <div><label>Anthropic (Claude) key</label><input name="anthropic" type="password" placeholder="sk-ant-..."></div>
        <div><label>Pexels key (auto B-roll)</label><input name="pexels" type="password"></div>
        <div><label>Pixabay key (music/SFX)</label><input name="pixabay" type="password"></div>
      </div>
      <br><button type="submit">Save keys</button>
    </form>
  </div>

  <!-- 2. FOUNDER VIDEO -->
  <div class="card">
    <h2>2 · Founder video</h2>
    <p class="hint">Upload the raw talking-head recording. It uploads to <code>uploads/</code> on this machine.</p>
    <input type="file" id="founder-file" accept="video/*">
    <button class="secondary" onclick="uploadFounder()">Upload</button>
    <div style="margin-top:10px;">
      <label>Use this video for the render:</label>
      <select id="founder-select">
        {% for u in uploads %}<option value="{{u}}">{{u}}</option>{% endfor %}
      </select>
    </div>
  </div>

  <!-- 3. B-ROLL LIBRARY -->
  <div class="card">
    <h2>3 · Your B-roll clips</h2>
    <p class="hint">Drop pre-trimmed clips here (they go to <code>local_broll/</code>). Reference them by ID in the rules below.</p>
    <div>{% for cid in broll %}<span class="pill">{{cid}}</span>{% else %}<span style="color:var(--muted)">No clips yet.</span>{% endfor %}</div>
    <br><input type="file" id="broll-files" accept="video/*" multiple>
    <button class="secondary" onclick="uploadBroll()">Upload clip(s)</button>
  </div>

  <!-- 4. PLACEMENT RULES -->
  <div class="card">
    <h2>4 · Placement rules <span id="rules-saved" class="saved"></span></h2>
    <p class="hint">"When he says X, drop clip Y." Phrase triggers or direct timespans.</p>
    <form id="rules-form"><textarea name="rules">{{ rules_text }}</textarea>
    <br><br><button type="submit">Save rules</button></form>
  </div>

  <!-- 5. STYLE & TOGGLES -->
  <div class="card">
    <h2>5 · Style &amp; options <span id="settings-saved" class="saved"></span></h2>
    <form id="settings-form">
      <div class="row3">
        <div><label>Caption style</label><select name="caption_style">
          {% for s in ['hormozi','mrbeast','karaoke','highlight'] %}
          <option value="{{s}}" {{'selected' if settings.caption_style==s}}>{{s}}</option>{% endfor %}
        </select></div>
        <div><label>LLM provider</label><select name="llm_provider">
          <option value="ollama" {{'selected' if settings.llm_provider=='ollama'}}>Ollama (local, free)</option>
          <option value="claude" {{'selected' if settings.llm_provider=='claude'}}>Claude (quality)</option>
        </select></div>
        <div><label>Whisper model</label><select name="whisper_model">
          {% for m in ['large-v3','medium','small','base'] %}
          <option value="{{m}}" {{'selected' if settings.whisper_model==m}}>{{m}}</option>{% endfor %}
        </select></div>
      </div>
      <div class="row">
        <div><label>Ollama model (only if provider = Ollama — must be already pulled)</label>
          <input name="ollama_model" type="text" value="{{settings.ollama_model}}" placeholder="e.g. qwen2.5:14b"></div>
        <div><label>&nbsp;</label>
          <div style="font-size:12px;color:var(--muted);padding-top:11px">Free &amp; local. If missing, run <code>ollama pull &lt;model&gt;</code> in a terminal.</div></div>
      </div>
      <div class="row">
        <div><label>Output format</label><select name="output_aspect">
          {% for a,lbl in [('9:16','9:16  Reels / TikTok / Shorts'),('4:5','4:5  Instagram feed'),('1:1','1:1  Square'),('16:9','16:9  Landscape / YouTube'),('original','Original (keep source)')] %}
          <option value="{{a}}" {{'selected' if settings.output_aspect==a}}>{{lbl}}</option>{% endfor %}
        </select></div>
        <div><label>Fit (when reshaping)</label><select name="output_fit">
          <option value="blur" {{'selected' if settings.output_fit=='blur'}}>Blurred letterbox (show whole frame)</option>
          <option value="crop" {{'selected' if settings.output_fit=='crop'}}>Crop to fill (may trim edges)</option>
        </select></div>
      </div>
      <div class="row3">
        <div><label>Words per caption line</label><input name="caption_max_words" type="number" min="1" max="8" value="{{settings.caption_max_words}}"></div>
        <div><label>Caption size</label><input name="caption_font_size" type="number" value="{{settings.caption_font_size}}"></div>
        <div><label>Highlight color</label><input name="caption_highlight_color" type="text" value="{{settings.caption_highlight_color}}"></div>
      </div>
      <div class="check"><input type="checkbox" name="auto_place_my_clips" {{'checked' if settings.auto_place_my_clips}}><label style="margin:0">Let the LLM auto-place my own clips (no rules needed — uses clip filenames)</label></div>
      <div class="check"><input type="checkbox" name="auto_broll" {{'checked' if settings.auto_broll}}><label style="margin:0">Then fill any leftover gaps with stock B-roll (needs Pexels key)</label></div>
      <div class="check"><input type="checkbox" name="mute_broll_audio" {{'checked' if settings.mute_broll_audio}}><label style="margin:0">Mute B-roll audio (founder audio is the spine)</label></div>
      <div class="check"><input type="checkbox" name="fit_to_span" {{'checked' if settings.fit_to_span}}><label style="margin:0">Fit clips to span (off = keep your clip lengths)</label></div>
      <div class="check"><input type="checkbox" name="export_stems" {{'checked' if settings.export_stems}}><label style="margin:0">Export stems zip for CapCut</label></div>
      <br><button type="submit">Save options</button>
    </form>
  </div>

  <!-- 6. RENDER -->
  <div class="card">
    <h2>6 · Render</h2>
    <p class="hint">Saves nothing new — uses everything above. The finished video and stems land in <code>output/</code> and <code>stems/</code>.</p>
    <button class="renderbtn" onclick="startRender()">▶  Render my video</button>
    <div id="result" style="margin-top:16px;display:none;">
      <div id="links"></div>
      <video id="preview" controls></video>
    </div>
    <h2 style="margin-top:18px;font-size:13px;color:var(--muted)">Progress</h2>
    <div id="log">idle</div>
  </div>

</main>
<script>
async function post(url, form) {
  const r = await fetch(url, { method:'POST', body:form });
  return r.json();
}
function flash(id){ const e=document.getElementById(id); e.textContent='✓ saved'; setTimeout(()=>e.textContent='',2000); }

document.getElementById('keys-form').onsubmit = async e => { e.preventDefault();
  await post('/save-keys', new FormData(e.target)); flash('keys-saved'); };
document.getElementById('rules-form').onsubmit = async e => { e.preventDefault();
  await post('/save-rules', new FormData(e.target)); flash('rules-saved'); };
document.getElementById('settings-form').onsubmit = async e => { e.preventDefault();
  await post('/save-settings', new FormData(e.target)); flash('settings-saved'); };

async function uploadFounder(){
  const f=document.getElementById('founder-file').files[0]; if(!f) return alert('Pick a video first.');
  const fd=new FormData(); fd.append('file',f);
  const r=await post('/upload-founder',fd);
  const sel=document.getElementById('founder-select');
  if(![...sel.options].some(o=>o.value===r.name)){ const o=new Option(r.name,r.name); sel.add(o); }
  sel.value=r.name; alert('Uploaded: '+r.name);
}
async function uploadBroll(){
  const files=document.getElementById('broll-files').files; if(!files.length) return alert('Pick clip(s) first.');
  const fd=new FormData(); for(const f of files) fd.append('files',f);
  const r=await post('/upload-broll',fd); alert('Added clips: '+r.ids.join(', ')); location.reload();
}
async function startRender(){
  const founder=document.getElementById('founder-select').value;
  if(!founder) return alert('Upload a founder video first.');
  const fd=new FormData(); fd.append('founder',founder);
  const r=await post('/render',fd);
  if(!r.ok) return alert(r.error);
  poll();
}
async function poll(){
  const r=await (await fetch('/status')).json();
  document.getElementById('log').textContent = r.log || r.status;
  document.getElementById('log').scrollTop = 1e9;
  if(r.status==='running'){ setTimeout(poll,1500); return; }
  if(r.status==='done'){
    const res=document.getElementById('result'); res.style.display='block';
    let html='<b style="color:var(--ok)">✓ Done!</b> ';
    if(r.stems_name) html+=`&nbsp; <a class="dl" href="/download/stems/${r.stems_name}">⬇ Download stems (CapCut)</a>`;
    document.getElementById('links').innerHTML=html;
    const v=document.getElementById('preview'); v.src='/files/output/'+r.output_name+'?t='+Date.now();
  } else if(r.status==='error'){
    alert('Render error: '+ (r.result && r.result.error));
  }
}
</script>
</body>
</html>
