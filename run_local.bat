"""
Feature 2 -- Manual transcript-anchored B-roll placement (the core feature).

You write simple rules in broll_rules.yaml, two ways:

  # Phrase trigger: when the founder says this, drop in this clip (at that moment)
  - when: "our data centers"
    use: dc_clip_01

  # Direct timespan: insert a clip between two timestamps
  - from: "00:12.0"
    to:   "00:16.5"
    use:  site_clip_03

Phrase triggers are resolved to EXACT timestamps using the word-level transcript
from transcriber.py. The resulting placements are merged into the editing script
and OVERRIDE the LLM's auto B-roll for those spans (see video_processor.py).
"""
import re
import logging
from pathlib import Path
import yaml

import config
import broll_library

log = logging.getLogger("placement")

_WORD_RE = re.compile(r"[a-z0-9']+")


def parse_timestamp(value):
    """Accept '00:12.0', '1:02:03.5', '12', or a number -> seconds (float)."""
    if isinstance(value, (int, float)):
        return float(value)
    parts = str(value).strip().split(":")
    parts = [float(p) for p in parts]
    seconds = 0.0
    for p in parts:
        seconds = seconds * 60 + p
    return seconds


def _normalize(text):
    return _WORD_RE.findall(text.lower())


def _find_phrase(phrase, words):
    """
    Locate `phrase` in the word-timestamp stream.
    Returns (start_sec, end_sec) of the matched span, or None if not found.
    Warns if the phrase occurs more than once (uses the first occurrence).
    """
    target = _normalize(phrase)
    if not target:
        return None
    norm = [(_normalize(w["word"]), w) for w in words]
    # flatten: some "words" tokens carry punctuation/multiple tokens
    flat = []
    for toks, w in norm:
        for t in toks:
            flat.append((t, w))

    matches = []
    n = len(target)
    for i in range(len(flat) - n + 1):
        if [flat[i + j][0] for j in range(n)] == target:
            start = flat[i][1]["start"]
            end = flat[i + n - 1][1]["end"]
            matches.append((start, end))

    if not matches:
        return None
    if len(matches) > 1:
        log.warning(
            f"Phrase '{phrase}' occurs {len(matches)}x; using the first at "
            f"{matches[0][0]:.2f}s. Use a from/to rule if you meant a later one."
        )
    return matches[0]


def load_rules():
    """Read broll_rules.yaml -> list of raw rule dicts (empty list if none)."""
    if not config.RULES_FILE.exists():
        log.info(f"No {config.RULES_FILE.name} found -- skipping manual placements.")
        return []
    try:
        data = yaml.safe_load(config.RULES_FILE.read_text(encoding="utf-8")) or []
    except Exception as e:
        log.error(f"Could not parse {config.RULES_FILE.name}: {e}. Ignoring manual rules.")
        return []

    if isinstance(data, dict):
        rules = data.get("placements", [])
    elif isinstance(data, list):
        rules = data
    else:
        # e.g. someone pasted free-form prose instead of YAML rules
        log.warning(
            f"{config.RULES_FILE.name} isn't valid placement rules. Expected a "
            "'placements:' list of '- when: \"...\"  use: clip_id' entries. "
            "Ignoring it -- no manual B-roll this run."
        )
        return []

    if not isinstance(rules, list):
        log.warning(f"'placements' in {config.RULES_FILE.name} must be a list. Ignoring.")
        return []
    return rules


def resolve(transcript, settings=None):
    """
    Turn rules + transcript into concrete placements:
      [{"clip_id","path","start","end" or None,"source":"manual","rule":<raw>}]

    end == None means "play the clip's own natural length from `start`"
    (we don't re-trim your footage unless fit_to_span is on at render time).
    """
    settings = settings or config.load_settings()
    rules = load_rules()
    if not rules:
        return []

    library = broll_library.scan()
    words = transcript["words"]
    placements = []

    for rule in rules:
        if not isinstance(rule, dict):
            log.warning(f"Skipping malformed rule (needs 'when'/'from' + 'use'): {rule!r}")
            continue
        clip_id = str(rule.get("use", "")).lower().strip()
        if not clip_id:
            log.warning(f"Rule missing 'use': {rule} -- skipped.")
            continue
        if clip_id not in library:
            log.warning(
                f"Rule references '{clip_id}' but no such clip in local_broll/. "
                f"Available: {sorted(library)} -- skipped."
            )
            continue

        if "when" in rule:  # phrase trigger
            found = _find_phrase(rule["when"], words)
            if not found:
                log.warning(f"Phrase '{rule['when']}' not found in transcript -- skipped.")
                continue
            start = found[0]
            end = parse_timestamp(rule["to"]) if rule.get("to") else None
        elif "from" in rule:  # direct timespan
            start = parse_timestamp(rule["from"])
            end = parse_timestamp(rule["to"]) if rule.get("to") else None
        else:
            log.warning(f"Rule needs 'when' or 'from': {rule} -- skipped.")
            continue

        placements.append({
            "clip_id": clip_id,
            "path": library[clip_id],
            "start": round(float(start), 3),
            "end": round(float(end), 3) if end is not None else None,
            "source": "manual",
            "rule": rule,
        })
        log.info(f"Placement: '{clip_id}' at {start:.2f}s"
                 + (f"-{end:.2f}s" if end else " (clip's natural length)"))

    # sort by start; clamp overlaps so a later clip never gets covered by an earlier one
    placements.sort(key=lambda p: p["start"])
    return placements
