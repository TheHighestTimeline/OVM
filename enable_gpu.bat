"""
Feature 4 -- Viral caption styles, word-level, synced to the transcript.

Four selectable styles: hormozi | mrbeast | karaoke | highlight.
We generate an ASS subtitle file from the word-level timestamps and burn it with
FFmpeg (the lightweight Whisper -> ASS -> FFmpeg technique). Visual look is
inspired by video-wizard / auto-captions, without importing their stacks.

Exposed knobs (from project_settings.json): font, size, primary & highlight
colour, position, and max words per line.
"""
import logging
import config

log = logging.getLogger("captions")

# numpad alignment: 2 bottom-centre, 5 middle-centre, 8 top-centre
_ALIGN = {"bottom": 2, "center": 5, "top": 8}


def _ass_color(hex_color, alpha="00"):
    """#RRGGBB -> &HAABBGGRR (ASS is alpha+BGR)."""
    h = hex_color.lstrip("#")
    r, g, b = h[0:2], h[2:4], h[4:6]
    return f"&H{alpha}{b}{g}{r}".upper()


def _ts(seconds):
    """seconds -> H:MM:SS.cc (centiseconds) for ASS."""
    if seconds < 0:
        seconds = 0
    h = int(seconds // 3600)
    m = int((seconds % 3600) // 60)
    s = seconds % 60
    return f"{h}:{m:02d}:{s:05.2f}"


def _clean(word):
    return word.strip()


def group_lines(words, max_words, max_gap=0.7):
    """Group word tokens into short caption lines (respecting pauses)."""
    lines, cur = [], []
    for i, w in enumerate(words):
        if not _clean(w["word"]):
            continue
        if cur:
            gap = w["start"] - cur[-1]["end"]
            ends_sentence = cur[-1]["word"].strip().endswith((".", "!", "?"))
            if len(cur) >= max_words or gap > max_gap or ends_sentence:
                lines.append(cur)
                cur = []
        cur.append(w)
    if cur:
        lines.append(cur)
    return lines


def build_ass(transcript, settings=None, play_w=1080, play_h=1920):
    """Write an .ass file for the chosen style and return its path.
    play_w/play_h must match the FINAL output dimensions so libass positions
    captions correctly for whatever aspect ratio was chosen."""
    settings = settings or config.load_settings()
    style = settings["caption_style"].lower()
    font = settings["caption_font"]
    size = int(settings["caption_font_size"])
    primary = _ass_color(settings["caption_primary_color"])
    highlight = _ass_color(settings["caption_highlight_color"])
    align = _ALIGN.get(settings["caption_position"], 5)
    max_words = int(settings["caption_max_words"])
    margin_v = 60 if align != 5 else 0

    # per-style tuning
    bold = -1  # ASS: -1 = true
    outline = {"hormozi": 4, "mrbeast": 4, "karaoke": 2, "highlight": 2}.get(style, 3)
    shadow = 2 if style in ("hormozi", "mrbeast") else 0
    uppercase = style in ("hormozi", "mrbeast")

    header = f"""[Script Info]
ScriptType: v4.00+
PlayResX: {play_w}
PlayResY: {play_h}
WrapStyle: 2
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Main,{font},{size},{primary},{highlight},&H00000000,&H64000000,{bold},0,0,0,100,100,0,0,1,{outline},{shadow},{align},80,80,{margin_v},1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""

    events = []
    lines = group_lines(transcript["words"], max_words)

    for line in lines:
        line_words = [(_clean(w["word"]), w) for w in line]
        line_words = [(t.upper() if uppercase else t, w) for t, w in line_words if t]
        if not line_words:
            continue
        l_start = line_words[0][1]["start"]
        l_end = line_words[-1][1]["end"]

        if style == "karaoke":
            # one event for the whole line; \kf sweeps the highlight across words
            parts = []
            for text, w in line_words:
                dur_cs = max(1, int(round((w["end"] - w["start"]) * 100)))
                parts.append(f"{{\\kf{dur_cs}}}{text} ")
            events.append(_dialogue(l_start, l_end,
                                    f"{{\\c{primary}\\2c{highlight}}}" + "".join(parts).strip()))
        else:
            # word-pop: one event per word; active word recoloured (+ scaled for hormozi/mrbeast)
            pop = "\\fscx118\\fscy118" if style in ("hormozi", "mrbeast") else ""
            for idx, (_, aw) in enumerate(line_words):
                seg_start = aw["start"]
                seg_end = line_words[idx + 1][1]["start"] if idx + 1 < len(line_words) else l_end
                rendered = []
                for j, (text, _) in enumerate(line_words):
                    if j == idx:
                        rendered.append(f"{{\\c{highlight}{pop}}}{text}{{\\c{primary}\\fscx100\\fscy100}}")
                    else:
                        rendered.append(text)
                events.append(_dialogue(seg_start, seg_end, " ".join(rendered)))

    ass_path = config.WORK_DIR / "captions.ass"
    ass_path.write_text(header + "\n".join(events) + "\n", encoding="utf-8")
    log.info(f"Built {style} captions ({len(lines)} lines) -> {ass_path}")
    return str(ass_path)


def _dialogue(start, end, text):
    return f"Dialogue: 0,{_ts(start)},{_ts(end)},Main,,0,0,0,,{text}"
