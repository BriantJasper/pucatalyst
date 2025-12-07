import React, { useState } from "react";
import {
    Camera,
    Shield,
    AlertCircle,
    CheckCircle,
    Loader2,
} from "lucide-react";
import { useToast } from "../hooks/use-toast";
import api from "../lib/axios";
import FaceCaptureComponent from "./FaceCaptureComponent";

export default function FaceAuthSettings({ user, onUpdate }) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [showFaceCapture, setShowFaceCapture] = useState(false);
    const [isEnabled, setIsEnabled] = useState(
        user?.face_auth_enabled || false
    );

    const handleEnableFaceAuth = () => {
        setShowFaceCapture(true);
    };

    const handleDisableFaceAuth = async () => {
        if (
            !confirm(
                "Are you sure you want to disable face authentication? You can re-enable it anytime."
            )
        ) {
            return;
        }

        setLoading(true);
        try {
            await api.post("/auth/disable-face-auth");
            setIsEnabled(false);
            toast({
                title: "Success",
                description: "Face authentication disabled",
            });
            if (onUpdate) onUpdate({ ...user, face_auth_enabled: false });
        } catch (err) {
            toast({
                variant: "destructive",
                title: "Error",
                description:
                    err.response?.data?.message ||
                    "Failed to disable face authentication",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleFaceCaptureComplete = async (capturedImages) => {
        setShowFaceCapture(false);
        setLoading(true);

        try {
            const response = await api.post("/auth/setup-face-auth", {
                face_images: capturedImages,
            });

            if (response.data.success) {
                setIsEnabled(true);
                toast({
                    title: "Success",
                    description: "Face authentication enabled successfully!",
                });
                if (onUpdate)
                    onUpdate({
                        ...user,
                        face_auth_enabled: true,
                        face_registered_at: new Date(),
                    });
            }
        } catch (err) {
            toast({
                variant: "destructive",
                title: "Setup Failed",
                description:
                    err.response?.data?.message ||
                    "Failed to set up face authentication",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleFaceCaptureCancel = () => {
        setShowFaceCapture(false);
        toast({
            description: "Face authentication setup cancelled",
        });
    };

    const formatDate = (dateString) => {
        if (!dateString) return "Not set";
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    return (
        <div className="glass-card rounded-xl border border-white/10 p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-primary/10 text-primary rounded-lg border border-primary/20">
                    <Shield className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-foreground">
                        Face Authentication
                    </h2>
                    <p className="text-sm text-muted-foreground font-medium">
                        Enhanced security with facial recognition
                    </p>
                </div>
            </div>

            {/* Status */}
            <div
                className={`p-4 rounded-lg border mb-6 ${
                    isEnabled
                        ? "bg-green-900/20 border-green-500/30"
                        : "bg-white/5 border-white/10"
                }`}
            >
                <div className="flex items-start gap-3">
                    {isEnabled ? (
                        <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    ) : (
                        <AlertCircle className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-foreground">
                                {isEnabled ? "Enabled" : "Disabled"}
                            </span>
                            <span
                                className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                                    isEnabled
                                        ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                        : "bg-white/10 text-muted-foreground border border-white/10"
                                }`}
                            >
                                {isEnabled ? "Active" : "Inactive"}
                            </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {isEnabled
                                ? `Face authentication is active. You'll need to verify your face when logging in.`
                                : "Face authentication is not set up. Enable it for additional security."}
                        </p>
                        {isEnabled && user?.face_registered_at && (
                            <p className="text-xs text-muted-foreground/70 mt-2">
                                Registered on:{" "}
                                {formatDate(user.face_registered_at)}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Info Box */}
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
                <div className="flex gap-3">
                    <Camera className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                        <p className="font-medium mb-1 text-foreground">
                            How it works:
                        </p>
                        <ul className="space-y-1 text-muted-foreground">
                            <li>• Capture 5-7 images with different poses</li>
                            <li>
                                • Your face data is encrypted and stored
                                securely
                            </li>
                            <li>
                                • Two-factor authentication: password + face
                                verification
                            </li>
                            <li>• You can update or disable it anytime</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
                {isEnabled ? (
                    <>
                        <button
                            onClick={handleEnableFaceAuth}
                            disabled={loading}
                            className="flex-1 px-4 py-3 bg-primary/20 text-primary rounded-lg font-bold hover:bg-primary hover:text-black border border-primary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <Camera className="w-5 h-5" />
                                    Update Face Data
                                </>
                            )}
                        </button>
                        <button
                            onClick={handleDisableFaceAuth}
                            disabled={loading}
                            className="px-4 py-3 bg-red-600/20 text-red-400 rounded-lg font-bold hover:bg-red-600 hover:text-white border border-red-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Disable
                        </button>
                    </>
                ) : (
                    <button
                        onClick={handleEnableFaceAuth}
                        disabled={loading}
                        className="w-full px-4 py-3 bg-primary/20 text-primary rounded-lg font-bold hover:bg-primary hover:text-black border border-primary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <Camera className="w-5 h-5" />
                                Enable Face Authentication
                            </>
                        )}
                    </button>
                )}
            </div>

            {/* Face Capture Modal */}
            {showFaceCapture && (
                <FaceCaptureComponent
                    onComplete={handleFaceCaptureComplete}
                    onCancel={handleFaceCaptureCancel}
                    minImages={5}
                    maxImages={7}
                />
            )}
        </div>
    );
}
