import React, { useRef, useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import {
    Camera,
    X,
    CheckCircle2,
    AlertCircle,
    Loader,
    Shield,
    Scan,
    RefreshCw,
} from "lucide-react";
import api from "../lib/axios";

const FaceVerificationComponent = ({
    onVerify,
    onCancel,
    userEmail,
    tempToken,
    isStandalone = false,
}) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const overlayCanvasRef = useRef(null);
    const streamRef = useRef(null);
    const faceDetectionIntervalRef = useRef(null);
    const lockStartTimeRef = useRef(null);
    const progressIntervalRef = useRef(null);

    const [cameraReady, setCameraReady] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [error, setError] = useState(null);
    const [capturedImage, setCapturedImage] = useState(null);
    const [faceDetected, setFaceDetected] = useState(false);
    const [scanningPhase, setScanningPhase] = useState("searching");
    const [verificationFailed, setVerificationFailed] = useState(false);

    const LOCK_DURATION = 1500;

    useEffect(() => {
        startCamera();
        return () => {
            cleanup();
        };
    }, []);

    const cleanup = () => {
        if (faceDetectionIntervalRef.current) {
            clearInterval(faceDetectionIntervalRef.current);
            faceDetectionIntervalRef.current = null;
        }
        if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
            progressIntervalRef.current = null;
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
    };

    const startCamera = async () => {
        try {
            setError(null);
            setVerificationFailed(false);
            setCapturedImage(null);
            setScanningPhase("searching");

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

    const captureAndVerify = useCallback(async () => {
        if (!videoRef.current || !canvasRef.current || isVerifying) return;

        // Stop all intervals
        if (faceDetectionIntervalRef.current) {
            clearInterval(faceDetectionIntervalRef.current);
            faceDetectionIntervalRef.current = null;
        }
        if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
            progressIntervalRef.current = null;
        }

        setIsVerifying(true);
        setScanningPhase("verifying");

        try {
            const video = videoRef.current;
            const canvas = canvasRef.current;

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            const context = canvas.getContext("2d");
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            const imageData = canvas.toDataURL("image/jpeg", 0.9);
            setCapturedImage(imageData);

            // Stop camera while verifying
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((track) => track.stop());
            }

            // Call verification API
            let response;
            if (isStandalone) {
                // Standalone face login - identify user by face
                response = await api.post("/auth/login-face", {
                    face_data: imageData,
                });
            } else {
                // Two-factor verification - verify against known user
                response = await api.post("/auth/verify-face", {
                    face_image: imageData,
                    temp_token: tempToken,
                });
            }

            if (response.data.access_token) {
                // Success - pass result to parent
                onVerify(response.data);
            } else {
                // API returned but no token - treat as failure
                throw new Error(response.data.message || "Verification failed");
            }
        } catch (err) {
            console.error("Verification error:", err);
            const message =
                err.response?.data?.message ||
                err.response?.data?.error ||
                err.message ||
                "Face verification failed. Please try again.";

            setError(message);
            setVerificationFailed(true);
            setIsVerifying(false);
            setScanningPhase("failed");
        }
    }, [isVerifying, onVerify, tempToken, isStandalone]);

    const startFaceDetection = () => {
        faceDetectionIntervalRef.current = setInterval(async () => {
            if (!videoRef.current || !overlayCanvasRef.current || isVerifying)
                return;

            const video = videoRef.current;
            const canvas = overlayCanvasRef.current;
            const ctx = canvas.getContext("2d");

            if (canvas.width !== video.videoWidth) {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            try {
                const tempCanvas = document.createElement("canvas");
                tempCanvas.width = video.videoWidth;
                tempCanvas.height = video.videoHeight;
                const tempCtx = tempCanvas.getContext("2d");
                tempCtx.drawImage(video, 0, 0);
                const imageData = tempCanvas.toDataURL("image/jpeg", 0.8);

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
                const detected = result.face_detected === true;

                if (detected && result.num_faces === 1) {
                    setFaceDetected(true);
                    setError(null);

                    if (!lockStartTimeRef.current) {
                        lockStartTimeRef.current = Date.now();
                        setScanningPhase("locking");

                        if (!progressIntervalRef.current) {
                            progressIntervalRef.current = setInterval(() => {
                                if (!lockStartTimeRef.current) return;

                                const elapsed =
                                    Date.now() - lockStartTimeRef.current;
                                if (elapsed >= LOCK_DURATION) {
                                    clearInterval(progressIntervalRef.current);
                                    progressIntervalRef.current = null;
                                    captureAndVerify();
                                }
                            }, 50);
                        }
                    }
                } else {
                    setFaceDetected(false);
                    lockStartTimeRef.current = null;
                    setScanningPhase("searching");

                    if (progressIntervalRef.current) {
                        clearInterval(progressIntervalRef.current);
                        progressIntervalRef.current = null;
                    }

                    if (result.num_faces > 1) {
                        setError(
                            "Multiple people detected! Please ensure only you are visible."
                        );
                    }
                }

                // Draw face overlay
                if (result.faces && result.faces.length > 0) {
                    const scaleX = canvas.width / video.videoWidth;
                    const scaleY = canvas.height / video.videoHeight;

                    result.faces.forEach((face) => {
                        const x = face.x * scaleX;
                        const y = face.y * scaleY;
                        const width = face.width * scaleX;
                        const height = face.height * scaleY;
                        const color =
                            result.num_faces === 1 ? "#22d3ee" : "#ef4444";

                        ctx.strokeStyle = color;
                        ctx.lineWidth = 3;
                        ctx.shadowColor = color;
                        ctx.shadowBlur = 15;
                        ctx.strokeRect(x, y, width, height);
                        ctx.shadowBlur = 0;
                    });
                }
            } catch (err) {
                setFaceDetected(false);
                lockStartTimeRef.current = null;
                setScanningPhase("searching");
            }
        }, 300);
    };

    const handleRetry = () => {
        cleanup();
        setCapturedImage(null);
        setError(null);
        setIsVerifying(false);
        setFaceDetected(false);
        setVerificationFailed(false);
        setScanningPhase("searching");
        lockStartTimeRef.current = null;
        setCameraReady(false);
        startCamera();
    };

    const getStatusText = () => {
        if (scanningPhase === "verifying") return "Verifying identity...";
        if (scanningPhase === "locking") return "Face detected - Hold still...";
        if (scanningPhase === "failed") return "Verification failed";
        return "Scanning for face...";
    };

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />

            <div className="relative w-full max-w-lg rounded-2xl border-2 border-white/20 bg-black/90 backdrop-blur-xl shadow-[0_0_60px_rgba(0,0,0,0.5)] animate-fade-up overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div
                            className={`p-2 rounded-lg border ${
                                verificationFailed
                                    ? "bg-red-500/20 text-red-400 border-red-500/30"
                                    : "bg-cyan-500/20 text-cyan-400 border-cyan-500/30"
                            }`}
                        >
                            <Shield className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">
                                {verificationFailed
                                    ? "Verification Failed"
                                    : "Face Verification"}
                            </h2>
                            <p className="text-gray-500 text-xs">
                                {verificationFailed
                                    ? "Face did not match - Please try again"
                                    : "Look at the camera to verify"}
                            </p>
                        </div>
                    </div>
                    {!isVerifying && (
                        <button
                            onClick={onCancel}
                            className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-all"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>

                {/* Camera / Error State */}
                <div className="relative" style={{ aspectRatio: "4/3" }}>
                    {verificationFailed ? (
                        // Failed state - show captured image with error overlay
                        <div className="relative w-full h-full">
                            {capturedImage && (
                                <img
                                    src={capturedImage}
                                    alt="Captured"
                                    className="w-full h-full object-cover opacity-50"
                                />
                            )}
                            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center p-6">
                                <div className="w-20 h-20 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center mb-4">
                                    <X className="w-10 h-10 text-red-500" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">
                                    Face Not Recognized
                                </h3>
                                <p className="text-gray-400 text-center text-sm mb-6 max-w-xs">
                                    {error ||
                                        "The captured face did not match your registered face. Please try again."}
                                </p>
                                <button
                                    onClick={handleRetry}
                                    className="flex items-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl transition-all shadow-lg shadow-cyan-500/30"
                                >
                                    <RefreshCw className="w-5 h-5" />
                                    Try Again
                                </button>
                            </div>
                        </div>
                    ) : !capturedImage ? (
                        // Camera state
                        <>
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full object-cover"
                            />
                            <canvas ref={canvasRef} className="hidden" />
                            <canvas
                                ref={overlayCanvasRef}
                                className="absolute inset-0 w-full h-full pointer-events-none"
                            />

                            {/* Overlay */}
                            <div className="absolute inset-0 pointer-events-none">
                                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50" />

                                {cameraReady &&
                                    scanningPhase === "searching" && (
                                        <div
                                            className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-80"
                                            style={{
                                                animation:
                                                    "scanLine 2s ease-in-out infinite",
                                            }}
                                        />
                                    )}

                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div
                                        className={`w-48 h-60 rounded-full border-4 transition-all duration-300 ${
                                            faceDetected
                                                ? "border-green-400 shadow-[0_0_40px_rgba(74,222,128,0.5)]"
                                                : "border-white/30"
                                        }`}
                                    />
                                </div>
                            </div>

                            {!cameraReady ? (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                                    <div className="text-center text-white">
                                        <Loader className="w-8 h-8 animate-spin mx-auto mb-2 text-cyan-400" />
                                        <p className="font-medium">
                                            Initializing camera...
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="absolute bottom-0 left-0 right-0 p-4 text-center">
                                    <div
                                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-sm border ${
                                            faceDetected
                                                ? "bg-green-900/60 border-green-500/30"
                                                : "bg-black/60 border-white/20"
                                        }`}
                                    >
                                        {faceDetected ? (
                                            <CheckCircle2 className="w-4 h-4 text-green-400" />
                                        ) : (
                                            <Scan className="w-4 h-4 text-cyan-400 animate-pulse" />
                                        )}
                                        <span
                                            className={`text-sm font-medium ${
                                                faceDetected
                                                    ? "text-green-300"
                                                    : "text-white"
                                            }`}
                                        >
                                            {getStatusText()}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        // Verifying state
                        <div className="relative w-full h-full">
                            <img
                                src={capturedImage}
                                alt="Captured"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                                <div className="text-center text-white">
                                    <Loader className="w-12 h-12 animate-spin mx-auto mb-4 text-cyan-400" />
                                    <p className="text-xl font-bold">
                                        Verifying...
                                    </p>
                                    <p className="text-sm text-gray-400 mt-1">
                                        Please wait
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Error message for non-verification errors */}
                {error && !verificationFailed && (
                    <div className="p-4 bg-amber-900/20 border-t border-amber-500/30 flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-400" />
                        <p className="text-amber-300 text-sm flex-1">{error}</p>
                    </div>
                )}

                <div className="p-3 border-t border-white/10 text-center">
                    <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                        <Shield className="w-3 h-3" />
                        Secure facial verification
                    </p>
                </div>
            </div>

            <style>{`
                @keyframes scanLine {
                    0%, 100% { top: 10%; }
                    50% { top: 90%; }
                }
            `}</style>
        </div>,
        document.body
    );
};

export default FaceVerificationComponent;
