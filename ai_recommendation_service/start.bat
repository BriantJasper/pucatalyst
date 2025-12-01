@echo off
echo ========================================
echo   AI Recommendation Service
echo ========================================
echo.
echo Starting service on http://localhost:5001
echo Press Ctrl+C to stop
echo.

cd /d "%~dp0"

if not exist venv (
    echo Error: Virtual environment not found!
    echo Please run: python -m venv venv
    pause
    exit /b 1
)

:: Activate venv and start service
call venv\Scripts\activate.bat
python app.py

pause
