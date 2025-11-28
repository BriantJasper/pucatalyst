import requests
import json
import base64
import cv2
import numpy as np
from io import BytesIO
from PIL import Image

# Configuration
API_URL = "http://localhost:8000/api"
FACE_SERVICE_URL = "http://localhost:5000"

def capture_face_from_webcam():
    """Capture face image from webcam"""
    print("\n📷 Opening webcam...")
    cap = cv2.VideoCapture(0)
    
    if not cap.isOpened():
        print("❌ Cannot open webcam")
        return None
    
    print("👤 Position your face in front of camera")
    print("   Press SPACE to capture")
    print("   Press ESC to cancel")
    
    # Load face detector
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        
        # Detect faces
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, 1.3, 5)
        
        # Draw rectangle around faces
        for (x, y, w, h) in faces:
            cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 255, 0), 2)
            cv2.putText(frame, "Face Detected", (x, y-10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
        
        # Show instructions
        cv2.putText(frame, "SPACE: Capture | ESC: Cancel", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
        
        cv2.imshow('Capture Face', frame)
        
        key = cv2.waitKey(1)
        if key == 32:  # Space key
            if len(faces) > 0:
                cap.release()
                cv2.destroyAllWindows()
                return frame
            else:
                print("⚠️ No face detected, try again")
        elif key == 27:  # ESC key
            cap.release()
            cv2.destroyAllWindows()
            return None
    
    cap.release()
    cv2.destroyAllWindows()
    return None

def image_to_base64(img):
    """Convert numpy image to base64 string"""
    # Convert BGR to RGB
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    # Convert to PIL Image
    pil_img = Image.fromarray(img_rgb)
    # Save to bytes buffer
    buffer = BytesIO()
    pil_img.save(buffer, format='JPEG')
    # Encode to base64
    img_str = base64.b64encode(buffer.getvalue()).decode()
    return f"data:image/jpeg;base64,{img_str}"

def test_face_service():
    """Test if face recognition service is running"""
    print("=" * 60)
    print("1. Testing Face Recognition Service...")
    print("=" * 60)
    
    try:
        response = requests.get(f"{FACE_SERVICE_URL}/health", timeout=5)
        if response.status_code == 200:
            print("✅ Face Recognition Service is RUNNING")
            print(json.dumps(response.json(), indent=2))
            return True
        else:
            print(f"❌ Service returned status: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Face Recognition Service NOT RUNNING: {e}")
        print("   Please start it with: python app_simple.py")
        return False

def test_registration_with_face():
    """Test user registration with face authentication"""
    print("\n" + "=" * 60)
    print("2. Testing Registration with Face Authentication...")
    print("=" * 60)
    
    # Capture face images from webcam
    print("\n📸 Capturing 7 face images from webcam...")
    face_images = []
    
    for i in range(7):
        print(f"\n--- Capture #{i+1}/7 ---")
        img = capture_face_from_webcam()
        
        if img is None:
            print("❌ Capture cancelled")
            return None
        
        base64_img = image_to_base64(img)
        face_images.append(base64_img)
        print(f"✅ Image {i+1} captured: {len(base64_img)} chars")
        
        if i < 6:
            print("🔄 Get ready for next capture...")
            import time
            time.sleep(1)
    
    # Prepare registration data
    import random
    random_num = random.randint(1000, 9999)
    
    registration_data = {
        "name": f"Test User {random_num}",
        "email": f"test{random_num}@president.ac.id",
        "student_id": f"00220220{random_num}",
        "password": "Password123!",
        "password_confirmation": "Password123!",
        "role": "student",
        "face_images": face_images
    }
    
    print(f"\n📝 Registration Data:")
    print(f"   Name: {registration_data['name']}")
    print(f"   Email: {registration_data['email']}")
    print(f"   Student ID: {registration_data['student_id']}")
    print(f"   Face Images: {len(registration_data['face_images'])} images")
    
    print("\n🚀 Sending registration request...")
    
    try:
        response = requests.post(
            f"{API_URL}/auth/register",
            json=registration_data,
            timeout=120
        )
        
        print(f"\n📊 Response Status: {response.status_code}")
        
        if response.status_code == 201 or response.status_code == 200:
            result = response.json()
            print("✅ Registration SUCCESSFUL!")
            print(json.dumps(result, indent=2))
            
            user = result.get('user', {})
            print(f"\n🎉 User Created:")
            print(f"   ID: {user.get('id')}")
            print(f"   Name: {user.get('name')}")
            print(f"   Email: {user.get('email')}")
            print(f"   Face Auth Enabled: {user.get('face_auth_enabled', False)}")
            
            if result.get('face_auth_enabled'):
                print("\n✅ FACE AUTHENTICATION IS ENABLED!")
                return user.get('id')
            else:
                print("\n⚠️ WARNING: Face authentication was NOT enabled")
                print("   Check Laravel logs for details")
                return None
        else:
            print(f"❌ Registration FAILED")
            print(f"Response: {response.text}")
            return None
            
    except requests.exceptions.Timeout:
        print("❌ Request TIMEOUT (>120 seconds)")
        print("   Face service might be processing too slowly")
        return None
    except Exception as e:
        print(f"❌ Error during registration: {e}")
        return None

def verify_database(user_id):
    """Verify face data in database"""
    print("\n" + "=" * 60)
    print("3. Verifying Database...")
    print("=" * 60)
    
    import subprocess
    result = subprocess.run(
        ["php", "test_face_db.php"],
        capture_output=True,
        text=True,
        cwd=".."
    )
    
    print(result.stdout)
    if result.stderr:
        print("Errors:", result.stderr)

def main():
    print("\n🔧 FACE AUTHENTICATION REGISTRATION TEST")
    print("=" * 60)
    
    # Step 1: Check face service
    if not test_face_service():
        print("\n❌ Cannot proceed without face recognition service")
        return
    
    # Step 2: Test registration
    user_id = test_registration_with_face()
    
    # Step 3: Verify in database
    if user_id:
        print(f"\n✅ Testing completed! User ID: {user_id}")
        print("\nNow run this command to verify:")
        print("   php test_face_db.php")
    else:
        print("\n❌ Registration test failed")
        print("\n📋 Check these logs:")
        print("   1. storage/logs/laravel.log")
        print("   2. Python service console output")

if __name__ == "__main__":
    main()
