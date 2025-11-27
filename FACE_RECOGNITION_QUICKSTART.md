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

### Test Registration (Face Auth is Optional)

1. Go to http://localhost:5173/register
2. Fill in the registration form:
   - Full Name
   - Email Address (@president.ac.id or @student.president.ac.id)
   - **Student ID** (e.g., 002202200123)
   - Password (min 8 characters)
3. **Toggle "Enable Face Authentication"** to enable/disable
4. If enabled: Face capture modal appears after clicking "Create Account"
5. If disabled: Account created without face auth
6. You can enable face auth later from profile settings

### Test Login with Face Verification

1. Go to http://localhost:5173/login
2. Enter your **email OR student ID** and password
3. If face auth is enabled, verification modal appears
4. Look at camera and click "Verify Face"
5. You'll be logged in if face matches
6. If face doesn't match, you'll see an error with confidence score

### Manage Face Authentication in Profile

1. Log in to your account
2. Go to **Profile** (from navbar) → **Security tab**
3. Use the **Face Authentication** section:
   - **Enable**: Click "Enable Face Authentication" → capture 5-7 images
   - **Update**: Click "Update Face Data" → re-capture images
   - **Disable**: Click "Disable" → remove face authentication
4. Same page also has:
   - **Change Password** functionality
   - **Delete Account** option (with confirmation)

## 🎯 Key Features

- ✅ **Toggle in Registration** - enable/disable face auth during signup
- ✅ **Profile Management** - enable, update, or disable face auth anytime
- ✅ **7 Face Captures** when enabling face auth for accuracy
- ✅ **Guided Instructions** for each pose
- ✅ **Real-time Countdown** before capture
- ✅ **Two-Factor Authentication** with face verification
- ✅ **Confidence Score** display on both success and failure
- ✅ **Clear Error Messages** when face doesn't match
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

### Face Does Not Match Error
- Error shows confidence score (e.g., "Confidence: 45.2%")
- Try better lighting conditions
- Ensure you're the registered user
- Can enable/update face auth from profile dashboard

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
