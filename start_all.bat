@echo off
echo ========================================
echo Starting All Services for PU Catalyst
echo ========================================
echo.

echo 1. Starting Laravel Backend (Port 8000)...
start "Laravel Backend" cmd /k "php artisan serve"

echo 2. Starting React Frontend (Port 5173)...
start "React Frontend" cmd /k "npm run dev"

echo 3. Starting Face Recognition Service (Port 5000)...
start "Face Recognition Service" cmd /k "cd face_recognition_service && start.bat"

echo 4. Starting AI Recommendation Service (Port 5001)...
start "AI Recommendation Service" cmd /k "cd ai_recommendation_service && start.bat"

echo.
echo ========================================
echo All services have been launched in separate windows.
echo Please do not close the terminal windows.
echo ========================================
pause
