import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, CheckCircle, CheckCircle2, AlertCircle, Loader } from 'lucide-react';

const CAPTURE_INSTRUCTIONS = [
    { id: 1, text: "Look straight ahead", duration: 2000 },
    { id: 2, text: "Tilt your head slightly to the left", duration: 2000 },
    { id: 3, text: "Tilt your head slightly to the right", duration: 2000 },
    { id: 4, text: "Look up slightly", duration: 2000 },
    { id: 5, text: "Look down slightly", duration: 2000 },
    { id: 6, text: "Smile slightly", duration: 2000 },
    { id: 7, text: "Look straight ahead again", duration: 2000 },
    { id: 8, text: "Turn head 45° to the left", duration: 2000 },
    { id: 9, text: "Turn head 45° to the right", duration: 2000 },
    { id: 10, text: "Smile wide", duration: 2000 },
    { id: 11, text: "Neutral expression", duration: 2000 },
    { id: 12, text: "Move closer to camera", duration: 2000 },
    { id: 13, text: "Move back from camera", duration: 2000 },
    { id: 14, text: "Look straight with slight tilt left", duration: 2000 },
    { id: 15, text: "Look straight with slight tilt right", duration: 2000 },
    { id: 16, text: "Turn head 30° left", duration: 2000 },
    { id: 17, text: "Turn head 30° right", duration: 2000 },
    { id: 18, text: "Look up and smile", duration: 2000 },
    { id: 19, text: "Look down neutral", duration: 2000 },
    { id: 20, text: "Final - Look straight ahead", duration: 2000 },
];

