# --- Core pipeline ---
# moviepy pinned to 1.x: the base code uses `from moviepy.editor import ...`
# and 1.x method names (.subclip/.resize/.set_duration). moviepy 2.x removed these.
moviepy==1.0.3
imageio==2.34.2
imageio-ffmpeg==0.4.9
Pillow==10.4.0
numpy==1.26.4

# --- Transcription (GPU via CTranslate2, no torch needed) ---
faster-whisper==1.0.3

# --- LLM (Ollama local + Claude toggle) ---
litellm==1.44.22
python-dotenv==1.0.1

# --- Stock assets ---
requests==2.32.3

# --- Config / rules ---
PyYAML==6.0.2

# --- Local web UI + shareable tunnel (added in BYO build) ---
fastapi==0.111.1
uvicorn[standard]==0.30.3
python-multipart==0.0.9
jinja2==3.1.4
