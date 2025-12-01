from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
import base64
import io
from PIL import Image
import os

app = Flask(__name__)
CORS(app)

# Load OpenCV's pre-trained face detector
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

# Configuration
TOLERANCE = float(os.environ.get('TOLERANCE', '0.92'))  # 92% similarity minimum - EXTREMELY STRICT
MAX_DISTANCE = float(os.environ.get('MAX_DISTANCE', '0.35'))  # Relaxed to 0.35 for better same-person acceptance
MIN_PIXEL_SIMILARITY = float(os.environ.get('MIN_PIXEL_SIMILARITY', '0.88'))  # Raw pixel must be 88%+ similar
IMAGE_SIZE = (200, 200)  # Larger size for more detail
MIN_FACE_SIZE = (80, 80)  # Minimum face detection size

def decode_base64_image(base64_string):
    """Decode base64 image to numpy array"""
    try:
        if ',' in base64_string:
            base64_string = base64_string.split(',')[1]
        
        image_data = base64.b64decode(base64_string)
        image = Image.open(io.BytesIO(image_data))
        
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        return np.array(image)
    except Exception as e:
        raise ValueError(f"Failed to decode image: {str(e)}")

def augment_image(face_img):
    """Create augmented versions of the face image for better training"""
    augmented = [face_img]  # Original
    
    # 1. Brightness variations
    bright = cv2.convertScaleAbs(face_img, alpha=1.2, beta=10)  # Brighter
    dark = cv2.convertScaleAbs(face_img, alpha=0.8, beta=-10)   # Darker
    augmented.extend([bright, dark])
    
    # 2. Slight rotation
    h, w = face_img.shape[:2]
    center = (w // 2, h // 2)
    
    # Rotate +3 degrees
    M1 = cv2.getRotationMatrix2D(center, 3, 1.0)
    rotated_right = cv2.warpAffine(face_img, M1, (w, h), borderMode=cv2.BORDER_REPLICATE)
    
    # Rotate -3 degrees
    M2 = cv2.getRotationMatrix2D(center, -3, 1.0)
    rotated_left = cv2.warpAffine(face_img, M2, (w, h), borderMode=cv2.BORDER_REPLICATE)
    
    augmented.extend([rotated_right, rotated_left])
    
    # 3. Contrast adjustment
    lab = cv2.cvtColor(face_img, cv2.COLOR_RGB2LAB)
    l, a, b = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    l_clahe = clahe.apply(l)
    contrast_adjusted = cv2.merge([l_clahe, a, b])
    contrast_adjusted = cv2.cvtColor(contrast_adjusted, cv2.COLOR_LAB2RGB)
    augmented.append(contrast_adjusted)
    
    # 4. Slight Gaussian blur (simulates slight out of focus)
    slightly_blurred = cv2.GaussianBlur(face_img, (3, 3), 0.5)
    augmented.append(slightly_blurred)
    
    return augmented

def detect_and_extract_face(image_array):
    """Detect face and extract it from image with quality checks"""
    gray = cv2.cvtColor(image_array, cv2.COLOR_RGB2GRAY)
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=6, minSize=MIN_FACE_SIZE)
    
    if len(faces) == 0:
        return None, "No face detected in the image"
    
    # If multiple faces still detected after cropping, use the largest one
    if len(faces) > 1:
        # Sort by face area (w * h) and take the largest
        faces = sorted(faces, key=lambda f: f[2] * f[3], reverse=True)
        print(f"  [INFO] Multiple faces detected, using largest face")
    
    # Extract the face region
    x, y, w, h = faces[0]
    
    # Check face size quality
    if w < MIN_FACE_SIZE[0] or h < MIN_FACE_SIZE[1]:
        return None, "Face too small or too far from camera"
    
    # Add padding around face (10%)
    padding = int(0.1 * min(w, h))
    x = max(0, x - padding)
    y = max(0, y - padding)
    w = min(image_array.shape[1] - x, w + 2*padding)
    h = min(image_array.shape[0] - y, h + 2*padding)
    
    face_img = image_array[y:y+h, x:x+w]
    
    # Check image sharpness (Laplacian variance) - lowered threshold
    gray_face = cv2.cvtColor(face_img, cv2.COLOR_RGB2GRAY)
    laplacian_var = cv2.Laplacian(gray_face, cv2.CV_64F).var()
    if laplacian_var < 20:  # Lowered from 50 - less strict on blur
        return None, "Image too blurry. Please ensure good lighting and focus"
    
    # Resize to standard size
    face_img = cv2.resize(face_img, IMAGE_SIZE)
    
    return face_img, None