const FaceCaptureComponent = ({ onComplete, onCancel, minImages = 12, maxImages = 20 }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const overlayCanvasRef = useRef(null);
    const streamRef = useRef(null);
    const faceDetectionIntervalRef = useRef(null);
    
    const [currentStep, setCurrentStep] = useState(0);
    const [capturedImages, setCapturedImages] = useState([]);
    const [isCapturing, setIsCapturing] = useState(false);
    const [error, setError] = useState(null);
    const [cameraReady, setCameraReady] = useState(false);
    const [countdown, setCountdown] = useState(null);
    const [faceDetected, setFaceDetected] = useState(false);

    // Initialize camera
    useEffect(() => {
        startCamera();
        return () => {
            stopCamera();
            if (faceDetectionIntervalRef.current) {
                clearInterval(faceDetectionIntervalRef.current);
            }
        };
    }, []);

    const startCamera = async () => {
        try {
            setError(null);
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'user'
                },
                audio: false
            });

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                streamRef.current = stream;
                
                videoRef.current.onloadedmetadata = () => {
                    setCameraReady(true);
                    startFaceDetection();
                };
            }
        } catch (err) {
            console.error('Error accessing camera:', err);
            setError('Unable to access camera. Please grant camera permissions.');
        }
    };

    const stopCamera = () => {
        if (faceDetectionIntervalRef.current) {
            clearInterval(faceDetectionIntervalRef.current);
            faceDetectionIntervalRef.current = null;
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setCameraReady(false);
    };

    const startFaceDetection = () => {
        // Face detection using the face recognition service
        faceDetectionIntervalRef.current = setInterval(async () => {
            if (!videoRef.current || !overlayCanvasRef.current || !cameraReady) return;
            
            const video = videoRef.current;
            const canvas = overlayCanvasRef.current;
            const ctx = canvas.getContext('2d');
            
            // Set canvas size to match video
            if (canvas.width !== video.videoWidth) {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
            }
            
            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Try to detect face using a temporary canvas
            try {
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = video.videoWidth;
                tempCanvas.height = video.videoHeight;
                const tempCtx = tempCanvas.getContext('2d');
                tempCtx.drawImage(video, 0, 0);
                const imageData = tempCanvas.toDataURL('image/jpeg', 0.8);
                
                // Quick detection call to service
                const response = await fetch('http://localhost:5000/detect-face', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ image: imageData.split(',')[1] }),
                });
                
                const result = await response.json();
                setFaceDetected(result.face_detected === true);
                
                // Show warning if multiple faces
                if (result.num_faces > 1) {
                    setError('Multiple people detected! Please ensure only you are visible in the frame.');
                } else if (error && result.num_faces === 1) {
                    setError(null); // Clear error when back to single face
                }
                
                // Draw rectangles around detected faces
                if (result.faces && result.faces.length > 0) {
                    const scaleX = canvas.width / video.videoWidth;
                    const scaleY = canvas.height / video.videoHeight;
                    
                    result.faces.forEach((face, index) => {
                        const x = face.x * scaleX;
                        const y = face.y * scaleY;
                        const width = face.width * scaleX;
                        const height = face.height * scaleY;
                        
                        // Choose color based on number of faces
                        const color = result.num_faces === 1 ? '#10b981' : '#ef4444'; // Green if 1, Red if multiple
                        
                        // Draw rectangle
                        ctx.strokeStyle = color;
                        ctx.lineWidth = 3;
                        ctx.strokeRect(x, y, width, height);
                        
                        // Draw corner markers
                        const markerSize = 20;
                        ctx.lineWidth = 4;
                        
                        // Top-left corner
                        ctx.beginPath();
                        ctx.moveTo(x, y + markerSize);
                        ctx.lineTo(x, y);
                        ctx.lineTo(x + markerSize, y);
                        ctx.stroke();
                        
                        // Top-right corner
                        ctx.beginPath();
                        ctx.moveTo(x + width - markerSize, y);
                        ctx.lineTo(x + width, y);
                        ctx.lineTo(x + width, y + markerSize);
                        ctx.stroke();
                        
                        // Bottom-left corner
                        ctx.beginPath();
                        ctx.moveTo(x, y + height - markerSize);
                        ctx.lineTo(x, y + height);
                        ctx.lineTo(x + markerSize, y + height);
                        ctx.stroke();
                        
                        // Bottom-right corner
                        ctx.beginPath();
                        ctx.moveTo(x + width - markerSize, y + height);
                        ctx.lineTo(x + width, y + height);
                        ctx.lineTo(x + width, y + height - markerSize);
                        ctx.stroke();
                        
                        // Draw label
                        if (result.num_faces > 1) {
                            ctx.fillStyle = color;
                            ctx.font = 'bold 16px Arial';
                            ctx.fillText(`Person ${index + 1}`, x, y - 10);
                        }
                    });
                }
                
            } catch (error) {
                // Silently fail and assume no face detected
                setFaceDetected(false);
            }
        }, 500); // Check every 500ms (0.5 seconds)
    };

    const captureImage = async () => {
        if (!videoRef.current || !canvasRef.current || isCapturing) return;

        setIsCapturing(true);
        
        try {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            
            const context = canvas.getContext('2d');
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            // Crop to center oval region to ignore background faces
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            
            // Calculate oval dimensions based on video size
            // Oval guide is w-64 h-80 (256x320px at standard size)
            // Scale to video resolution
            const ovalWidthRatio = 0.4; // 40% of video width
            const ovalHeightRatio = 0.6; // 60% of video height
            const ovalWidth = canvas.width * ovalWidthRatio;
            const ovalHeight = canvas.height * ovalHeightRatio;
            
            // Create rectangular crop area that contains the oval
            const cropX = Math.max(0, centerX - ovalWidth / 2);
            const cropY = Math.max(0, centerY - ovalHeight / 2);
            const cropWidth = Math.min(ovalWidth, canvas.width - cropX);
            const cropHeight = Math.min(ovalHeight, canvas.height - cropY);
            
            // Extract cropped region
            const croppedCanvas = document.createElement('canvas');
            croppedCanvas.width = cropWidth;
            croppedCanvas.height = cropHeight;
            const croppedContext = croppedCanvas.getContext('2d');
            croppedContext.drawImage(
                canvas,
                cropX, cropY, cropWidth, cropHeight,
                0, 0, cropWidth, cropHeight
            );
            
            // Convert cropped image to base64
            const imageData = croppedCanvas.toDataURL('image/jpeg', 0.9);
            
            setCapturedImages(prev => [...prev, {
                id: currentStep + 1,
                data: imageData,
                instruction: CAPTURE_INSTRUCTIONS[currentStep]?.text
            }]);
            
            // Move to next step
            if (currentStep + 1 < maxImages) {
                setCurrentStep(prev => prev + 1);
            }
            
        } catch (err) {
            console.error('Error capturing image:', err);
            setError('Failed to capture image. Please try again.');
        } finally {
            setIsCapturing(false);
        }
    };

    const handleCapture = () => {
        if (!cameraReady || isCapturing || currentStep >= maxImages) return;
        captureImage();
    };

    const removeImage = (id) => {
        setCapturedImages(prev => prev.filter(img => img.id !== id));
    };

    const handleComplete = () => {
        if (capturedImages.length < minImages) {
            setError(`Please capture at least ${minImages} images.`);
            return;
        }

        const imageDataArray = capturedImages.map(img => img.data);
        stopCamera();
        onComplete(imageDataArray);
    };

    const handleCancel = () => {
        stopCamera();
        onCancel();
    };

    const handleRetake = () => {
        setCapturedImages([]);
        setCurrentStep(0);
        setError(null);
    };

    const progress = Math.min(100, (capturedImages.length / maxImages) * 100);
    const isComplete = capturedImages.length >= minImages;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 relative">
                    <h2 className="text-2xl font-bold mb-2">Face Recognition Setup</h2>
                    <p className="text-blue-100 text-sm">
                        We'll capture multiple images of your face for secure authentication
                    </p>
                    <button
                        onClick={handleCancel}
                        className="absolute top-4 right-4 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    {/* Progress Bar */}
                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-700">
                                Progress: {capturedImages.length} / {maxImages} images
                            </span>
                            <span className="text-sm text-gray-500">
                                {isComplete ? 'Ready to continue' : `${minImages - capturedImages.length} more needed`}
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                                className={`h-2.5 rounded-full transition-all duration-300 ${
                                    isComplete ? 'bg-green-500' : 'bg-blue-600'
                                }`}
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
                            <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
                            <p className="text-red-700 text-sm">{error}</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Camera Feed */}
                        <div className="space-y-4">
                            <div className="relative bg-gray-900 rounded-lg overflow-hidden" style={{ aspectRatio: '4/3' }}>
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className="w-full h-full object-cover"
                                />
                                <canvas ref={canvasRef} className="hidden" />
                                
                                {/* Face Detection Overlay */}
                                <canvas
                                    ref={overlayCanvasRef}
                                    className="absolute inset-0 w-full h-full pointer-events-none"
                                    style={{ zIndex: 1 }}
                                />
                                
                                {/* Face Detection Status Badge */}
                                {cameraReady && faceDetected && (
                                    <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center" style={{ zIndex: 2 }}>
                                        <CheckCircle2 className="w-4 h-4 mr-1" />
                                        Face Detected
                                    </div>
                                )}
                                
                                {/* Oval Guide Overlay (same as login page) */}
                                {cameraReady && (
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 2 }}>
                                        <div className="w-64 h-80 border-4 border-blue-500 rounded-full opacity-50"></div>
                                    </div>
                                )}

                                {/* Camera Status */}
                                {!cameraReady && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                                        <div className="text-center text-white">
                                            <Loader className="w-8 h-8 animate-spin mx-auto mb-2" />
                                            <p>Initializing camera...</p>
                                        </div>
                                    </div>
                                )}

                                {/* Current Instruction */}
                                {cameraReady && currentStep < maxImages && (
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6" style={{ zIndex: 2 }}>
                                        <div className="text-center">
                                            <p className="text-white text-sm mb-2">
                                                Keep your face inside the blue oval
                                            </p>
                                            <p className="text-white text-lg font-semibold mb-1">
                                                Step {currentStep + 1} of {maxImages}
                                            </p>
                                            <p className="text-blue-300 text-xl font-bold mb-3">
                                                {CAPTURE_INSTRUCTIONS[currentStep]?.text}
                                            </p>
                                            <button
                                                onClick={handleCapture}
                                                disabled={isCapturing}
                                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center mx-auto pointer-events-auto"
                                            >
                                                <Camera className="w-5 h-5 mr-2" />
                                                {isCapturing ? 'Capturing...' : 'Capture Photo'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Instructions */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
                                    <Camera className="w-4 h-4 mr-2" />
                                    Tips for best results:
                                </h3>
                                <ul className="text-sm text-blue-800 space-y-1">
                                    <li>• <strong>Keep face inside the blue oval guide</strong></li>
                                    <li>• <strong>Good lighting is crucial</strong> - face camera toward light source</li>
                                    <li>• Avoid harsh shadows on face</li>
                                    <li>• Remove glasses, hats, or face coverings</li>
                                    <li>• Follow each instruction carefully</li>
                                    <li>• Stay still during countdown</li>
                                    <li>• Neutral expression unless instructed</li>
                                </ul>
                            </div>
                            
                            {/* Oval Guide Info */}
                            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                                <p className="text-xs text-purple-800">
                                    <strong>🎯 Center Focus:</strong> The blue oval shows the capture area. 
                                    Keep your face centered inside the oval. Background faces outside the oval will be ignored.
                                </p>
                            </div>
                            
                            {/* Lighting Quality Indicator */}
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                                <p className="text-xs text-amber-800">
                                    <strong>💡 Lighting Check:</strong> Make sure your face is well-lit. 
                                    The system will capture {maxImages} images with slight variations to improve accuracy.
                                    Each image will be processed with 7 different lighting/angle adjustments automatically.
                                </p>
                            </div>
                        </div>

                        {/* Captured Images */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-gray-900 flex items-center">
                                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                                Captured Images ({capturedImages.length})
                            </h3>
                            
                            <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto p-2">
                                {capturedImages.map((img) => (
                                    <div key={img.id} className="relative group">
                                        <img
                                            src={img.data}
                                            alt={`Capture ${img.id}`}
                                            className="w-full h-32 object-cover rounded-lg border-2 border-green-500"
                                        />
                                        <button
                                            onClick={() => removeImage(img.id)}
                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white text-xs p-1 text-center rounded-b-lg">
                                            {img.instruction}
                                        </div>
                                    </div>
                                ))}
                                
                                {/* Empty slots */}
                                {Array.from({ length: maxImages - capturedImages.length }).map((_, idx) => (
                                    <div
                                        key={`empty-${idx}`}
                                        className="w-full h-32 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center"
                                    >
                                        <Camera className="w-8 h-8 text-gray-400" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-6 flex gap-3 justify-end">
                        <button
                            onClick={handleCancel}
                            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        
                        {capturedImages.length > 0 && (
                            <button
                                onClick={handleRetake}
                                className="px-6 py-2.5 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                            >
                                Retake All
                            </button>
                        )}
                        
                        <button
                            onClick={handleComplete}
                            disabled={!isComplete}
                            className={`px-6 py-2.5 rounded-lg transition-colors flex items-center ${
                                isComplete
                                    ? 'bg-green-600 text-white hover:bg-green-700'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                        >
                            <CheckCircle className="w-5 h-5 mr-2" />
                            Continue with Registration
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FaceCaptureComponent;
