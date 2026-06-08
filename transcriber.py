"""
Feature 5 -- Stems export for CapCut hand-off.

On every render we also drop a stems/<name>/ folder containing the building
blocks so you can finish the edit in CapCut without us building an editor:
  - the founder video (the audio + video spine),
  - each B-roll clip actually used, numbered in order,
  - the continuous narration audio,
  - the subtitles (.srt and .ass),
  - manifest.json with clip order + timings.
Then we zip it.
"""
import json
import shutil
import zipfile
import logging
from datetime import datetime
from pathlib import Path

import config

log = logging.getLogger("stems_export")


def _srt_ts(seconds):
    ms = int(round(seconds * 1000))
    h, ms = divmod(ms, 3600000)
    m, ms = divmod(ms, 60000)
    s, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


def build_srt(transcript, dest):
    lines = []
    for i, seg in enumerate(transcript["segments"], 1):
        lines.append(str(i))
        lines.append(f"{_srt_ts(seg['start'])} --> {_srt_ts(seg['end'])}")
        lines.append(seg["text"])
        lines.append("")
    Path(dest).write_text("\n".join(lines), encoding="utf-8")
    return str(dest)


def export(name, founder_path, placements, transcript, narration_path, ass_path, settings):
    """Build stems/<name>/ and zip it. Returns the zip path."""
    stem_dir = config.STEMS_DIR / name
    if stem_dir.exists():
        shutil.rmtree(stem_dir)
    stem_dir.mkdir(parents=True)

    # founder spine
    founder_dest = stem_dir / f"00_founder{Path(founder_path).suffix}"
    shutil.copy(founder_path, founder_dest)

    # narration audio
    narration_dest = None
    if narration_path and Path(narration_path).exists():
        narration_dest = stem_dir / "narration.wav"
        shutil.copy(narration_path, narration_dest)

    # subtitles
    srt_dest = build_srt(transcript, stem_dir / "captions.srt")
    if ass_path and Path(ass_path).exists():
        shutil.copy(ass_path, stem_dir / "captions.ass")

    # b-roll clips in order
    manifest_clips = []
    for i, p in enumerate(placements, 1):
        src = Path(p["path"])
        clip_dest = stem_dir / f"{i:02d}_{p['source']}_{p['clip_id']}{src.suffix}"
        if src.exists():
            shutil.copy(src, clip_dest)
        manifest_clips.append({
            "order": i,
            "clip_id": p["clip_id"],
            "source": p["source"],
            "start": p["start"],
            "end": p["end"],
            "file": clip_dest.name,
        })

    manifest = {
        "project": name,
        "created": datetime.now().isoformat(timespec="seconds"),
        "founder_video": founder_dest.name,
        "narration": narration_dest.name if narration_dest else None,
        "captions": {"srt": "captions.srt", "ass": Path(ass_path).name if ass_path else None},
        "caption_style": settings.get("caption_style"),
        "duration_hint": transcript["segments"][-1]["end"] if transcript["segments"] else None,
        "placements": manifest_clips,
        "note": "Drop these into CapCut. Founder audio is the spine; B-roll clips "
                "cover the video only, in the order/timing listed above.",
    }
    (stem_dir / "manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")

    # zip it
    zip_path = config.STEMS_DIR / f"{name}.zip"
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
        for f in stem_dir.rglob("*"):
            zf.write(f, f.relative_to(stem_dir.parent))
    log.info(f"Stems package: {zip_path}")
    return str(zip_path)