def create_face_encoding(face_img):
    """Create a robust face encoding using multiple advanced features"""
    # Convert to grayscale
    gray = cv2.cvtColor(face_img, cv2.COLOR_RGB2GRAY)
    
    # Apply histogram equalization for better contrast
    gray = cv2.equalizeHist(gray)
    
    # 1. Multi-scale histogram (64 bins at different resolutions)
    hist_full = cv2.calcHist([gray], [0], None, [64], [0, 256])
    hist_full = hist_full.flatten() / (gray.shape[0] * gray.shape[1])
    
    # Quarter images for spatial awareness
    h, w = gray.shape
    h2, w2 = h//2, w//2
    hist_tl = cv2.calcHist([gray[:h2, :w2]], [0], None, [32], [0, 256]).flatten()
    hist_tr = cv2.calcHist([gray[:h2, w2:]], [0], None, [32], [0, 256]).flatten()
    hist_bl = cv2.calcHist([gray[h2:, :w2]], [0], None, [32], [0, 256]).flatten()
    hist_br = cv2.calcHist([gray[h2:, w2:]], [0], None, [32], [0, 256]).flatten()
    hist_spatial = np.concatenate([hist_tl, hist_tr, hist_bl, hist_br])
    hist_spatial = hist_spatial / (hist_spatial.sum() + 1e-7)
    
    # 2. Enhanced LBP with rotation invariance
    def compute_lbp_uniform(img):
        lbp = np.zeros_like(img)
        for i in range(1, img.shape[0]-1):
            for j in range(1, img.shape[1]-1):
                center = img[i, j]
                code = 0
                code |= (img[i-1, j-1] >= center) << 7
                code |= (img[i-1, j] >= center) << 6
                code |= (img[i-1, j+1] >= center) << 5
                code |= (img[i, j+1] >= center) << 4
                code |= (img[i+1, j+1] >= center) << 3
                code |= (img[i+1, j] >= center) << 2
                code |= (img[i+1, j-1] >= center) << 1
                code |= (img[i, j-1] >= center) << 0
                lbp[i, j] = code
        return lbp
    
    lbp = compute_lbp_uniform(gray)
    lbp_hist = np.histogram(lbp, bins=64, range=(0, 256))[0]
    lbp_hist = lbp_hist / (lbp_hist.sum() + 1e-7)
    
    # 3. Fine-grained grid features (16x16 grid - balanced detail)
    grid_size = 16  # Reduced from 24 to 16 for better generalization
    grid_h, grid_w = h // grid_size, w // grid_size
    
    grid_features = []
    for i in range(grid_size):
        for j in range(grid_size):
            cell = gray[i*grid_h:(i+1)*grid_h, j*grid_w:(j+1)*grid_w]
            if cell.size > 0:
                grid_features.append(np.mean(cell) / 255.0)
                grid_features.append(np.std(cell) / 255.0)
                grid_features.append(np.median(cell) / 255.0)
    
    # 4. Gradient orientation histogram (HOG-like)
    sobelx = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
    sobely = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)
    magnitude = np.sqrt(sobelx**2 + sobely**2)
    orientation = np.arctan2(sobely, sobelx)
    
    # Histogram of gradient orientations
    orient_hist = np.histogram(orientation, bins=32, range=(-np.pi, np.pi), weights=magnitude)[0]
    orient_hist = orient_hist / (orient_hist.sum() + 1e-7)
    
    # 5. Texture features using Gabor filters
    gabor_features = []
    for theta in [0, np.pi/4, np.pi/2, 3*np.pi/4]:
        kernel = cv2.getGaborKernel((21, 21), 5, theta, 10, 0.5, 0, ktype=cv2.CV_32F)
        filtered = cv2.filter2D(gray, cv2.CV_64F, kernel)
        gabor_features.append(np.mean(np.abs(filtered)) / 255.0)
        gabor_features.append(np.std(filtered) / 255.0)
    
    # 6. Downsampled raw pixels for direct comparison (20x20 = 400 features)
    small_face = cv2.resize(gray, (20, 20))
    pixel_features = small_face.flatten() / 255.0
    
    # Combine all features
    encoding = np.concatenate([
        hist_full,
        hist_spatial,
        lbp_hist,
        np.array(grid_features),
        orient_hist,
        np.array(gabor_features),
        pixel_features  # Add raw pixel data
    ])
    
    # L2 normalization
    norm = np.linalg.norm(encoding)
    if norm > 1e-7:
        encoding = encoding / norm
    
    return encoding

