import React, { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
    Camera,
    X,
    CheckCircle,
    CheckCircle2,
    AlertCircle,
    Loader,
} from "lucide-react";

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

const FaceCaptureComponent = ({
    onComplete,
    onCancel,
    minImages = 12,
    maxImages = 20,
}) => {
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
                    facingMode: "user",
                },
                audio: false,
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
            console.error("Error accessing camera:", err);
            setError(
                "Unable to access camera. Please grant camera permissions."
            );
        }
    };

    const stopCamera = () => {
        if (faceDetectionIntervalRef.current) {
            clearInterval(faceDetectionIntervalRef.current);
            faceDetectionIntervalRef.current = null;
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
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
            if (!videoRef.current || !overlayCanvasRef.current || !cameraReady)
                return;

            const video = videoRef.current;
            const canvas = overlayCanvasRef.current;
            const ctx = canvas.getContext("2d");

            // Set canvas size to match video
            if (canvas.width !== video.videoWidth) {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
            }

            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Try to detect face using a temporary canvas
            try {
                const tempCanvas = document.createElement("canvas");
                tempCanvas.width = video.videoWidth;
                tempCanvas.height = video.videoHeight;
                const tempCtx = tempCanvas.getContext("2d");
                tempCtx.drawImage(video, 0, 0);
                const imageData = tempCanvas.toDataURL("image/jpeg", 0.8);

                // Quick detection call to service
                const response = await fetch(
                    "http://localhost:5000/detect-face",
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            image: imageData.split(",")[1],
                        }),
                    }
                );

                const result = await response.json();
                setFaceDetected(result.face_detected === true);

                // Show warning if multiple faces
                if (result.num_faces > 1) {
                    setError(
                        "Multiple people detected! Please ensure only you are visible in the frame."
                    );
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
                        const color =
                            result.num_faces === 1 ? "#10b981" : "#ef4444"; // Green if 1, Red if multiple

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
                            ctx.font = "bold 16px Arial";
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

            const context = canvas.getContext("2d");
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            // Send the FULL image to backend - let backend detect and extract the face
            // The oval guide is just visual, backend will find the largest/most centered face
            // This approach handles background people by backend selecting the primary face
            const imageData = canvas.toDataURL("image/jpeg", 0.9);

            setCapturedImages((prev) => [
                ...prev,
                {
                    id: currentStep + 1,
                    data: imageData,
                    instruction: CAPTURE_INSTRUCTIONS[currentStep]?.text,
                },
            ]);

            // Move to next step
            if (currentStep + 1 < maxImages) {
                setCurrentStep((prev) => prev + 1);
            }
        } catch (err) {
            console.error("Error capturing image:", err);
            setError("Failed to capture image. Please try again.");
        } finally {
            setIsCapturing(false);
        }
    };

    const handleCapture = () => {
        if (!cameraReady || isCapturing || currentStep >= maxImages) return;
        captureImage();
    };

    const removeImage = (id) => {
        setCapturedImages((prev) => prev.filter((img) => img.id !== id));
    };

    const handleComplete = () => {
        if (capturedImages.length < minImages) {
            setError(`Please capture at least ${minImages} images.`);
            return;
        }

        const imageDataArray = capturedImages.map((img) => img.data);
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

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* Modal */}
            <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border-2 border-white/20 bg-black/80 backdrop-blur-xl shadow-[0_0_60px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)] animate-fade-up">
                {/* Header */}
                <div className="sticky top-0 z-10 flex items-start justify-between p-6 border-b border-white/10 bg-black/40 backdrop-blur-xl">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/20 text-white rounded-lg border border-primary/30">
                            <Camera className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">
                                Face Recognition Setup
                            </h2>
                            <p className="text-gray-400 text-sm font-medium">
                                We'll capture multiple images of your face for
                                secure authentication
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleCancel}
                        className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    {/* Progress Bar */}
                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-bold text-white">
                                Progress: {capturedImages.length} / {maxImages}{" "}
                                images
                            </span>
                            <span className="text-sm text-gray-400 font-medium">
                                {isComplete
                                    ? "Ready to continue"
                                    : `${
                                          minImages - capturedImages.length
                                      } more needed`}
                            </span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2.5">
                            <div
                                className={`h-2.5 rounded-full transition-all duration-300 ${
                                    isComplete ? "bg-green-500" : "bg-primary"
                                }`}
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-4 bg-red-900/20 border border-red-500/30 rounded-lg flex items-start">
                            <AlertCircle className="w-5 h-5 text-red-400 mr-3 flex-shrink-0 mt-0.5" />
                            <p className="text-red-300 text-sm font-medium">
                                {error}
                            </p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Camera Feed */}
                        <div className="space-y-4">
                            <div
                                className="relative bg-black/50 rounded-lg overflow-hidden border border-white/10"
                                style={{ aspectRatio: "4/3" }}
                            >
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
                                    <div
                                        className="absolute top-4 left-4 bg-green-500/90 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center border border-green-400/50"
                                        style={{ zIndex: 2 }}
                                    >
                                        <CheckCircle2 className="w-4 h-4 mr-1" />
                                        Face Detected
                                    </div>
                                )}

                                {/* Oval Guide Overlay */}
                                {cameraReady && (
                                    <div
                                        className="absolute inset-0 flex items-center justify-center pointer-events-none"
                                        style={{ zIndex: 2 }}
                                    >
                                        <div className="w-64 h-80 border-4 border-primary rounded-full opacity-60"></div>
                                    </div>
                                )}

                                {/* Camera Status */}
                                {!cameraReady && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                                        <div className="text-center text-white">
                                            <Loader className="w-8 h-8 animate-spin mx-auto mb-2 text-primary" />
                                            <p className="font-medium">
                                                Initializing camera...
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Current Instruction */}
                                {cameraReady && currentStep < maxImages && (
                                    <div
                                        className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6"
                                        style={{ zIndex: 2 }}
                                    >
                                        <div className="text-center">
                                            <p className="text-white/80 text-sm mb-2 font-medium">
                                                Keep your face inside the oval
                                                guide
                                            </p>
                                            <p className="text-white text-lg font-bold mb-1">
                                                Step {currentStep + 1} of{" "}
                                                {maxImages}
                                            </p>
                                            <p className="text-white text-xl font-bold mb-3">
                                                {
                                                    CAPTURE_INSTRUCTIONS[
                                                        currentStep
                                                    ]?.text
                                                }
                                            </p>
                                            <button
                                                onClick={handleCapture}
                                                disabled={isCapturing}
                                                className="bg-cyan-500 hover:bg-cyan-400 text-black px-6 py-2.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center mx-auto pointer-events-auto font-bold shadow-lg shadow-cyan-500/30"
                                            >
                                                <Camera className="w-5 h-5 mr-2" />
                                                {isCapturing
                                                    ? "Capturing..."
                                                    : "Capture Photo"}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Instructions */}
                            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                                <h3 className="font-bold text-white mb-2 flex items-center">
                                    <Camera className="w-4 h-4 mr-2 text-primary" />
                                    Tips for best results:
                                </h3>
                                <ul className="text-sm text-gray-400 space-y-1">
                                    <li>
                                        •{" "}
                                        <strong className="text-white">
                                            Keep face inside the oval guide
                                        </strong>
                                    </li>
                                    <li>
                                        •{" "}
                                        <strong className="text-white">
                                            Good lighting is crucial
                                        </strong>{" "}
                                        - face camera toward light source
                                    </li>
                                    <li>• Avoid harsh shadows on face</li>
                                    <li>
                                        • Remove glasses, hats, or face
                                        coverings
                                    </li>
                                    <li>• Follow each instruction carefully</li>
                                    <li>• Stay still during countdown</li>
                                    <li>
                                        • Neutral expression unless instructed
                                    </li>
                                </ul>
                            </div>

                            {/* Oval Guide Info */}
                            <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-3">
                                <p className="text-xs text-purple-300">
                                    <strong className="text-purple-200">
                                        🎯 Center Focus:
                                    </strong>{" "}
                                    The oval shows the capture area. Keep your
                                    face centered inside the oval. Background
                                    faces outside the oval will be ignored.
                                </p>
                            </div>

                            {/* Lighting Quality Indicator */}
                            <div className="bg-amber-900/20 border border-amber-500/30 rounded-lg p-3">
                                <p className="text-xs text-amber-300">
                                    <strong className="text-amber-200">
                                        💡 Lighting Check:
                                    </strong>{" "}
                                    Make sure your face is well-lit. The system
                                    will capture {maxImages} images with slight
                                    variations to improve accuracy.
                                </p>
                            </div>
                        </div>

                        {/* Captured Images */}
                        <div className="space-y-4">
                            <h3 className="font-bold text-white flex items-center">
                                <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                                Captured Images ({capturedImages.length})
                            </h3>

                            <div className="grid grid-cols-2 gap-3 p-2">
                                {capturedImages.map((img) => (
                                    <div
                                        key={img.id}
                                        className="relative group"
                                    >
                                        <img
                                            src={img.data}
                                            alt={`Capture ${img.id}`}
                                            className="w-full h-28 object-cover rounded-lg border-2 border-green-500/50"
                                        />
                                        <button
                                            onClick={() => removeImage(img.id)}
                                            className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                        <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-white text-xs p-1 text-center rounded-b-lg font-medium">
                                            {img.instruction}
                                        </div>
                                    </div>
                                ))}

                                {/* Empty slots */}
                                {Array.from({
                                    length: maxImages - capturedImages.length,
                                }).map((_, idx) => (
                                    <div
                                        key={`empty-${idx}`}
                                        className="w-full h-28 bg-white/5 rounded-lg border-2 border-dashed border-white/10 flex items-center justify-center"
                                    >
                                        <Camera className="w-6 h-6 text-gray-500" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-6 flex gap-3 justify-end">
                        <button
                            onClick={handleCancel}
                            className="px-6 py-2.5 bg-white/10 text-white border border-white/10 rounded-lg font-bold hover:bg-white/20 transition-all"
                        >
                            Cancel
                        </button>

                        {capturedImages.length > 0 && (
                            <button
                                onClick={handleRetake}
                                className="px-6 py-2.5 bg-amber-600/20 text-amber-400 rounded-lg font-bold hover:bg-amber-600 hover:text-white border border-amber-500/30 transition-all"
                            >
                                Retake All
                            </button>
                        )}

                        <button
                            onClick={handleComplete}
                            disabled={!isComplete}
                            className={`px-6 py-2.5 rounded-lg transition-all flex items-center font-bold ${
                                isComplete
                                    ? "bg-green-600/20 text-green-400 hover:bg-green-600 hover:text-white border border-green-500/30"
                                    : "bg-white/5 text-muted-foreground cursor-not-allowed border border-white/10"
                            }`}
                        >
                            <CheckCircle className="w-5 h-5 mr-2" />
                            Complete Setup
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default FaceCaptureComponent;
