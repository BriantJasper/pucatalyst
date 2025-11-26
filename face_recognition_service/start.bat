@echo off
cd /d "%~dp0"

echo ========================================
echo Starting Face Recognition Service
echo ========================================
echo.

if not exist "venv\Scripts\python.exe" (
    echo ERROR: Virtual environment not found!
    echo Please run: python -m venv venv
    pause
    exit /b 1
)

echo Starting service on http://localhost:5000
echo.
echo Keep this window open while using the application
echo Press Ctrl+C to stop the service
echo ========================================
echo.

venv\Scripts\python.exe app_simple.py

pause
