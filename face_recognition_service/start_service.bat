@echo off
echo ========================================
echo Face Recognition Service Startup
echo ========================================
echo.

REM Check if virtual environment exists
if not exist "venv\Scripts\activate.bat" (
    echo Virtual environment not found. Creating...
    python -m venv venv
    if errorlevel 1 (
        echo Failed to create virtual environment.
        echo Make sure Python is installed and in PATH.
        pause
        exit /b 1
    )
    echo Virtual environment created.
    echo.
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Check if dependencies are installed
echo Checking dependencies...
python -c "import flask" 2>nul
if errorlevel 1 (
    echo Dependencies not found. Installing...
    pip install -r requirements.txt
    if errorlevel 1 (
        echo Failed to install dependencies.
        echo.
        echo If dlib installation fails, try:
        echo   pip install cmake
        echo   pip install dlib-binary
        echo.
        pause
        exit /b 1
    )
)

REM Check if .env exists
if not exist ".env" (
    echo Creating .env file from .env.example...
    copy .env.example .env
)

echo.
echo ========================================
echo Starting Face Recognition Service
echo ========================================
echo Service will run on http://localhost:5000
echo Press Ctrl+C to stop the service
echo ========================================
echo.

REM Start the service
python app.py

pause
