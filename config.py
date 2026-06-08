# ============================================================================
#  OVM Ad Engine -- B-roll placement rules  (EXAMPLE / reference)
# ============================================================================
# Copy any of these into broll_rules.yaml (or edit rules in the web UI).
#
# A "clip id" is the filename of a clip in local_broll/ WITHOUT its extension:
#     local_broll/dc_clip_01.mp4   ->   use: dc_clip_01
#
# Two ways to place a clip:
# ----------------------------------------------------------------------------

placements:

  # 1) PHRASE TRIGGER -- when the founder says this phrase, cut to this clip.
  #    The clip starts exactly when the phrase is spoken and plays for its own
  #    length (you trimmed it; we respect that). Founder audio keeps playing.
  - when: "our data centers"
    use: dc_clip_01

  - when: "our process"
    use: process_montage

  # 2) DIRECT TIMESPAN -- insert a clip between two exact timestamps.
  #    Use this when a phrase is fussy (mis-heard, or said twice). Format MM:SS.s
  - from: "00:12.0"
    to:   "00:16.5"
    use:  site_tour

  # 3) PHRASE TRIGGER WITH AN END -- start at the phrase, stop at a timestamp.
  - when: "year over year"
    to:   "00:45.0"
    use:  growth_chart

# Tips:
#  - Anything you DON'T cover here falls back to auto stock B-roll
#    (if "auto B-roll" is on) or stays on the founder.
#  - Phrase matching ignores punctuation/caps. Keep phrases short & distinctive.
#  - A more accurate Whisper model (large-v3, once GPU is on) = better matches.
