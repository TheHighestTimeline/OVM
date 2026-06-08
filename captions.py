"""
Feature 1 -- Bring-your-own B-roll library.

Scans local_broll/ for clips you (or your team) dropped in, and registers each
one by a short ID so you can reference it in broll_rules.yaml.

The ID is just the filename without extension, lowercased:
    local_broll/dc_clip_01.mp4   ->  id "dc_clip_01"

We do NOT re-trim or stretch your clips. You cut them to length; we respect that.
(There's an optional fit_to_span flag, off by default, handled at render time.)
"""
import logging
import config

log = logging.getLogger("broll_library")

VIDEO_EXTS = {".mp4", ".mov", ".m4v", ".webm", ".mkv", ".avi"}


def scan():
    """Return {clip_id: absolute_path} for every clip in local_broll/."""
    registry = {}
    for path in sorted(config.LOCAL_BROLL_DIR.iterdir()):
        if path.is_file() and path.suffix.lower() in VIDEO_EXTS:
            clip_id = path.stem.lower().strip()
            if clip_id in registry:
                log.warning(f"Duplicate clip id '{clip_id}' -- keeping {registry[clip_id]}")
                continue
            registry[clip_id] = str(path.resolve())
    return registry


def list_clips():
    """Human-friendly listing for the CLI / web UI."""
    reg = scan()
    if not reg:
        log.info(f"No clips found in {config.LOCAL_BROLL_DIR}. Drop .mp4/.mov files there.")
    else:
        log.info(f"Found {len(reg)} local B-roll clip(s):")
        for cid, p in reg.items():
            log.info(f"  - {cid}  ->  {p}")
    return reg
