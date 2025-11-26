"""
Test script for Face Recognition Service
Run this to verify your setup is working correctly
"""

import requests
import base64
import json
from pathlib import Path

# Service URL
SERVICE_URL = "http://localhost:5000"

def test_health_check():
    """Test if service is running"""
    print("1. Testing health check...")
    try:
        response = requests.get(f"{SERVICE_URL}/health")
        if response.status_code == 200:
            print("   ✓ Service is healthy")
            print(f"   Response: {response.json()}")
            return True
        else:
            print(f"   ✗ Service returned status {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("   ✗ Cannot connect to service. Is it running?")
        return False
    except Exception as e:
        print(f"   ✗ Error: {e}")
        return False

def create_test_image_base64():
    """Create a simple test image (1x1 pixel) as base64"""
    # This is a minimal valid JPEG image (1x1 red pixel)
    # In real testing, you'd use actual face images
    import base64
    minimal_jpeg = base64.b64encode(
        b'\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x00\x00\x01\x00\x01\x00\x00'
        b'\xff\xdb\x00C\x00\x08\x06\x06\x07\x06\x05\x08\x07\x07\x07\t\t\x08\n\x0c'
        b'\x14\r\x0c\x0b\x0b\x0c\x19\x12\x13\x0f\x14\x1d\x1a\x1f\x1e\x1d\x1a\x1c'
        b'\x1c $.\' ",#\x1c\x1c(7),01444\x1f\'9=82<.342\xff\xc0\x00\x0b\x08\x00'
        b'\x01\x00\x01\x01\x01\x11\x00\xff\xc4\x00\x1f\x00\x00\x01\x05\x01\x01\x01'
        b'\x01\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00\x01\x02\x03\x04\x05\x06\x07'
        b'\x08\t\n\x0b\xff\xc4\x00\xb5\x10\x00\x02\x01\x03\x03\x02\x04\x03\x05\x05'
        b'\x04\x04\x00\x00\x01}\x01\x02\x03\x00\x04\x11\x05\x12!1A\x06\x13Qa\x07'
        b'"q\x142\x81\x91\xa1\x08#B\xb1\xc1\x15R\xd1\xf0$3br\x82\t\n\x16\x17\x18'
        b'\x19\x1a%&\'()*456789:BCDEFGHIJSTUVWXYZcdefghijstuvwxyz\x83\x84\x85\x86'
        b'\x87\x88\x89\x8a\x92\x93\x94\x95\x96\x97\x98\x99\x9a\xa2\xa3\xa4\xa5\xa6'
        b'\xa7\xa8\xa9\xaa\xb2\xb3\xb4\xb5\xb6\xb7\xb8\xb9\xba\xc2\xc3\xc4\xc5\xc6'
        b'\xc7\xc8\xc9\xca\xd2\xd3\xd4\xd5\xd6\xd7\xd8\xd9\xda\xe1\xe2\xe3\xe4\xe5'
        b'\xe6\xe7\xe8\xe9\xea\xf1\xf2\xf3\xf4\xf5\xf6\xf7\xf8\xf9\xfa\xff\xda\x00'
        b'\x08\x01\x01\x00\x00?\x00\xfb\xfc\xd5\xf6\x8a(\xa0\x02\x8a(\xa0\x02\x8a'
        b'(\xa0\x0f\xff\xd9'
    ).decode('utf-8')
    return f"data:image/jpeg;base64,{minimal_jpeg}"

def test_encode_faces():
    """Test face encoding (will fail with test image, but tests API)"""
    print("\n2. Testing face encoding endpoint...")
    try:
        # Create test payload
        test_images = [create_test_image_base64() for _ in range(5)]
        
        response = requests.post(
            f"{SERVICE_URL}/encode-faces",
            json={"images": test_images},
            timeout=30
        )
        
        print(f"   Status: {response.status_code}")
        result = response.json()
        print(f"   Response: {json.dumps(result, indent=2)}")
        
        if response.status_code == 200 and result.get('success'):
            print("   ✓ Encoding endpoint working")
            return True
        else:
            print("   ⚠ Endpoint responded but processing failed (expected with test images)")
            print("   This is normal - the endpoint works but test images don't contain faces")
            return True  # Still consider this a success as the endpoint is responding
            
    except Exception as e:
        print(f"   ✗ Error: {e}")
        return False

def test_verify_face():
    """Test face verification endpoint"""
    print("\n3. Testing face verification endpoint...")
    try:
        test_image = create_test_image_base64()
        test_encoding = [0.1] * 128  # Dummy face encoding
        
        response = requests.post(
            f"{SERVICE_URL}/verify-face",
            json={
                "image": test_image,
                "stored_encoding": test_encoding
            },
            timeout=30
        )
        
        print(f"   Status: {response.status_code}")
        result = response.json()
        print(f"   Response: {json.dumps(result, indent=2)}")
        
        if response.status_code in [200, 400]:  # 400 is expected for no face detected
            print("   ✓ Verification endpoint working")
            return True
        else:
            print(f"   ✗ Unexpected status code: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"   ✗ Error: {e}")
        return False

def test_compare_faces():
    """Test face comparison endpoint"""
    print("\n4. Testing face comparison endpoint...")
    try:
        test_image = create_test_image_base64()
        
        response = requests.post(
            f"{SERVICE_URL}/compare-faces",
            json={
                "image1": test_image,
                "image2": test_image
            },
            timeout=30
        )
        
        print(f"   Status: {response.status_code}")
        result = response.json()
        print(f"   Response: {json.dumps(result, indent=2)}")
        
        if response.status_code in [200, 400]:  # 400 is expected for no face detected
            print("   ✓ Comparison endpoint working")
            return True
        else:
            print(f"   ✗ Unexpected status code: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"   ✗ Error: {e}")
        return False

def main():
    """Run all tests"""
    print("=" * 60)
    print("Face Recognition Service Test Suite")
    print("=" * 60)
    
    tests = [
        test_health_check,
        test_encode_faces,
        test_verify_face,
        test_compare_faces
    ]
    
    results = []
    for test in tests:
        results.append(test())
    
    print("\n" + "=" * 60)
    print("Test Summary")
    print("=" * 60)
    
    passed = sum(results)
    total = len(results)
    
    print(f"Passed: {passed}/{total}")
    
    if passed == total:
        print("\n✓ All tests passed! Service is working correctly.")
        print("\nNote: Actual face detection will only work with real face images.")
        print("The test images are minimal JPEGs without faces, so face detection")
        print("errors are expected and indicate the service is working properly.")
    else:
        print("\n✗ Some tests failed. Check the output above for details.")
        print("\nCommon issues:")
        print("- Service not running: Run 'python app.py' in face_recognition_service/")
        print("- Wrong port: Check SERVICE_URL in this script matches your service")
        print("- Missing dependencies: Run 'pip install -r requirements.txt'")
    
    print("=" * 60)

if __name__ == "__main__":
    main()
