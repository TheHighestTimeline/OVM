"""
Central configuration for the OVM Ad Engine.

Everything (CLI, web UI, render pipeline) reads its settings from here, so the
founder only ever fills in info in ONE place: the .env file (API keys) and the
project_settings.json file (toggles), both of which the web UI writes for them.
"""
import os
import json
import logging
from pathlib import Path
from dotenv import load_dotenv

# Compatibility shim: moviepy 1.0.3 calls Image.ANTIALIAS, removed in Pillow 10.
# config is imported by every module, so patching here fixes it everywhere.
from PIL import Image as _PILImage
if not hasattr(_PILImage, "ANTIALIAS"):
    _PILImage.ANTIALIAS = _PILImage.LANCZOS

# ---------------------------------------------------------------------------
# Paths -- everything lives next to this file, on YOUR local machine.
# ---------------------------------------------------------------------------
ROOT = Path(__file__).resolve().parent
load_dotenv(ROOT / ".env")

LOCAL_BROLL_DIR = ROOT / "local_broll"        # drop your own clips here
ASSET_DIR = ROOT / "assets"                   # auto-fetched stock B-roll/audio
OUTPUT_DIR = ROOT / "output"                  # finished videos
STEMS_DIR = ROOT / "stems"                    # CapCut hand-off packages
UPLOADS_DIR = ROOT / "uploads"                # founder videos uploaded via web UI
WORK_DIR = ROOT / ".work"                     # temp scratch
RULES_FILE = ROOT / "broll_rules.yaml"        # manual placement rules
SETTINGS_FILE = ROOT / "project_settings.json"

for _d in (LOCAL_BROLL_DIR, ASSET_DIR, OUTPUT_DIR, STEMS_DIR, UPLOADS_DIR, WORK_DIR):
    _d.mkdir(parents=True, exist_ok=True)

# ---------------------------------------------------------------------------
# Default settings -- overridden by project_settings.json if present.
# ---------------------------------------------------------------------------
DEFAULTS = {
    # ---- LLM provider (Feature 6) ----
    # "ollama" = free + local (default).  "claude" = paid quality toggle.
    "llm_provider": "ollama",
    "ollama_model": "qwen2.5:7b",            # or "llama3.1:8b"
    "ollama_base_url": "http://localhost:11434",
    "claude_model": "anthropic/claude-sonnet-4-20250514",

    # ---- Transcription (Feature 7) ----
    "whisper_model": "large-v3",             # 4060 Ti 16GB handles this fine
    "whisper_device": "cuda",                # falls back to cpu automatically
    "whisper_compute_type": "float16",       # cpu fallback uses int8

    # ---- B-roll behaviour (Features 1-3) ----
    "auto_place_my_clips": True,             # let the LLM place YOUR clips (no rules needed)
    "auto_broll": True,                      # fill remaining gaps with stock footage
    "fit_to_span": False,                    # keep YOUR clip lengths by default
    "mute_broll_audio": True,                # founder audio is the spine

    # ---- Captions (Feature 4) ----
    "caption_style": "hormozi",              # hormozi | mrbeast | karaoke | highlight
    "caption_font": "Montserrat",
    "caption_font_size": 64,
    "caption_primary_color": "#FFFFFF",
    "caption_highlight_color": "#FFE000",
    "caption_position": "center",            # center | bottom | top
    "caption_max_words": 4,                  # words per line (4-6 reads best)

    # ---- Output format ----
    "output_aspect": "9:16",                 # original | 9:16 | 4:5 | 1:1 | 16:9
    "output_fit": "blur",                    # crop (fill, may cut edges) | blur (letterbox + blurred bg)
    "export_stems": True,
}


def load_settings() -> dict:
    """Merge DEFAULTS with whatever the user saved in project_settings.json."""
    settings = dict(DEFAULTS)
    if SETTINGS_FILE.exists():
        try:
            settings.update(json.loads(SETTINGS_FILE.read_text(encoding="utf-8")))
        except Exception as e:  # pragma: no cover
            logging.warning(f"Could not read {SETTINGS_FILE}: {e}. Using defaults.")
    return settings


def save_settings(settings: dict) -> None:
    SETTINGS_FILE.write_text(json.dumps(settings, indent=2), encoding="utf-8")


# ---------------------------------------------------------------------------
# API keys (read from .env) -- never hard-coded.
# ---------------------------------------------------------------------------
def get_keys() -> dict:
    return {
        "anthropic": os.getenv("ANTHROPIC_API_KEY", ""),
        "pexels": os.getenv("PEXELS_API_KEY", ""),
        "pixabay": os.getenv("PIXABAY_API_KEY", ""),
    }


def llm_params(settings: dict) -> dict:
    """
    Turn the chosen provider into the (model, api_key, api_base) LiteLLM needs.
    Ollama is local and needs no key; Claude reads ANTHROPIC_API_KEY.
    """
    keys = get_keys()
    if settings["llm_provider"] == "claude":
        return {
            "model": settings["claude_model"],
            "api_key": keys["anthropic"],
            "api_base": None,
        }
    # default: ollama (local, free)
    return {
        "model": f"ollama/{settings['ollama_model']}",
        "api_key": None,
        "api_base": settings["ollama_base_url"],
    }
