# 🚀 PU Catalyst with Face Recognition - Running Services

## ✅ All Services Are Running

### Service URLs

| Service | URL | Status |
|---------|-----|--------|
| **Frontend (React)** | http://localhost:5173 | ✅ Running |
| **Backend (Laravel)** | http://localhost:8000 | ✅ Running |
| **Face Recognition** | http://localhost:5000 | ✅ Running |

## 🌐 Access the Application

**Main Application URL:** http://localhost:5173

⚠️ **IMPORTANT**: 
- **Use port 5173** (Frontend with Vite)
- **DO NOT use port 8000** (that's just the API backend)

## 🧪 Test Face Recognition

### Register New User
1. Go to: http://localhost:5173/register
2. Fill in registration form:
   - Name
   - Email (@president.ac.id or @student.president.ac.id)
   - Password
   - Role (Student/Alumni)
3. Click "Create Account"
4. **Face Capture Modal appears!** 📸
5. Follow 7 guided poses:
   - Look straight ahead
   - Tilt head left
   - Tilt head right
   - Look up
   - Look down
   - Smile
   - Look straight ahead again
6. System captures images automatically
7. Registration complete!

### Login with Face Verification
1. Go to: http://localhost:5173/login
2. Enter email and password
3. Click "Sign In"
4. **Face Verification Modal appears!** 👤
5. Position face in frame
6. Click "Verify Face"
7. System compares with stored face
8. If match → You're logged in! 🎉

## 🔍 Service Health Checks

### Face Recognition Service
```
GET http://localhost:5000/health
```
Response:
```json
{
  "status": "healthy",
  "service": "face_recognition_simple",
  "version": "1.0.0",
  "backend": "opencv"
}
```

### Laravel API
```
GET http://localhost:8000/api/auth/me
```
(Requires authentication token)

## 📝 Database

- **Type**: SQLite
- **Location**: `database/database.sqlite`
- **Tables**: All migrated including `users` with face_encoding fields

## ⚙️ Configuration

### Environment Variables (.env)
```env
DB_CONNECTION=sqlite
FACE_RECOGNITION_SERVICE_URL=http://localhost:5000
```

### Face Recognition Settings
- **Backend**: OpenCV (no dlib required)
- **Tolerance**: 0.85 (similarity threshold)
- **Minimum Images**: 5 for registration
- **Maximum Images**: 7 for registration

## 🛑 Stop Services

To stop all services:
1. Close all command prompt windows
2. Or press `Ctrl+C` in each terminal

## 🔄 Restart Services

If you need to restart:

```powershell
# Face Recognition Service
cd face_recognition_service
venv\Scripts\python.exe app_simple.py

# Laravel Backend (new terminal)
php artisan serve

# Frontend (new terminal)
npm run dev
```

## 🐛 Troubleshooting

### "Vite manifest not found"
- You're accessing http://localhost:8000 instead of http://localhost:5173
- Solution: Use http://localhost:5173

### "Face Recognition Service not responding"
- Check if Python service is running
- Visit: http://localhost:5000/health
- Restart if needed

### "Camera not working"
- Grant browser camera permissions
- Check browser settings
- Ensure good lighting

### "Face not detected"
- Improve lighting
- Only one person in frame
- Face clearly visible
- Remove glasses if possible

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register with optional face images
- `POST /api/auth/login` - Login (checks for face auth requirement)
- `POST /api/auth/verify-face` - Verify face during login

### Face Recognition Service
- `GET /health` - Health check
- `POST /encode-faces` - Encode face images (registration)
- `POST /verify-face` - Verify face (login)
- `POST /compare-faces` - Compare two faces

## ✨ Features Implemented

- ✅ Face capture during registration (7 guided poses)
- ✅ Face verification during login (2FA)
- ✅ OpenCV-based face detection (easy install)
- ✅ Automatic countdown before capture
- ✅ Real-time camera preview
- ✅ Progress tracking
- ✅ Confidence score display
- ✅ Error handling with retry
- ✅ Optional feature (can skip)
- ✅ Secure encrypted storage

## 🎉 You're All Set!

Your complete face recognition authentication system is ready!

**Start testing at:** http://localhost:5173
