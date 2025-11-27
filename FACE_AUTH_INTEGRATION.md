# Face Authentication Integration Guide

## 🎛️ Toggle Face Auth During Registration

The registration page now has a **toggle switch** that allows users to enable/disable face authentication during signup.

### How it works:

1. User fills registration form
2. Toggle "Enable Face Authentication" switch
3. If **enabled**: Face capture modal appears after submit
4. If **disabled**: Account created without face auth

The toggle provides instant feedback showing what will happen.

---

## 🔧 Profile Dashboard Integration

Use the `FaceAuthSettings` component to allow users to manage face authentication from their profile.

### Quick Integration:

```jsx
import FaceAuthSettings from '../components/FaceAuthSettings';

function ProfilePage() {
  const { user, setAuth } = useAuthStore();

  const handleUserUpdate = (updatedUser) => {
    setAuth(updatedUser, localStorage.getItem('access_token'));
  };

  return (
    <div>
      {/* Your other profile content */}
      
      <FaceAuthSettings 
        user={user} 
        onUpdate={handleUserUpdate}
      />
    </div>
  );
}
```

### FaceAuthSettings Features:

✅ **Enable Face Auth** - Capture 5-7 face images  
✅ **Update Face Data** - Re-capture images anytime  
✅ **Disable Face Auth** - Remove face authentication  
✅ **Status Display** - Shows enabled/disabled state  
✅ **Registration Date** - Shows when face was registered  
✅ **Info Box** - Explains how face auth works  

---

## 📡 API Endpoints

### Setup Face Authentication
```javascript
POST /api/auth/setup-face-auth
Authorization: Bearer {token}

Body:
{
  "face_images": [
    "data:image/jpeg;base64,...",
    "data:image/jpeg;base64,...",
    // 5-7 images
  ]
}

Response:
{
  "success": true,
  "message": "Face authentication enabled successfully",
  "images_processed": 7
}
```

### Disable Face Authentication
```javascript
POST /api/auth/disable-face-auth
Authorization: Bearer {token}

Response:
{
  "success": true,
  "message": "Face authentication disabled successfully"
}
```

---

## 🎨 UI Components

### 1. Registration Toggle

The toggle appears in the registration form with:
- Modern switch design
- "Optional" badge
- Dynamic description based on state
- Placed above the submit button

### 2. FaceAuthSettings Component

Complete settings panel with:
- Status card (green for enabled, gray for disabled)
- Info box explaining how it works
- Action buttons (Enable/Update/Disable)
- Registration date display
- Loading states
- Face capture modal integration

---

## 🔄 User Flow

### Enable During Registration:
```
Register → Toggle ON → Submit → Face Capture Modal → 7 Poses → Account Created with Face Auth
```

### Enable from Profile:
```
Login → Settings → Security Tab → Enable Face Auth → Face Capture Modal → 7 Poses → Face Auth Enabled
```

### Disable from Profile:
```
Login → Settings → Security Tab → Disable Button → Confirm → Face Auth Disabled
```

### Update Face Data:
```
Login → Settings → Security Tab → Update Face Data → Face Capture Modal → 7 Poses → Face Data Updated
```

---

## 🎯 Example Implementation

See `resources/js/pages/ProfileSettingsExample.jsx` for a complete example of:
- Tab-based settings page
- Profile and Security sections
- FaceAuthSettings integration
- User data management

You can adapt this to your existing profile/settings page structure.

---

## 🔒 Security Notes

- Face encodings are **encrypted** and **irreversible**
- Users can enable/disable anytime
- No face data required to register
- Two-factor auth only when enabled
- Clear error messages with confidence scores

---

## ✨ Best Practices

1. **Place toggle in registration** - Let users choose during signup
2. **Add settings page** - Allow management after registration
3. **Show registration date** - Display when face was last registered
4. **Provide clear feedback** - Toast notifications for all actions
5. **Handle errors gracefully** - Show confidence scores on failure
6. **Test camera access** - Ensure browser permissions are granted

---

## 🚀 Quick Start

1. **Registration**: Toggle is already added to `RegisterPage.jsx`
2. **Profile Settings**: Import and use `FaceAuthSettings` component
3. **Test**: 
   - Register with toggle ON → Face capture happens
   - Register with toggle OFF → No face capture
   - Profile → Enable/Update/Disable face auth

That's it! Face authentication is now fully optional and manageable! 🎉
