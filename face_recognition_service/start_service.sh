#!/bin/bash

echo "========================================"
echo "Face Recognition Service Startup"
echo "========================================"
echo ""

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Virtual environment not found. Creating..."
    python3 -m venv venv
    if [ $? -ne 0 ]; then
        echo "Failed to create virtual environment."
        echo "Make sure Python 3 is installed."
        exit 1
    fi
    echo "Virtual environment created."
    echo ""
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Check if dependencies are installed
echo "Checking dependencies..."
python -c "import flask" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "Dependencies not found. Installing..."
    pip install -r requirements.txt
    if [ $? -ne 0 ]; then
        echo "Failed to install dependencies."
        echo ""
        echo "On Ubuntu/Debian, you may need to install system dependencies:"
        echo "  sudo apt-get install build-essential cmake"
        echo "  sudo apt-get install libopenblas-dev liblapack-dev"
        echo ""
        exit 1
    fi
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
fi

echo ""
echo "========================================"
echo "Starting Face Recognition Service"
echo "========================================"
echo "Service will run on http://localhost:5000"
echo "Press Ctrl+C to stop the service"
echo "========================================"
echo ""

# Start the service
python app.py
