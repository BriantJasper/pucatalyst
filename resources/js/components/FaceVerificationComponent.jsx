import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, CheckCircle, AlertCircle, Loader, Shield } from 'lucide-react';

const FaceVerificationComponent = ({ onVerify, onCancel, userEmail }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);
    
    const [cameraReady, setCameraReady] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [error, setError] = useState(null);
    const [countdown, setCountdown] = useState(null);
    const [capturedImage, setCapturedImage] = useState(null);

    useEffect(() => {
        startCamera();
        return () => {
            stopCamera();
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

    const captureAndVerify = async () => {
        if (!videoRef.current || !canvasRef.current || isVerifying) return;

        setIsVerifying(true);
        setError(null);

        try {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            
            const context = canvas.getContext('2d');
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            // Convert to base64
            const imageData = canvas.toDataURL('image/jpeg', 0.9);
            setCapturedImage(imageData);
            
            // Send to verification
            stopCamera();
            onVerify(imageData);
            
        } catch (err) {
            console.error('Error capturing image:', err);
            setError('Failed to capture image. Please try again.');
            setIsVerifying(false);
        }
    };

    const handleCapture = () => {
        setCountdown(3);
        
        const countdownInterval = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(countdownInterval);
                    captureAndVerify();
                    return null;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const handleRetry = () => {
        setCapturedImage(null);
        setError(null);
        setIsVerifying(false);
        startCamera();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 relative">
                    <div className="flex items-center mb-2">
                        <Shield className="w-6 h-6 mr-3" />
                        <h2 className="text-2xl font-bold">Face Verification Required</h2>
                    </div>
                    <p className="text-purple-100 text-sm">
                        Two-factor authentication for enhanced security
                    </p>
                    {!isVerifying && (
                        <button
                            onClick={onCancel}
                            className="absolute top-4 right-4 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>

                <div className="p-6">
                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
                            <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <p className="text-red-700 text-sm">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Camera Feed or Captured Image */}
                    <div className="mb-6">
                        <div className="relative bg-gray-900 rounded-lg overflow-hidden" style={{ aspectRatio: '4/3' }}>
                            {!capturedImage ? (
                                <>
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

                                    {/* Face Guide Overlay */}
                                    {cameraReady && !countdown && (
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            <div className="w-64 h-80 border-4 border-blue-500 rounded-full opacity-50"></div>
                                        </div>
                                    )}

                                    {/* Instruction */}
                                    {cameraReady && !countdown && (
                                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6">
                                            <p className="text-white text-center text-lg font-semibold">
                                                Position your face in the circle
                                            </p>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="relative">
                                    <img
                                        src={capturedImage}
                                        alt="Captured face"
                                        className="w-full h-full object-cover"
                                    />
                                    {isVerifying && (
                                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                            <div className="text-center text-white">
                                                <Loader className="w-12 h-12 animate-spin mx-auto mb-4" />
                                                <p className="text-xl font-semibold">Verifying your identity...</p>
                                                <p className="text-sm text-gray-300 mt-2">Please wait</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Instructions */}
                    {!capturedImage && cameraReady && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                            <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
                                <Camera className="w-4 h-4 mr-2" />
                                For successful verification:
                            </h3>
                            <ul className="text-sm text-blue-800 space-y-1">
                                <li>• Look directly at the camera</li>
                                <li>• Ensure your face is well-lit</li>
                                <li>• Remove glasses if possible</li>
                                <li>• Keep your face centered in the frame</li>
                                <li>• Stay still during capture</li>
                            </ul>
                        </div>
                    )}

                    {/* Action Buttons */}
                    {!capturedImage ? (
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={onCancel}
                                disabled={isVerifying || countdown !== null}
                                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCapture}
                                disabled={!cameraReady || isVerifying || countdown !== null}
                                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                            >
                                <Camera className="w-5 h-5 mr-2" />
                                Verify Face
                            </button>
                        </div>
                    ) : (
                        !isVerifying && error && (
                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={onCancel}
                                    className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleRetry}
                                    className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                                >
                                    <Camera className="w-5 h-5 mr-2" />
                                    Try Again
                                </button>
                            </div>
                        )
                    )}

                    {/* Security Note */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <p className="text-xs text-gray-500 text-center flex items-center justify-center">
                            <Shield className="w-3 h-3 mr-1" />
                            Your facial data is encrypted and securely stored
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FaceVerificationComponent;
