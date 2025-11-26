# Quick Start - Face Recognition Feature

## 🚀 Quick Setup (5 minutes)

### 1. Start Python Face Recognition Service

```powershell
# Navigate to service directory
cd face_recognition_service

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate

# Install dependencies (first time only)
pip install -r requirements_simple.txt

# Start the service (using OpenCV version - easier to install!)
python app_simple.py
```

Service will run on: http://localhost:5000

### 2. Update Laravel Configuration

Add to your `.env` file:
```env
FACE_RECOGNITION_SERVICE_URL=http://localhost:5000
```

### 3. Run Database Migration

```bash
php artisan migrate
```

### 4. Start Your Application

```bash
# Terminal 1 - Laravel
php artisan serve

# Terminal 2 - Frontend
npm run dev

# Terminal 3 - Python Service (already running from Step 1)
```

## ✅ Test the Feature

### Test Registration with Face Capture

1. Go to http://localhost:5173/register
2. Fill in the registration form
3. Click "Create Account"
4. Face capture modal will appear
5. Follow on-screen instructions (7 poses)
6. Complete registration

### Test Login with Face Verification

1. Go to http://localhost:5173/login
2. Enter your email and password
3. Face verification modal will appear
4. Look at camera and click "Verify Face"
5. You'll be logged in if face matches

## 🎯 Key Features

- ✅ **7 Face Captures** during registration for accuracy
- ✅ **Guided Instructions** for each pose
- ✅ **Real-time Countdown** before capture
- ✅ **Two-Factor Authentication** with face verification
- ✅ **Confidence Score** display after verification
- ✅ **Optional Feature** - can register without face auth
- ✅ **Secure Storage** - face encodings are encrypted

## 🛠️ Troubleshooting

### Camera Not Working
- Grant camera permissions in browser
- Check browser console for errors
- Ensure good lighting

### Python Service Connection Error
- Verify service is running: http://localhost:5000/health
- Check firewall settings
- Verify FACE_RECOGNITION_SERVICE_URL in .env

### Face Not Detected
- Ensure face is clearly visible
- Only one person in frame
- Remove glasses if possible
- Improve lighting

## 📋 Requirements

- **Python 3.8+** with pip
- **PHP 8.1+** 
- **Node.js 18+**
- **Webcam** access
- **Good lighting** for face capture

**Note:** We use `app_simple.py` with OpenCV (no dlib required - much easier to install on Windows!)

## 🔧 Configuration

Default settings in `face_recognition_service/.env`:
```env
PORT=5000          # Service port
TOLERANCE=0.85     # Similarity threshold (higher = stricter, for OpenCV)
```

**Backend:** OpenCV-based (no dlib compilation needed!)

## 📚 Full Documentation

See [FACE_RECOGNITION_SETUP.md](./FACE_RECOGNITION_SETUP.md) for detailed setup and configuration.

## 🔐 Security Notes

- Face encodings are one-way and cannot be reversed
- All data is processed locally
- No third-party services involved
- HTTPS required in production
- Optional feature - users can opt out

## 🎉 That's It!

Your face recognition authentication is now ready. Users can register and login with facial verification!
