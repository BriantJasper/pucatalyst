@echo off
echo Starting AI Recommendation Service...
cd /d "%~dp0"

if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
)

call venv\Scripts\activate.bat
echo Installing/Updating dependencies...
pip install -r requirements.txt

echo.
echo Starting service on http://localhost:5001
python app.py
