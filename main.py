@echo off
REM ===== Turn on GPU transcription (much faster) on your RTX 4060 Ti =====
REM Installs the CUDA 12 cuBLAS + cuDNN libraries faster-whisper needs.
REM The app auto-detects them at runtime (see transcriber.py); if they're
REM missing it just falls back to CPU.
cd /d "%~dp0"
venv\Scripts\python.exe -m pip install nvidia-cublas-cu12 nvidia-cudnn-cu12
echo.
echo GPU libraries installed. In the web UI, set Whisper model to "large-v3"
echo for best accuracy. If you still see "falling back to CPU", reboot once.
pause
