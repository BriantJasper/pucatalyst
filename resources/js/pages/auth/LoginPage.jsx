import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useToast } from "../../hooks/use-toast";
import api from "../../lib/axios";
import { useAuthStore } from "../../store/authStore";
import StarryBackground from "../../components/StarryBackground";

export default function LoginPage() {
    const navigate = useNavigate();
    const setAuth = useAuthStore((state) => state.setAuth);
    const { toast } = useToast();

    const [formData, setFormData] = useState({
        login: "",
        password: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showFaceVerification, setShowFaceVerification] = useState(false);
    const [tempToken, setTempToken] = useState(null);
    const [pendingUser, setPendingUser] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await api.post("/auth/login", formData);

            // Check if face verification is required
            if (response.data.requires_face_verification) {
                setTempToken(response.data.temp_token);
                setPendingUser(response.data.user);
                setShowFaceVerification(true);
                setLoading(false);
                toast({
                    title: "Action Required",
                    description: "Please verify your face to complete login",
                });
                return;
            }

            // Normal login without face verification
            const { access_token, user } = response.data;

            localStorage.setItem("access_token", access_token);
            setAuth(user, access_token);

            toast({
                title: "Welcome back!",
                description: `Welcome back, ${user.name}!`,
            });

            // Redirect based on role
            redirectBasedOnRole(user);
        } catch (err) {
            const message =
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Login failed. Please try again.";
            setError(message);
            toast({
                variant: "destructive",
                title: "Login Failed",
                description: message,
            });
            setLoading(false);
        }
    };

    const handleFaceVerification = async (faceImage) => {
        try {
            const response = await api.post("/auth/verify-face", {
                face_image: faceImage,
                temp_token: tempToken,
            });

            if (response.data.access_token) {
                const { access_token, user, confidence } = response.data;

                localStorage.setItem("access_token", access_token);
                setAuth(user, access_token);

                toast({
                    title: "Face Verified",
                    description: `Face verified! Welcome back, ${
                        user.name
                    }! (Confidence: ${confidence.toFixed(1)}%)`,
                });
                setShowFaceVerification(false);

                // Redirect based on role
                redirectBasedOnRole(user);
            }
        } catch (err) {
            const message =
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Face verification failed";
            const confidence = err.response?.data?.confidence;

            // Show detailed error message
            if (
                message.includes("not match") ||
                message.includes("does not match")
            ) {
                toast({
                    variant: "destructive",
                    title: "Face Mismatch",
                    description: confidence
                        ? `Face does not match! (Confidence: ${confidence.toFixed(
                              1
                          )}%)`
                        : "Face verification failed. Please try again.",
                });
            } else {
                toast({
                    variant: "destructive",
                    title: "Verification Failed",
                    description: message,
                });
            }

            setError(message);
            setShowFaceVerification(false);
            setLoading(false);
        }
    };

    const handleFaceVerificationCancel = () => {
        setShowFaceVerification(false);
        setTempToken(null);
        setPendingUser(null);
        toast.info("Face verification cancelled. Please try again.");
    };

    const redirectBasedOnRole = (user) => {
        if (user.role === "student") {
            navigate("/student/dashboard");
        } else if (user.role === "alumni") {
            navigate("/alumni/dashboard");
        } else if (user.role === "admin") {
            navigate("/admin/dashboard");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12 font-sans relative">
            <StarryBackground />
            <div className="w-full max-w-md relative z-10">
                {/* Logo */}
                <Link
                    to="/"
                    className="flex items-center justify-center gap-2 mb-8"
                >
                    <img
                        src="/images/logo1.png"
                        alt="PU Catalyst Logo"
                        className="h-16 w-auto object-contain" // Adjusted size for auth pages
                    />
                </Link>

                {/* Card */}
                <div className="bg-black/30 backdrop-blur-md rounded-none shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)] p-8 border-2 border-white/20">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-white mb-2 uppercase">
                            Welcome Back
                        </h1>
                        <p className="text-gray-300 font-medium">
                            Sign in to continue your journey
                        </p>
                    </div>

                    {/* Error Alert */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-500/20 border-2 border-red-500 flex gap-3 shadow-[4px_4px_0px_0px_rgba(220,38,38,0.4)]">
                            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                            <p className="text-white text-sm font-bold">
                                {error}
                            </p>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email or Student ID */}
                        <div>
                            <label className="block text-sm font-bold text-white mb-2 uppercase">
                                Email or Student ID
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={formData.login}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            login: e.target.value,
                                        })
                                    }
                                    placeholder="EMAIL OR STUDENT ID"
                                    required
                                    className="w-full pl-10 pr-4 py-3 border-2 border-white/20 rounded-none focus:outline-none focus:border-white focus:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] transition-all bg-white/5 text-white font-bold placeholder:text-gray-600"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-bold text-white mb-2 uppercase">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={formData.password}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            password: e.target.value,
                                        })
                                    }
                                    placeholder="ENTER YOUR PASSWORD"
                                    required
                                    className="w-full pl-10 pr-12 py-3 border-2 border-white/20 rounded-none focus:outline-none focus:border-white focus:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] transition-all bg-white/5 text-white font-bold placeholder:text-gray-600"
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Remember & Forgot */}
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 text-white border-2 border-white/50 rounded-none focus:ring-0 focus:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.4)] bg-transparent"
                                />
                                <span className="text-sm text-gray-300 font-bold">
                                    Remember me
                                </span>
                            </label>
                            <a
                                href="#"
                                className="text-sm text-white hover:text-gray-300 hover:underline font-bold"
                            >
                                Forgot password?
                            </a>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-white text-black py-4 rounded-none font-bold text-lg hover:bg-gray-200 border-2 border-white transition-all shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-50 disabled:cursor-not-allowed uppercase"
                        >
                            {loading ? "Signing in..." : "Sign In"}
                        </button>
                    </form>

                    {/* Sign Up Link */}
                    <p className="text-center mt-8 text-gray-300 font-medium">
                        Don't have an account?{" "}
                        <Link
                            to="/register"
                            className="text-white font-bold underline hover:bg-white hover:text-black transition-colors px-1"
                        >
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>

            {/* Face Verification Modal */}
            {showFaceVerification && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-lg">
                        <FaceVerificationComponent
                            onVerify={handleFaceVerification}
                            onCancel={handleFaceVerificationCancel}
                            userEmail={pendingUser?.email}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
