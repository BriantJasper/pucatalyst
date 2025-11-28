"""
Test face recognition model accuracy with data augmentation
"""
import cv2
import numpy as np
import sys
import os

# Add parent directory to path to import app_simple functions
sys.path.insert(0, os.path.dirname(__file__))

from app_simple import (
    create_face_encoding, 
    compare_encodings, 
    detect_and_extract_face, 
    augment_image,
    TOLERANCE, 
    MAX_DISTANCE, 
    MIN_PIXEL_SIMILARITY
)

def capture_from_webcam(num_images=3, label=""):
    """Capture multiple images from webcam"""
    print(f"\n{'='*60}")
    print(f"Capturing {num_images} images for: {label}")
    print(f"{'='*60}")
    print("Tekan SPACE untuk capture, ESC untuk skip")
    
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("❌ Cannot open webcam")
        return None
    
    images = []
    captured = 0
    
    while captured < num_images:
        ret, frame = cap.read()
        if not ret:
            break
        
        # Convert BGR to RGB
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        
        # Try to detect face
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        faces = face_cascade.detectMultiScale(gray, 1.1, 6, minSize=(80, 80))
        
        # Draw rectangles
        display = frame.copy()
        for (x, y, w, h) in faces:
            cv2.rectangle(display, (x, y), (x+w, y+h), (0, 255, 0), 2)
        
        # Show instructions
        cv2.putText(display, f"{label} - Image {captured+1}/{num_images}", (10, 30), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
        cv2.putText(display, "SPACE: Capture | ESC: Skip", (10, 60), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
        
        if len(faces) > 0:
            cv2.putText(display, "Face Detected!", (10, 90), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)
        else:
            cv2.putText(display, "No Face Detected", (10, 90), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)
        
        cv2.imshow('Capture Face', display)
        
        key = cv2.waitKey(1)
        if key == 32:  # Space
            if len(faces) > 0:
                images.append(frame_rgb)
                captured += 1
                print(f"✅ Captured image {captured}/{num_images}")
            else:
                print("⚠️ No face detected, try again")
        elif key == 27:  # ESC
            print("❌ Capture cancelled")
            cap.release()
            cv2.destroyAllWindows()
            return None
    
    cap.release()
    cv2.destroyAllWindows()
    return images

def test_same_person():
    """Test with same person (should MATCH)"""
    print("\n" + "="*60)
    print("TEST 1: SAME PERSON (Should MATCH)")
    print("="*60)
    
    # Capture enrollment images
    enrollment_images = capture_from_webcam(5, "ENROLLMENT - Your Face")
    if not enrollment_images:
        return
    
    # Create encodings
    print("\n📊 Processing enrollment images WITH AUGMENTATION...")
    encodings = []
    total_samples = 0
    for idx, img in enumerate(enrollment_images):
        face_img, error = detect_and_extract_face(img)
        if error:
            print(f"  Image {idx+1}: ❌ {error}")
            continue
        
        # Apply augmentation
        augmented_images = augment_image(face_img)
        for aug_img in augmented_images:
            encoding = create_face_encoding(aug_img)
            encodings.append(encoding)
        
        total_samples += len(augmented_images)
        print(f"  Image {idx+1}: ✅ Processed ({len(augmented_images)} augmented samples)")
    
    if len(encodings) < 3:
        print("❌ Not enough valid images")
        return
    
    # Average enrollment encoding
    avg_encoding = np.mean(encodings, axis=0)
    print(f"\n✅ Enrollment complete: {len(enrollment_images)} original images → {total_samples} augmented samples")
    print(f"   Augmentation multiplier: {total_samples // len(enrollment_images)}x per image")
    
    # Capture verification image
    input("\nPress ENTER to capture verification image (SAME PERSON)...")
    verify_images = capture_from_webcam(1, "VERIFICATION - Your Face Again")
    if not verify_images:
        return
    
    # Verify
    print("\n🔍 Verifying...")
    verify_face, error = detect_and_extract_face(verify_images[0])
    if error:
        print(f"❌ Error: {error}")
        return
    
    verify_encoding = create_face_encoding(verify_face)
    combined_sim, euclidean_dist, pixel_sim = compare_encodings(avg_encoding, verify_encoding)
    
    match = (
        (combined_sim >= TOLERANCE) and 
        (euclidean_dist <= MAX_DISTANCE) and 
        (pixel_sim >= MIN_PIXEL_SIMILARITY)
    )
    
    print("\n" + "="*60)
    print("RESULTS - SAME PERSON:")
    print("="*60)
    print(f"Combined Similarity: {combined_sim:.4f} (need ≥{TOLERANCE})")
    print(f"Euclidean Distance:  {euclidean_dist:.4f} (need ≤{MAX_DISTANCE})")
    print(f"Pixel Similarity:    {pixel_sim:.4f} (need ≥{MIN_PIXEL_SIMILARITY})")
    print(f"Confidence:          {combined_sim*100:.2f}%")
    print("-"*60)
    if match:
        print("✅ MATCH - Face verification SUCCESSFUL")
    else:
        print("❌ NO MATCH - Face verification FAILED")
        print("\nReason:")
        if combined_sim < TOLERANCE:
            print(f"  - Combined similarity too low: {combined_sim:.4f} < {TOLERANCE}")
        if euclidean_dist > MAX_DISTANCE:
            print(f"  - Distance too high: {euclidean_dist:.4f} > {MAX_DISTANCE}")
        if pixel_sim < MIN_PIXEL_SIMILARITY:
            print(f"  - Pixel similarity too low: {pixel_sim:.4f} < {MIN_PIXEL_SIMILARITY}")
    print("="*60)
    
    return avg_encoding

def test_different_person(enrollment_encoding):
    """Test with different person (should NOT MATCH)"""
    print("\n" + "="*60)
    print("TEST 2: DIFFERENT PERSON (Should NOT MATCH)")
    print("="*60)
    
    input("\nPress ENTER to capture DIFFERENT person's face...")
    
    # Capture different person
    other_images = capture_from_webcam(1, "DIFFERENT PERSON")
    if not other_images:
        return
    
    # Verify
    print("\n🔍 Verifying...")
    other_face, error = detect_and_extract_face(other_images[0])
    if error:
        print(f"❌ Error: {error}")
        return
    
    other_encoding = create_face_encoding(other_face)
    combined_sim, euclidean_dist, pixel_sim = compare_encodings(enrollment_encoding, other_encoding)
    
    match = (
        (combined_sim >= TOLERANCE) and 
        (euclidean_dist <= MAX_DISTANCE) and 
        (pixel_sim >= MIN_PIXEL_SIMILARITY)
    )
    
    print("\n" + "="*60)
    print("RESULTS - DIFFERENT PERSON:")
    print("="*60)
    print(f"Combined Similarity: {combined_sim:.4f} (need ≥{TOLERANCE})")
    print(f"Euclidean Distance:  {euclidean_dist:.4f} (need ≤{MAX_DISTANCE})")
    print(f"Pixel Similarity:    {pixel_sim:.4f} (need ≥{MIN_PIXEL_SIMILARITY})")
    print(f"Confidence:          {combined_sim*100:.2f}%")
    print("-"*60)
    if match:
        print("❌ MATCH - SECURITY ISSUE! Different person accepted!")
    else:
        print("✅ NO MATCH - Correctly rejected different person")
        print("\nRejection reason:")
        if combined_sim < TOLERANCE:
            print(f"  ✅ Combined similarity too low: {combined_sim:.4f} < {TOLERANCE}")
        if euclidean_dist > MAX_DISTANCE:
            print(f"  ✅ Distance too high: {euclidean_dist:.4f} > {MAX_DISTANCE}")
        if pixel_sim < MIN_PIXEL_SIMILARITY:
            print(f"  ✅ Pixel similarity too low: {pixel_sim:.4f} < {MIN_PIXEL_SIMILARITY}")
    print("="*60)

def main():
    print("\n" + "="*60)
    print("FACE RECOGNITION MODEL TESTER")
    print("="*60)
    print(f"Tolerance:           {TOLERANCE} (92%)")
    print(f"Max Distance:        {MAX_DISTANCE}")
    print(f"Min Pixel Similarity: {MIN_PIXEL_SIMILARITY} (88%)")
    print("="*60)
    
    # Test 1: Same person
    enrollment_encoding = test_same_person()
    if enrollment_encoding is None:
        print("\n❌ Test cancelled")
        return
    
    # Test 2: Different person
    test_different_person(enrollment_encoding)
    
    print("\n✅ Testing complete!")

if __name__ == "__main__":
    main()
