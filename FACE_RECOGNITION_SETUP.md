# Face Recognition Authentication Setup Guide

This guide will help you set up the face recognition authentication feature for PU Catalyst.

## Overview

The system uses a two-factor authentication approach:
1. **Registration**: Users provide email/password and capture 5-7 face images
2. **Login**: Users enter email/password, then verify their face to complete login

## Prerequisites

- Python 3.8 or higher
- PHP 8.1 or higher
- Node.js 18 or higher
- Webcam access (for face capture)

## Step 1: Set Up Python Face Recognition Service

### Windows Installation

1. Navigate to the face recognition service directory:
```powershell
cd face_recognition_service
```

2. Create a virtual environment:
```powershell
python -m venv venv
```

3. Activate the virtual environment:
```powershell
venv\Scripts\activate
```

4. Install Visual Studio Build Tools (required for dlib):
   - Download from: https://visualstudio.microsoft.com/visual-cpp-build-tools/
   - Install "Desktop development with C++" workload

5. Install dependencies:
```powershell
pip install -r requirements.txt
```

**Note**: If dlib installation fails, try:
```powershell
pip install cmake
pip install dlib-binary
```

6. Create environment file:
```powershell
copy .env.example .env
```

7. Start the service:
```powershell
python app.py
```

The service will start on http://localhost:5000

### Linux/Mac Installation

1. Navigate to the face recognition service directory:
```bash
cd face_recognition_service
```

2. Create a virtual environment:
```bash
python3 -m venv venv
```

3. Activate the virtual environment:
```bash
source venv/bin/activate
```

4. Install system dependencies (Ubuntu/Debian):
```bash
sudo apt-get update
sudo apt-get install build-essential cmake
sudo apt-get install libopenblas-dev liblapack-dev
sudo apt-get install libx11-dev libgtk-3-dev
```

For macOS:
```bash
brew install cmake
```

5. Install Python dependencies:
```bash
pip install -r requirements.txt
```

6. Create environment file:
```bash
cp .env.example .env
```

7. Start the service:
```bash
python app.py
```

## Step 2: Update Laravel Environment

Add the following to your `.env` file:

```env
# Face Recognition Service
FACE_RECOGNITION_SERVICE_URL=http://localhost:5000
```

## Step 3: Run Database Migration

Run the migration to add face recognition fields to the users table:

```bash
php artisan migrate
```

This will add:
- `face_encoding` - Stores the encoded face data
- `face_auth_enabled` - Boolean flag for face authentication status
- `face_registered_at` - Timestamp of face registration

## Step 4: Install Frontend Dependencies

Make sure you have the latest dependencies:

```bash
npm install
```

## Step 5: Start the Application

1. Start the Laravel backend:
```bash
php artisan serve
```

2. Start the Vite development server:
```bash
npm run dev
```

3. Ensure the Python face recognition service is running (from Step 1)

## How It Works

### Registration Flow

1. User fills in registration form (name, email, password, role)
2. Upon form submission, face capture modal appears
3. System captures 5-7 images with guided instructions:
   - Look straight ahead
   - Tilt left
   - Tilt right
   - Look up
   - Look down
   - Smile
   - Look straight again
4. Images are sent to Python service for encoding
5. Average encoding is calculated and stored in database
6. User account is created with face authentication enabled

### Login Flow

1. User enters email and password
2. If credentials are valid and face auth is enabled:
   - System returns temporary token
   - Face verification modal appears
3. User captures single face image
4. Image is sent to Python service with stored encoding
5. Service compares faces and returns match result
6. If match succeeds, user is logged in
7. If match fails, user sees error and can retry

## API Endpoints

### Python Service

- `GET /health` - Health check
- `POST /encode-faces` - Encode multiple face images (registration)
- `POST /verify-face` - Verify face against stored encoding (login)
- `POST /compare-faces` - Compare two face images directly

### Laravel API

- `POST /api/auth/register` - Register with optional face images
- `POST /api/auth/login` - Login (returns face verification requirement if enabled)
- `POST /api/auth/verify-face` - Verify face during login

## Configuration

### Python Service Configuration (.env)

```env
PORT=5000                # Service port
DEBUG=False              # Debug mode
TOLERANCE=0.6            # Face matching tolerance (0.0-1.0, lower is stricter)
MODEL=large              # Recognition model: 'small' (faster) or 'large' (accurate)
```

### Tolerance Settings

- `0.6` (default) - Balanced security and usability
- `0.5` - Stricter matching (more false rejections)
- `0.7` - Looser matching (more false acceptances)

## Troubleshooting

### Camera Access Issues

**Browser Permission Denied:**
1. Check browser permissions for camera access
2. Ensure site is served over HTTPS (except localhost)
3. In Chrome: chrome://settings/content/camera

### Python Service Issues

**dlib installation fails:**
- Install CMake: `pip install cmake`
- On Windows, install Visual Studio Build Tools
- Try pre-built wheel: `pip install dlib-binary`

**Face not detected:**
- Ensure good lighting conditions
- Face should be clearly visible
- Only one face should be in frame
- Try the 'small' model for faster detection

**Service connection error:**
- Verify Python service is running on port 5000
- Check `FACE_RECOGNITION_SERVICE_URL` in Laravel `.env`
- Check firewall settings

### Performance Issues

**Slow face encoding:**
- Use 'small' model instead of 'large'
- Reduce image quality in frontend
- Ensure adequate system resources

**Slow face verification:**
- Consider using GPU acceleration (requires dlib with CUDA)
- Optimize image size before sending to service

## Security Considerations

1. **Face Encodings**: Stored encodings are one-way transformations and cannot be reversed to reconstruct the original face
2. **HTTPS**: Always use HTTPS in production to protect image data in transit
3. **Rate Limiting**: Consider adding rate limits to prevent abuse
4. **Fallback Authentication**: Users can still login with password if face verification fails
5. **Data Privacy**: Face data is processed locally and not sent to third parties

## Production Deployment

### Python Service

1. Use production WSGI server (Gunicorn):
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

2. Use process manager (systemd, supervisor)
3. Set DEBUG=False in production
4. Use reverse proxy (nginx) for SSL termination

### Scaling

- Deploy Python service on separate server
- Use load balancer for multiple instances
- Consider Redis for caching face encodings
- Monitor service health and performance

## Support

For issues or questions:
- Check service logs: `face_recognition_service/logs/`
- Check Laravel logs: `storage/logs/laravel.log`
- Enable DEBUG mode for detailed error messages

## Future Enhancements

- [ ] Liveness detection (prevent photo/video spoofing)
- [ ] Multiple face enrollment for better accuracy
- [ ] Face re-enrollment for updated photos
- [ ] Admin dashboard for face auth management
- [ ] Analytics and audit logs
- [ ] Mobile app support
