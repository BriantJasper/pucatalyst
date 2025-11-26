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
TOLERANCE = float(os.environ.get('TOLERANCE', '0.85'))  # Similarity threshold (higher = more strict)
IMAGE_SIZE = (128, 128)  # Standardized face image size

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

def detect_and_extract_face(image_array):
    """Detect face and extract it from image"""
    gray = cv2.cvtColor(image_array, cv2.COLOR_RGB2GRAY)
    faces = face_cascade.detectMultiScale(gray, 1.3, 5)
    
    if len(faces) == 0:
        return None, "No face detected in the image"
    
    if len(faces) > 1:
        return None, "Multiple faces detected. Please ensure only one face is visible"
    
    # Extract the face region
    x, y, w, h = faces[0]
    face_img = image_array[y:y+h, x:x+w]
    
    # Resize to standard size
    face_img = cv2.resize(face_img, IMAGE_SIZE)
    
    return face_img, None

def create_face_encoding(face_img):
    """Create a simple face encoding using histogram and features"""
    # Convert to grayscale
    gray = cv2.cvtColor(face_img, cv2.COLOR_RGB2GRAY)
    
    # Calculate histogram
    hist = cv2.calcHist([gray], [0], None, [256], [0, 256])
    hist = cv2.normalize(hist, hist).flatten()
    
    # Calculate average pixel values in grid
    h, w = gray.shape
    grid_size = 8
    grid_h, grid_w = h // grid_size, w // grid_size
    
    grid_features = []
    for i in range(grid_size):
        for j in range(grid_size):
            cell = gray[i*grid_h:(i+1)*grid_h, j*grid_w:(j+1)*grid_w]
            grid_features.append(np.mean(cell))
            grid_features.append(np.std(cell))
    
    # Combine features
    encoding = np.concatenate([hist, np.array(grid_features)])
    
    # Normalize
    encoding = encoding / (np.linalg.norm(encoding) + 1e-7)
    
    return encoding

def compare_encodings(encoding1, encoding2):
    """Compare two face encodings using cosine similarity"""
    similarity = np.dot(encoding1, encoding2) / (np.linalg.norm(encoding1) * np.linalg.norm(encoding2) + 1e-7)
    return float(similarity)

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
            return jsonify({
                'success': False,
                'error': 'No images provided'
            }), 400
        
        images = data['images']
        
        if not isinstance(images, list) or len(images) == 0:
            return jsonify({
                'success': False,
                'error': 'Images must be a non-empty array'
            }), 400
        
        if len(images) < 5:
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
                face_img, error = detect_and_extract_face(image_array)
                
                if error:
                    errors.append(f"Image {idx + 1}: {error}")
                    continue
                
                encoding = create_face_encoding(face_img)
                encodings.append(encoding)
                processed_count += 1
                
            except Exception as e:
                errors.append(f"Image {idx + 1}: {str(e)}")
        
        if processed_count < 3:
            return jsonify({
                'success': False,
                'error': 'Not enough valid face images',
                'details': errors,
                'images_processed': processed_count
            }), 400
        
        # Average the encodings
        avg_encoding = np.mean(encodings, axis=0)
        
        return jsonify({
            'success': True,
            'encoding': avg_encoding.tolist(),
            'images_processed': processed_count,
            'total_images': len(images),
            'warnings': errors if errors else None
        }), 200
        
    except Exception as e:
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
        
        # Decode and process the image
        image_array = decode_base64_image(data['image'])
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
        
        # Compare faces
        similarity = compare_encodings(stored_encoding, current_encoding)
        match = similarity >= TOLERANCE
        
        # Convert similarity to confidence percentage
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

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('DEBUG', 'False').lower() == 'true'
    
    print(f"Starting Face Recognition Service (OpenCV Backend) on port {port}")
    print(f"Tolerance: {TOLERANCE}")
    print(f"Note: This version uses OpenCV for face detection (easier to install)")
    
    app.run(host='0.0.0.0', port=port, debug=debug)
