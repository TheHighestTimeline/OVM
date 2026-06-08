# 🎬 OVM Ad Engine — Founder's Guide

Turn a raw talking-head recording into a captioned social clip, with **your own
B-roll cut in exactly where you want it**. Everything runs on this machine — your
files, your GPU, your API keys. Nothing is uploaded to a third party.

---

## First-time setup (once)

1. Double-click **`setup.bat`**. Wait a few minutes while it installs. *(Already done for you on Tanner's machine.)*
2. Optional but recommended for speed: double-click **`enable_gpu.bat`** to turn on
   GPU transcription on the RTX 4060 Ti.

---

## Everyday use

1. **Start it:** double-click **`run_local.bat`**. Your browser opens to
   `http://localhost:8000`.
2. Work top to bottom down the page:

   | Step | What you do |
   |---|---|
   | **1 · API keys** | Paste your keys once (Pexels for auto stock B-roll, Pixabay for music, Claude only if you want the paid quality LLM). Click **Save**. Ollama is the free default and needs no key. |
   | **2 · Founder video** | Upload the raw recording. |
   | **3 · Your B-roll** | Upload your own pre-trimmed clips. Each clip's name (e.g. `dc_clip_01.mp4`) becomes its ID. |
   | **4 · Placement rules** | Write *"when he says X, use clip Y"* rules. See examples below. |
   | **5 · Style & options** | Pick a caption style (Hormozi / MrBeast / Karaoke / Highlight) and toggles. |
   | **6 · Render** | Click **▶ Render**. Watch the progress log. When it's done, the video previews right there and you can download the **stems zip** for CapCut. |

The finished video is saved in the **`output/`** folder; the CapCut hand-off
package is in **`stems/`**.

---

## Writing placement rules

Clip ID = the filename in `local_broll/` without the extension.

```yaml
placements:
  # When the founder says this phrase, cut to this clip:
  - when: "our data centers"
    use: dc_clip_01

  # Or place a clip between two exact times (MM:SS.s):
  - from: "00:12.0"
    to:   "00:16.5"
    use:  site_tour
```

- The founder's **audio never stops** — B-roll only swaps the *picture*, then cuts back.
- Your clips keep **the length you cut them to**. (There's a "fit to span" toggle if you ever want them stretched/trimmed to fill a time window.)
- Anything you don't assign falls back to **auto stock B-roll** (if that toggle is on) or stays on the founder.

### Don't want to write rules? Let the AI place your clips
Turn on **"Let the LLM auto-place my own clips"** (section 5). Upload your clips with
descriptive names (`bentley.mp4`, `city_skyline.mp4`, `logo.mp4`) and the AI reads the
transcript and drops each one where it fits. Rules still override it when you want exact control.

**This (and auto stock B-roll) needs an LLM connected — one of:**
- **Free/local:** run `ollama pull qwen2.5:7b` once in a terminal, OR
- **Claude:** set LLM provider to "Claude" and paste your Anthropic key in section 1.

Without one of those, your manual rules still work and the video still renders — the
AI just won't auto-place anything.

### Staying up to date
Your folder is linked to GitHub. To get the latest version, double-click **`update.bat`**
(your keys, settings, clips, and rules are kept).

**Two honest gotchas:**
- Phrase matching can miss if Whisper mis-hears a word, or if the phrase is said
  twice (it uses the first time). When a phrase gets fussy, use a `from/to` rule instead.
- A better Whisper model = better matching. Once GPU is on, set the model to
  **`large-v3`** in step 5.

---

## Letting your founder use it from another computer

1. On this machine, keep **`run_local.bat`** running.
2. Double-click **`share_with_founder.bat`**. It prints a
   `https://…trycloudflare.com` link — send that to your founder.
3. He uses the exact same page from his browser. His uploads and renders all
   happen **on this machine** (your GPU does the work). Close the tunnel window
   to stop sharing.

*(One-time: install the tunnel tool with `winget install --id Cloudflare.cloudflared`.)*
