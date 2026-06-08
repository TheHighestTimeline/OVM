# DEV_NOTES — OVM Ad Engine

Forked/extended from [debarch777/AI-Video-Editor](https://github.com/debarch777/AI-Video-Editor).
The base was a single-commit skeleton with the right shape (transcribe → LLM JSON
→ fetch → moviepy render). We kept the shape and rebuilt most of the substance.

## Pipeline (orchestrated in `main.py:run()`)

```
founder.mp4
  └─ transcriber.transcribe()      # faster-whisper, word-level timestamps (GPU→CPU fallback)
       └─ placement.resolve()      # broll_rules.yaml → concrete {clip,start,end} (MANUAL, wins)
       └─ llm_handler.suggest_broll()  # Ollama/Claude → stock keywords for AUTO spans
            └─ main._merge_placements() # manual overrides auto on overlap
                 └─ captions.build_ass()    # word-level ASS for the chosen style
                      └─ video_processor.render()  # composite + burn captions (ffmpeg)
                           └─ stems_export.export() # CapCut hand-off zip
```

## The placement merge (Feature 2/3 — the core)

- **Manual rules always win.** `_merge_placements` drops any auto stock suggestion
  whose time span overlaps a manual placement (manual end defaults to ~6s for the
  collision test when a phrase trigger has no explicit `to`).
- In `video_processor.render`, overlays are composited **on top of** the founder
  clip in start-time order; each is clamped so it never runs past the next
  placement or the end of the founder video.

## The one rule that never breaks

The founder's original audio is the **master track for the whole duration**
(`composite.set_audio(founder.audio …)`). B-roll clips are added as **video-only
overlays** (`without_audio()` when `mute_broll_audio`). So B-roll only ever swaps
the picture; the voice is continuous. Don't change this without a very good reason.

## Clip-length policy

We do **not** re-trim/stretch your clips by default. `_prepare_broll`:
- phrase trigger, no `to` → clip plays its **natural length**.
- `from/to` window, `fit_to_span=False` → clip plays natural length, **capped** so
  it doesn't overrun the window.
- `fit_to_span=True` → clip is trimmed (or `vfx.loop`-ed) to fill the window exactly.

## Captions — where to add a new style

`captions.py` builds an **ASS** file from word timestamps; FFmpeg burns it
(`video_processor._burn_captions`, run from `.work/` so the subtitles filter path
is simple on Windows).
- `group_lines()` chunks words into 4–6-word lines respecting pauses/punctuation.
- Per-word "pop" styles (hormozi/mrbeast/highlight) emit one Dialogue event per
  word with the active word recoloured (and scaled for hormozi/mrbeast).
- `karaoke` uses one event per line with `\kf` sweep tags.
- **To add a style:** add its name to the UI `<select>` in `templates/index.html`,
  then add a branch in `build_ass()` (tune outline/shadow/uppercase + the per-word
  or `\kf` rendering). Colours convert via `_ass_color` (#RRGGBB → ASS &HAABBGGRR).
- Fonts: libass uses installed Windows fonts by name. Install the font (e.g.
  Montserrat) for the exact look, or it falls back to a default.

## LLM provider (Feature 6)

`config.llm_params(settings)` maps the chosen provider to LiteLLM args:
- `ollama` (default): `model="ollama/<model>"`, `api_base=http://localhost:11434`, no key.
- `claude`: `model=<claude_model>`, `api_key=ANTHROPIC_API_KEY`.
We deliberately **don't** ask the LLM for timestamps — local 7B models botch that.
Timing/captions are deterministic from Whisper; the LLM only picks stock keywords.

## GPU transcription

`faster-whisper` uses CTranslate2, which needs CUDA 12 **cuBLAS + cuDNN** DLLs.
`enable_gpu.bat` pip-installs `nvidia-cublas-cu12` + `nvidia-cudnn-cu12`;
`transcriber._register_cuda_dlls()` adds their `bin` dirs via `os.add_dll_directory`
at runtime. If anything is missing, `transcribe()` catches the error mid-stream and
**re-runs on CPU** automatically. Set model to `large-v3` once GPU works.

## Known compatibility pins

- **moviepy 1.0.3** (not 2.x): base code uses `moviepy.editor` + 1.x method names.
- **Pillow 10** removed `Image.ANTIALIAS`; `config.py` shims it to `LANCZOS` (moviepy 1.0.3 needs it).
- **Python 3.11** venv specifically (3.14 has no stable wheels for these yet).

## Why NOT Netlify

This needs a GPU, FFmpeg, local Ollama, multi-minute renders, and local-folder
access. Netlify is static + 10s serverless functions — none of that fits. The
design is a **local web app** (`webapp.py`, FastAPI) + an optional **Cloudflare
tunnel** (`share_with_founder.bat`) for the founder. That matches the actual
requirement ("uploads go to my machine, my GPU does the work").

## Roadmap (v2/v3 — not built)

- v2: Streamlit/React drag-and-drop timeline; in-browser trim of uploaded B-roll;
  live caption preview; per-clip volume ducking instead of hard mute.
- v3: queue + multiple concurrent renders; auto-posting to platforms; team
  accounts; cloud GPU option for when the local machine is busy.