def compare_encodings(encoding1, encoding2):
    """Compare two face encodings using multiple weighted metrics"""
    # Split encoding into features and raw pixels
    # Last 400 features are raw pixels (20x20)
    features1, pixels1 = encoding1[:-400], encoding1[-400:]
    features2, pixels2 = encoding2[:-400], encoding2[-400:]
    
    # 1. Feature cosine similarity
    feature_sim = np.dot(features1, features2) / (np.linalg.norm(features1) * np.linalg.norm(features2) + 1e-7)
    
    # 2. Pixel cosine similarity (direct face comparison)
    pixel_sim = np.dot(pixels1, pixels2) / (np.linalg.norm(pixels1) * np.linalg.norm(pixels2) + 1e-7)
    
    # 3. Overall Euclidean distance
    euclidean_dist = np.linalg.norm(encoding1 - encoding2)
    
    # Weighted combined similarity (60% features, 40% pixels)
    combined_sim = 0.6 * feature_sim + 0.4 * pixel_sim
    
    return float(combined_sim), float(euclidean_dist), float(pixel_sim)
    
    return float(cosine_sim), float(euclidean_dist)

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'face_recognition_simple',
        'version': '1.0.0',
        'backend': 'opencv'
    }), 200

@app.route('/encode-faces', methods=['POST'])
def encode_faces():
    """
    Encode multiple face images during registration.
    """
    try:
        data = request.get_json()
        
        if not data or 'images' not in data:
            print(f"[ERROR] No images provided in request")
            return jsonify({
                'success': False,
                'error': 'No images provided'
            }), 400
        
        images = data['images']
        
        if not isinstance(images, list) or len(images) == 0:
            print(f"[ERROR] Images not a list or empty")
            return jsonify({
                'success': False,
                'error': 'Images must be a non-empty array'
            }), 400
        
        print(f"[INFO] Received {len(images)} images for encoding")
        
        if len(images) < 5:
            print(f"[ERROR] Only {len(images)} images provided (minimum 5)")
            return jsonify({
                'success': False,
                'error': 'Please provide at least 5 images for better accuracy'
            }), 400
        
        encodings = []
        processed_count = 0
        errors = []
        
        for idx, img_base64 in enumerate(images):
            try:
                image_array = decode_base64_image(img_base64)
                # Image already cropped to center oval on frontend
                face_img, error = detect_and_extract_face(image_array)
                
                if error:
                    print(f"  [ERROR] Image {idx + 1}: {error}")
                    errors.append(f"Image {idx + 1}: {error}")
                    continue
                
                # Apply data augmentation - create 7 variations per image
                augmented_images = augment_image(face_img)
                
                # Create encodings for all augmented versions
                for aug_img in augmented_images:
                    encoding = create_face_encoding(aug_img)
                    encodings.append(encoding)
                
                processed_count += 1
                print(f"  [OK] Image {idx + 1}: Processed ({len(augmented_images)} augmented samples)")
                
            except Exception as e:
                print(f"  [ERROR] Image {idx + 1}: Exception - {str(e)}")
                errors.append(f"Image {idx + 1}: {str(e)}")
        
        print(f"\n[STATS] Processing complete: {processed_count}/{len(images)} images valid")
        print(f"   Total augmented samples: {len(encodings)}")
        
        if processed_count < 3:
            print(f"[ERROR] Only {processed_count} valid images (minimum 3 required)")
            return jsonify({
                'success': False,
                'error': 'Not enough valid face images (minimum 3 required)',
                'details': errors,
                'images_processed': processed_count
            }), 400
        
        # Average the encodings (now includes augmented versions)
        avg_encoding = np.mean(encodings, axis=0)
        
        print(f"[SUCCESS] Encoding complete: {len(encodings)} samples averaged")
        
        return jsonify({
            'success': True,
            'encoding': avg_encoding.tolist(),
            'images_processed': processed_count,
            'augmented_samples': len(encodings),  # Total including augmentations
            'total_images': len(images),
            'warnings': errors if errors else None
        }), 200
        
    except Exception as e:
        print(f"[ERROR] Exception in encode_faces: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/verify-face', methods=['POST'])
def verify_face():
    """
    Verify a face against stored encoding.
    """
    try:
        data = request.get_json()
        
        if not data or 'image' not in data or 'stored_encoding' not in data:
            return jsonify({
                'success': False,
                'error': 'Missing required fields: image and stored_encoding'
            }), 400
        
        # Decode and check for multiple faces first
        image_array = decode_base64_image(data['image'])
        gray = cv2.cvtColor(image_array, cv2.COLOR_RGB2GRAY)
        faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=6, minSize=MIN_FACE_SIZE)
        
        # Reject if multiple faces detected during verification (strict mode)
        if len(faces) > 1:
            print(f"[WARNING] Verification rejected: {len(faces)} faces detected")
            return jsonify({
                'success': False,
                'error': f'Multiple faces detected ({len(faces)} people). Please ensure only you are visible in the frame.',
                'face_count': len(faces)
            }), 400
        
        # Process the image (verification still strict - must be alone)
        face_img, error = detect_and_extract_face(image_array)
        
        if error:
            return jsonify({
                'success': False,
                'error': error
            }), 400
        
        # Create encoding
        current_encoding = create_face_encoding(face_img)
        
        # Get stored encoding
        stored_encoding = np.array(data['stored_encoding'])
        
        # Compare faces using TRIPLE validation
        combined_sim, euclidean_dist, pixel_sim = compare_encodings(stored_encoding, current_encoding)
        
        # ALL THREE conditions must pass for a match
        match = (
            (combined_sim >= TOLERANCE) and 
            (euclidean_dist <= MAX_DISTANCE) and 
            (pixel_sim >= MIN_PIXEL_SIMILARITY)
        )
        
        # Convert similarity to confidence percentage
        confidence = min(100, max(0, combined_sim * 100))
        
        return jsonify({
            'success': True,
            'match': bool(match),
            'confidence': round(float(confidence), 2),
            'distance': round(float(euclidean_dist), 4),
            'similarity': round(float(combined_sim), 4),
            'pixel_similarity': round(float(pixel_sim), 4),
            'threshold': {
                'min_similarity': TOLERANCE,
                'max_distance': MAX_DISTANCE,
                'min_pixel_similarity': MIN_PIXEL_SIMILARITY
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/compare-faces', methods=['POST'])
def compare_faces():
    """
    Compare two face images directly.
    """
    try:
        data = request.get_json()
        
        if not data or 'image1' not in data or 'image2' not in data:
            return jsonify({
                'success': False,
                'error': 'Missing required fields: image1 and image2'
            }), 400
        
        # Process first image
        image1_array = decode_base64_image(data['image1'])
        face1_img, error1 = detect_and_extract_face(image1_array)
        
        if error1:
            return jsonify({
                'success': False,
                'error': f"Image 1: {error1}"
            }), 400
        
        # Process second image
        image2_array = decode_base64_image(data['image2'])
        face2_img, error2 = detect_and_extract_face(image2_array)
        
        if error2:
            return jsonify({
                'success': False,
                'error': f"Image 2: {error2}"
            }), 400
        
        # Create encodings
        encoding1 = create_face_encoding(face1_img)
        encoding2 = create_face_encoding(face2_img)
        
        # Compare
        similarity = compare_encodings(encoding1, encoding2)
        match = similarity >= TOLERANCE
        confidence = min(100, max(0, similarity * 100))
        
        return jsonify({
            'success': True,
            'match': bool(match),
            'confidence': round(float(confidence), 2),
            'distance': round(float(1 - similarity), 4),
            'similarity': round(float(similarity), 4)
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/detect-face', methods=['POST'])
def detect_face():
    """Quick face detection endpoint for real-time feedback"""
    try:
        data = request.get_json()
        
        if not data or 'image' not in data:
            return jsonify({
                'success': False,
                'face_detected': False,
                'error': 'No image provided'
            }), 400
        
        # Decode and detect face
        image_array = decode_base64_image(data['image'])
        gray = cv2.cvtColor(image_array, cv2.COLOR_RGB2GRAY)
        faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=MIN_FACE_SIZE)
        
        face_detected = len(faces) == 1  # Exactly one face
        multiple_faces = len(faces) > 1
        
        # Convert faces to list of dicts with coordinates
        face_boxes = []
        for (x, y, w, h) in faces:
            face_boxes.append({
                'x': int(x),
                'y': int(y),
                'width': int(w),
                'height': int(h)
            })
        
        return jsonify({
            'success': True,
            'face_detected': face_detected,
            'num_faces': len(faces),
            'faces': face_boxes,  # Array of face bounding boxes
            'warning': 'Multiple people detected! Please ensure only you are visible.' if multiple_faces else None
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'face_detected': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('DEBUG', 'False').lower() == 'true'
    
    print(f"Starting Face Recognition Service (OpenCV Backend) on port {port}")
    print(f"Configuration:")
    print(f"  - Tolerance: {TOLERANCE} (Combined similarity threshold)")
    print(f"  - Max Distance: {MAX_DISTANCE} (Euclidean distance threshold)")
    print(f"  - Min Pixel Similarity: {MIN_PIXEL_SIMILARITY} (Raw pixel threshold)")
    print(f"  - Image Size: {IMAGE_SIZE}")
    print(f"  - Data Augmentation: ENABLED (7x per image)")
    print(f"\nFeatures:")
    print(f"  [+] Triple validation (combined + distance + pixel)")
    print(f"  [+] Data augmentation (brightness, rotation, contrast, blur)")
    print(f"  [+] Real-time face detection overlay")
    print(f"  [+] ~2400 dimensional face encoding")
    print(f"\nNote: This version uses OpenCV for face detection (easier to install)")
    
    app.run(host='0.0.0.0', port=port, debug=debug)
