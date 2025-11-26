# Face Recognition Service

Python Flask API for face recognition and verification.

## Setup

### 1. Create Virtual Environment

```bash
python -m venv venv
```

### 2. Activate Virtual Environment

**Windows:**
```bash
venv\Scripts\activate
```

**Linux/Mac:**
```bash
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

**Note for Windows users:** You may need to install Visual Studio Build Tools for dlib compilation.
Download from: https://visualstudio.microsoft.com/visual-cpp-build-tools/

### 4. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` to customize settings if needed.

### 5. Run the Service

```bash
python app.py
```

The service will start on http://localhost:5000

## API Endpoints

### Health Check
```
GET /health
```

### Encode Faces (Registration)
```
POST /encode-faces
Content-Type: application/json

{
  "images": ["base64_image1", "base64_image2", ...]
}
```

### Verify Face (Login)
```
POST /verify-face
Content-Type: application/json

{
  "image": "base64_image",
  "stored_encoding": [array_of_numbers]
}
```

### Compare Two Faces
```
POST /compare-faces
Content-Type: application/json

{
  "image1": "base64_image1",
  "image2": "base64_image2"
}
```

## Configuration

- `PORT`: Server port (default: 5000)
- `DEBUG`: Debug mode (default: False)
- `TOLERANCE`: Face matching tolerance - lower is more strict (default: 0.6)
- `MODEL`: Recognition model - 'small' (faster) or 'large' (more accurate) (default: large)

## Troubleshooting

### dlib installation fails
- Install CMake: `pip install cmake`
- On Windows, install Visual Studio Build Tools
- Try pre-built wheel: `pip install dlib-binary`

### Face not detected
- Ensure good lighting
- Face should be clearly visible
- Only one face should be in frame
- Try the 'small' model for faster detection
