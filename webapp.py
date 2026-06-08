"""
Feature 7 -- GPU word-level transcription.

faster-whisper (CTranslate2 backend) on CUDA with a large model, producing
word-level timestamps. These timestamps power BOTH the phrase-triggered B-roll
placement (placement.py) and the word-level captions (captions.py), so accuracy
here matters most.

Falls back to CPU automatically if CUDA libraries aren't available, so it always
runs -- it just runs slower.
"""
import os
import sys
import glob
import logging
from faster_whisper import WhisperModel
from moviepy.editor import VideoFileClip

import config

log = logging.getLogger("transcriber")


def _register_cuda_dlls():
    """
    If the CUDA libs from `enable_gpu.bat` (nvidia-cublas-cu12 / nvidia-cudnn-cu12)
    are installed in the venv, add their bin dirs so CTranslate2 can find
    cublas64_12.dll / cudnn DLLs on Windows. No-op if not installed.
    """
    if os.name != "nt":
        return
    site = os.path.join(sys.prefix, "Lib", "site-packages", "nvidia")
    for binpath in glob.glob(os.path.join(site, "*", "bin")):
        try:
            os.add_dll_directory(binpath)
        except Exception:
            pass


def extract_audio(video_path, out_path=None):
    """Pull the audio track out of the founder's video as a wav for Whisper."""
    video_path = str(video_path)
    if not os.path.exists(video_path):
        log.error(f"Video file not found: {video_path}")
        return None
    out_path = out_path or str(config.WORK_DIR / "narration.wav")
    try:
        log.info(f"Extracting audio from {video_path} ...")
        clip = VideoFileClip(video_path)
        if clip.audio is None:
            log.error("That video has no audio track to transcribe.")
            clip.close()
            return None
        clip.audio.write_audiofile(out_path, codec="pcm_s16le", fps=16000, logger=None)
        clip.audio.close()
        clip.close()
        log.info(f"Audio saved to {out_path}")
        return out_path
    except Exception as e:
        log.error(f"Failed to extract audio: {e}")
        return None


def _run(model, audio_path):
    """Run transcription and materialize results (errors surface here, not at load)."""
    segments_gen, info = model.transcribe(audio_path, word_timestamps=True)
    words, segments, full_text = [], [], []
    for seg in segments_gen:  # CUDA errors fire while iterating this lazy generator
        seg_words = []
        for w in (seg.words or []):
            token = {"word": w.word, "start": round(w.start, 3), "end": round(w.end, 3)}
            words.append(token)
            seg_words.append(token)
        segments.append({
            "start": round(seg.start, 3),
            "end": round(seg.end, 3),
            "text": seg.text.strip(),
            "words": seg_words,
        })
        full_text.append(seg.text)
    return {"text": "".join(full_text).strip(), "words": words, "segments": segments}


def transcribe(audio_path, settings=None):
    """
    Returns a transcript dict:
      {"text": "...", "words": [{"word","start","end"}], "segments": [{...}]}

    Tries the configured device (CUDA); if the GPU libraries (cuBLAS/cuDNN) aren't
    installed, falls back to CPU automatically so it always produces a result.
    """
    settings = settings or config.load_settings()
    if not os.path.exists(audio_path):
        log.error(f"Audio file not found: {audio_path}")
        return None

    model_name = settings["whisper_model"]
    attempts = []
    if settings["whisper_device"] != "cpu":
        _register_cuda_dlls()
        attempts.append((settings["whisper_device"], settings["whisper_compute_type"]))
    attempts.append(("cpu", "int8"))  # always-available fallback

    last_err = None
    for device, compute in attempts:
        try:
            log.info(f"Loading Whisper '{model_name}' on {device} ({compute}) ...")
            model = WhisperModel(model_name, device=device, compute_type=compute)
            log.info("Transcribing (word-level timestamps) ...")
            result = _run(model, audio_path)
            log.info(f"Transcribed {len(result['words'])} words on {device}.")
            return result
        except Exception as e:
            last_err = e
            if device != "cpu":
                log.warning(f"GPU transcription unavailable ({e}). Falling back to CPU "
                            "(slower). See DEV_NOTES.md to enable GPU.")
            else:
                log.error(f"Transcription failed on CPU too: {e}")
    return None
