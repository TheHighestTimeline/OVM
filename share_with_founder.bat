@echo off
REM ===== OVM Ad Engine -- start the local web app and open it in your browser =====
cd /d "%~dp0"
if not exist "venv\Scripts\python.exe" (
  echo First time? Run setup.bat once before this.
  pause
  exit /b 1
)
echo Starting OVM Ad Engine at http://localhost:8000  (close this window to stop)
start "" http://localhost:8000
venv\Scripts\python.exe -m uvicorn webapp:app --host 127.0.0.1 --port 8000
