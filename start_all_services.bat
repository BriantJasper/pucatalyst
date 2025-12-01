@echo off
echo ========================================
echo   PU CATALYST - ALL SERVICES STARTER
echo ========================================
echo.
echo This will start all required services:
echo   1. Laravel Backend (port 8000)
echo   2. React Frontend (port 5173)
echo   3. Face Recognition Service (port 5000)
echo   4. AI Recommendation Service (port 5001)
echo.
echo Press Ctrl+C in any window to stop that service
echo.
pause

cd /d "%~dp0"

:: Start Laravel Backend
start "Laravel Backend" cmd /k "php artisan serve"

:: Wait 3 seconds
timeout /t 3 /nobreak >nul

:: Start React Frontend
start "React Frontend" cmd /k "npm run dev"

:: Wait 3 seconds
timeout /t 3 /nobreak >nul

:: Start Face Recognition Service
start "Face Recognition Service" cmd /k "cd face_recognition_service && venv\Scripts\activate && python app_simple.py"

:: Wait 3 seconds
timeout /t 3 /nobreak >nul

:: Start AI Recommendation Service
start "AI Recommendation Service" cmd /k "cd ai_recommendation_service && venv\Scripts\activate && python app.py"

echo.
echo ========================================
echo   All services are starting...
echo ========================================
echo.
echo Services:
echo   - Laravel:           http://localhost:8000
echo   - React Frontend:    http://localhost:5173
echo   - Face Recognition:  http://localhost:5000
echo   - AI Recommendation: http://localhost:5001
echo.
echo Check each terminal window for status
echo Press any key to exit this window
echo ========================================
pause >nul
