# 🎬 OVM Ad Engine

A local, point-and-click tool that turns a founder's talking-head recording into a
captioned social clip — cutting in **your own B-roll exactly when he says the
trigger phrase**, over continuous founder audio, with viral word-level captions.

Built on top of [debarch777/AI-Video-Editor](https://github.com/debarch777/AI-Video-Editor)
(transcribe → LLM → fetch → render) and extended for One Vibe Media Group's workflow.

> **Everything runs on your machine.** Your GPU, your Ollama, your folders, your
> API keys. Nothing is uploaded to a third-party service. Your founder can use it
> through a Cloudflare tunnel — the work still happens on your machine.

## Quick start

```
setup.bat          # one-time: builds the Python 3.11 venv + installs deps
enable_gpu.bat     # optional: turn on GPU transcription (RTX 4060 Ti)
run_local.bat      # starts the web app at http://localhost:8000
```

Then in the browser: paste keys → upload the founder video → drop in B-roll →
write "when he says X, use clip Y" rules → pick a caption style → **Render**.

👉 Full walkthrough: **[README_FOUNDER.md](README_FOUNDER.md)**
🔧 How it works inside: **[DEV_NOTES.md](DEV_NOTES.md)**

## Features

- **Bring-your-own B-roll** — drop clips in `local_broll/`, reference them by name.
- **Transcript-anchored placement** — phrase triggers (`when: "our data centers"`)
  or direct timespans, resolved against word-level Whisper timestamps.
- **Hybrid** — anything you don't place falls back to auto stock B-roll (Pexels) or the founder.
- **Continuous founder audio** — B-roll swaps the picture only; uploaded clip audio muted.
- **Viral captions** — Hormozi / MrBeast / Karaoke / Highlight, word-level, burned via FFmpeg.
- **Stems export** — a CapCut hand-off zip (source clips, narration, subtitles, manifest).
- **Dual LLM** — Ollama (free, local, default) or Claude (quality toggle).
- **Local web UI** + Cloudflare tunnel for founder access.

## CLI (optional)

```
venv\Scripts\python main.py --input_video uploads\founder.mp4 --style hormozi
```
