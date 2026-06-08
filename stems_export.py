@echo off
REM ===== One-time setup: build the Python 3.11 environment and install deps =====
cd /d "%~dp0"
echo Creating Python 3.11 virtual environment...
py -3.11 -m venv venv || (echo Could not find Python 3.11. Install it from python.org, then re-run. & pause & exit /b 1)
echo Installing dependencies (this takes a few minutes)...
venv\Scripts\python.exe -m pip install --upgrade pip
venv\Scripts\python.exe -m pip install -r requirements.txt
echo.
echo Done. Now run:  run_local.bat
pause
