from flask import Flask, request, jsonify
from flask_cors import CORS
import face_recognition
import numpy as np
import base64
import io
from PIL import Image
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for Laravel backend

# Configuration
TOLERANCE = 0.6  # Face matching tolerance (lower is more strict)
MODEL = 'large'  # Options: 'small' (faster) or 'large' (more accurate)

def decode_base64_image(base64_string):
    """Decode base64 image to numpy array"""
    try:
        # Remove data URL prefix if present
        if ',' in base64_string:
            base64_string = base64_string.split(',')[1]
        
        image_data = base64.b64decode(base64_string)
        image = Image.open(io.BytesIO(image_data))
        
        # Convert to RGB if necessary
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        return np.array(image)
    except Exception as e:
        raise ValueError(f"Failed to decode image: {str(e)}")

def get_face_encoding(image_array):
    """Extract face encoding from image"""
    face_locations = face_recognition.face_locations(image_array, model=MODEL)
    
    if len(face_locations) == 0:
        return None, "No face detected in the image"
    
    if len(face_locations) > 1:
        return None, "Multiple faces detected. Please ensure only one face is visible"
    
    face_encodings = face_recognition.face_encodings(image_array, face_locations, model=MODEL)
    
    if len(face_encodings) == 0:
        return None, "Could not generate face encoding"
    
    return face_encodings[0], None

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'face_recognition',
        'version': '1.0.0'
    }), 200

@app.route('/encode-faces', methods=['POST'])
def encode_faces():
    """
    Encode multiple face images during registration.
    Expects JSON: { "images": ["base64_image1", "base64_image2", ...] }
    Returns: { "success": true, "encoding": [array], "images_processed": int }
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
        
        # Process each image and collect encodings
        encodings = []
        processed_count = 0
        errors = []
        
        for idx, img_base64 in enumerate(images):
            try:
                image_array = decode_base64_image(img_base64)
                encoding, error = get_face_encoding(image_array)
                
                if error:
                    errors.append(f"Image {idx + 1}: {error}")
                    continue
                
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
        
        # Average the encodings for more robust recognition
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
    Expects JSON: { "image": "base64_image", "stored_encoding": [array] }
    Returns: { "success": true, "match": true/false, "confidence": float }
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
        current_encoding, error = get_face_encoding(image_array)
        
        if error:
            return jsonify({
                'success': False,
                'error': error
            }), 400
        
        # Get stored encoding
        stored_encoding = np.array(data['stored_encoding'])
        
        # Compare faces
        face_distance = face_recognition.face_distance([stored_encoding], current_encoding)[0]
        match = face_distance <= TOLERANCE
        
        # Calculate confidence (inverse of distance, normalized to 0-100%)
        confidence = max(0, min(100, (1 - face_distance) * 100))
        
        return jsonify({
            'success': True,
            'match': bool(match),
            'confidence': round(float(confidence), 2),
            'distance': round(float(face_distance), 4)
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
    Expects JSON: { "image1": "base64_image1", "image2": "base64_image2" }
    Returns: { "success": true, "match": true/false, "confidence": float }
    """
    try:
        data = request.get_json()
        
        if not data or 'image1' not in data or 'image2' not in data:
            return jsonify({
                'success': False,
                'error': 'Missing required fields: image1 and image2'
            }), 400
        
        # Process both images
        image1_array = decode_base64_image(data['image1'])
        encoding1, error1 = get_face_encoding(image1_array)
        
        if error1:
            return jsonify({
                'success': False,
                'error': f"Image 1: {error1}"
            }), 400
        
        image2_array = decode_base64_image(data['image2'])
        encoding2, error2 = get_face_encoding(image2_array)
        
        if error2:
            return jsonify({
                'success': False,
                'error': f"Image 2: {error2}"
            }), 400
        
        # Compare faces
        face_distance = face_recognition.face_distance([encoding1], encoding2)[0]
        match = face_distance <= TOLERANCE
        confidence = max(0, min(100, (1 - face_distance) * 100))
        
        return jsonify({
            'success': True,
            'match': bool(match),
            'confidence': round(float(confidence), 2),
            'distance': round(float(face_distance), 4)
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('DEBUG', 'False').lower() == 'true'
    
    print(f"Starting Face Recognition Service on port {port}")
    print(f"Model: {MODEL}")
    print(f"Tolerance: {TOLERANCE}")
    
    app.run(host='0.0.0.0', port=port, debug=debug)
