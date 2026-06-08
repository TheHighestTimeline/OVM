"""
Feature 6 -- Dual LLM provider (Ollama default, Claude toggle), via LiteLLM.

Design note (see DEV_NOTES.md): we DON'T ask the LLM to echo timestamps -- local
7B models are unreliable at that, and it's the #1 cause of broken renders. Timing
and captions are derived deterministically from the word-level transcript. The
LLM does the genuinely creative part: looking at what the founder is saying and
suggesting which stock B-roll keyword fits each stretch (only used for AUTO
B-roll, i.e. spans you didn't claim with a manual rule).
"""
import json
import time
import logging
import litellm

import config

log = logging.getLogger("llm_handler")

_SYSTEM = """You are a short-form video editor choosing stock B-roll for a talking-head ad.
You are given a transcript split into numbered segments with start/end times.
For segments where a clear, literal stock-footage visual would strengthen the message,
output a B-roll keyword (2-4 words, concrete and searchable on stock sites, e.g.
"data center servers", "city skyline aerial", "handshake closeup").
Leave a segment out entirely if the founder's face is better than any stock clip.
Return ONLY valid JSON of the form:
{"broll": [{"segment": <int>, "keyword": "<search terms>"}]}"""


def _hint_on_error(e, settings):
    """Turn a cryptic provider error into a plain-English next step."""
    msg = str(e).lower()
    if "not found" in msg and settings["llm_provider"] == "ollama":
        log.error(f"  ↳ The local model isn't downloaded. Run once:  "
                  f"ollama pull {settings['ollama_model']}")
    elif "api_key" in msg or "authentication" in msg or "401" in msg:
        log.error("  ↳ Add your Anthropic key in the web UI (section 1) to use Claude.")


def _segments_for_prompt(transcript):
    lines = []
    for i, seg in enumerate(transcript["segments"]):
        lines.append(f"[{i}] ({seg['start']:.1f}-{seg['end']:.1f}s) {seg['text']}")
    return "\n".join(lines)


def suggest_broll(transcript, settings=None):
    """
    Returns [{"start","end","keyword"}] of auto B-roll suggestions.
    Empty list on any failure (the render just falls back to founder-on-screen).
    """
    settings = settings or config.load_settings()
    if not settings.get("auto_broll", True):
        return []

    params = config.llm_params(settings)
    if settings["llm_provider"] == "claude" and not params["api_key"]:
        log.error("Claude selected but ANTHROPIC_API_KEY is empty. Skipping auto B-roll.")
        return []

    user = (
        "Transcript segments:\n" + _segments_for_prompt(transcript)
        + "\n\nReturn the B-roll JSON now."
    )

    for attempt in range(3):
        try:
            log.info(f"Asking {params['model']} for B-roll suggestions (try {attempt+1}/3)...")
            kwargs = dict(
                model=params["model"],
                messages=[{"role": "system", "content": _SYSTEM},
                          {"role": "user", "content": user}],
                temperature=0.4,
            )
            if params["api_key"]:
                kwargs["api_key"] = params["api_key"]
            if params["api_base"]:
                kwargs["api_base"] = params["api_base"]

            resp = litellm.completion(**kwargs)
            text = resp.choices[0].message.content.strip()
            if text.startswith("```"):
                text = text.strip("`")
                text = text[text.find("{"):]
            text = text[text.find("{"): text.rfind("}") + 1]
            data = json.loads(text)

            segs = transcript["segments"]
            out = []
            for item in data.get("broll", []):
                idx = item.get("segment")
                kw = (item.get("keyword") or "").strip()
                if kw and isinstance(idx, int) and 0 <= idx < len(segs):
                    out.append({"start": segs[idx]["start"], "end": segs[idx]["end"], "keyword": kw})
            log.info(f"LLM suggested {len(out)} auto B-roll span(s).")
            return out
        except litellm.RateLimitError:
            wait = 2 ** (attempt + 1)
            log.warning(f"Rate limited; retrying in {wait}s...")
            time.sleep(wait)
        except Exception as e:
            log.error(f"LLM B-roll suggestion failed: {e}")
            _hint_on_error(e, settings)
            return []
    return []


_PLACE_SYSTEM = """You are a short-form video editor placing the creator's OWN B-roll clips.
You are given a transcript split into numbered segments, and a list of available
clip IDs (their filenames, which hint at their content). For each clip, pick the
ONE transcript segment where showing that clip best matches what's being said.
Use a clip at most once. Skip a clip if nothing fits well. Put at most one clip
per segment. Return ONLY valid JSON:
{"assignments": [{"clip_id": "<id>", "segment": <int>}]}"""


def place_my_clips(transcript, clip_ids, settings=None):
    """
    Ask the LLM where each of the creator's OWN clips should go.
    Returns [{"clip_id","segment_start","segment_end"}] (clip plays natural length).
    Empty list if disabled / no clips / LLM unavailable.
    """
    settings = settings or config.load_settings()
    if not clip_ids:
        return []

    params = config.llm_params(settings)
    if settings["llm_provider"] == "claude" and not params["api_key"]:
        log.warning("Claude selected but ANTHROPIC_API_KEY is empty. "
                    "Can't auto-place your clips -- use placement rules instead.")
        return []

    user = (
        "Transcript segments:\n" + _segments_for_prompt(transcript)
        + "\n\nAvailable clip IDs:\n" + "\n".join(f"- {c}" for c in clip_ids)
        + "\n\nReturn the assignments JSON now."
    )

    for attempt in range(3):
        try:
            log.info(f"Asking {params['model']} to place {len(clip_ids)} of your clip(s) "
                     f"(try {attempt+1}/3)...")
            kwargs = dict(
                model=params["model"],
                messages=[{"role": "system", "content": _PLACE_SYSTEM},
                          {"role": "user", "content": user}],
                temperature=0.3,
            )
            if params["api_key"]:
                kwargs["api_key"] = params["api_key"]
            if params["api_base"]:
                kwargs["api_base"] = params["api_base"]

            resp = litellm.completion(**kwargs)
            text = resp.choices[0].message.content.strip()
            if text.startswith("```"):
                text = text.strip("`")
            text = text[text.find("{"): text.rfind("}") + 1]
            data = json.loads(text)

            segs = transcript["segments"]
            out, used_clips, used_segs = [], set(), set()
            for item in data.get("assignments", []):
                cid = str(item.get("clip_id", "")).lower().strip()
                idx = item.get("segment")
                if (cid in clip_ids and cid not in used_clips
                        and isinstance(idx, int) and 0 <= idx < len(segs)
                        and idx not in used_segs):
                    out.append({"clip_id": cid,
                                "segment_start": segs[idx]["start"],
                                "segment_end": segs[idx]["end"]})
                    used_clips.add(cid); used_segs.add(idx)
            log.info(f"LLM placed {len(out)} of your clip(s).")
            return out
        except litellm.RateLimitError:
            time.sleep(2 ** (attempt + 1))
        except Exception as e:
            log.error(f"LLM clip placement failed: {e}")
            _hint_on_error(e, settings)
            return []
    return []
