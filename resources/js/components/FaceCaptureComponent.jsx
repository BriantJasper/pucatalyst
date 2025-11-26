import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, CheckCircle, AlertCircle, Loader } from 'lucide-react';

const CAPTURE_INSTRUCTIONS = [
    { id: 1, text: "Look straight ahead", duration: 2000 },
    { id: 2, text: "Tilt your head slightly to the left", duration: 2000 },
    { id: 3, text: "Tilt your head slightly to the right", duration: 2000 },
    { id: 4, text: "Look up slightly", duration: 2000 },
    { id: 5, text: "Look down slightly", duration: 2000 },
    { id: 6, text: "Smile slightly", duration: 2000 },
    { id: 7, text: "Look straight ahead again", duration: 2000 },
];

const FaceCaptureComponent = ({ onComplete, onCancel, minImages = 5, maxImages = 7 }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);
    
    const [currentStep, setCurrentStep] = useState(0);
    const [capturedImages, setCapturedImages] = useState([]);
    const [isCapturing, setIsCapturing] = useState(false);
    const [error, setError] = useState(null);
    const [cameraReady, setCameraReady] = useState(false);
    const [countdown, setCountdown] = useState(null);

    // Initialize camera
    useEffect(() => {
        startCamera();
        return () => {
            stopCamera();
        };
    }, []);

    // Auto-capture timer
    useEffect(() => {
        if (!cameraReady || isCapturing || currentStep >= maxImages) return;

        const instruction = CAPTURE_INSTRUCTIONS[currentStep];
        if (!instruction) return;

        // Show countdown before capture
        const countdownTimer = setTimeout(() => {
            setCountdown(3);
            
            const countdownInterval = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) {
                        clearInterval(countdownInterval);
                        captureImage();
                        return null;
                    }
                    return prev - 1;
                });
            }, 1000);
        }, 1000);

        return () => {
            clearTimeout(countdownTimer);
        };
    }, [currentStep, cameraReady, isCapturing]);

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
                };
            }
        } catch (err) {
            console.error('Error accessing camera:', err);
            setError('Unable to access camera. Please grant camera permissions.');
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setCameraReady(false);
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
            
            // Convert to base64
            const imageData = canvas.toDataURL('image/jpeg', 0.9);
            
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
                                
                                {/* Countdown Overlay */}
                                {countdown !== null && (
                                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                        <div className="text-white text-8xl font-bold animate-pulse">
                                            {countdown}
                                        </div>
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
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6">
                                        <div className="text-center">
                                            <p className="text-white text-lg font-semibold mb-1">
                                                Step {currentStep + 1} of {maxImages}
                                            </p>
                                            <p className="text-blue-300 text-xl font-bold">
                                                {CAPTURE_INSTRUCTIONS[currentStep]?.text}
                                            </p>
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
                                    <li>• Ensure good lighting on your face</li>
                                    <li>• Remove glasses if possible</li>
                                    <li>• Keep your face centered in the frame</li>
                                    <li>• Follow the on-screen instructions</li>
                                    <li>• Stay still during each capture</li>
                                </ul>
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
