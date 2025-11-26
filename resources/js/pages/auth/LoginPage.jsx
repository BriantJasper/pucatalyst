import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Rocket, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../lib/axios";
import { useAuthStore } from "../../store/authStore";
import FaceVerificationComponent from "../../components/FaceVerificationComponent";

export default function LoginPage() {
    const navigate = useNavigate();
    const setAuth = useAuthStore((state) => state.setAuth);

    const [formData, setFormData] = useState({
        email: "",
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
                toast.info('Please verify your face to complete login');
                return;
            }

            // Normal login without face verification
            const { access_token, user } = response.data;

            localStorage.setItem("access_token", access_token);
            setAuth(user, access_token);

            toast.success(`Welcome back, ${user.name}!`);

            // Redirect based on role
            redirectBasedOnRole(user);
        } catch (err) {
            const message =
                err.response?.data?.message ||
                "Login failed. Please try again.";
            setError(message);
            toast.error(message);
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

                toast.success(`Face verified! Welcome back, ${user.name}! (Confidence: ${confidence}%)`);
                setShowFaceVerification(false);

                // Redirect based on role
                redirectBasedOnRole(user);
            }
        } catch (err) {
            const message = err.response?.data?.message || err.response?.data?.error || "Face verification failed";
            setError(message);
            toast.error(message);
            setShowFaceVerification(false);
        }
    };

    const handleFaceVerificationCancel = () => {
        setShowFaceVerification(false);
        setTempToken(null);
        setPendingUser(null);
        toast.info('Face verification cancelled. Please try again.');
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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
                {/* Logo */}
                <Link
                    to="/"
                    className="flex items-center justify-center gap-2 mb-8"
                >
                    <Rocket className="w-10 h-10 text-primary-600" />
                    <span className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                        PU Catalyst
                    </span>
                </Link>

                {/* Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            Welcome Back
                        </h1>
                        <p className="text-gray-600">
                            Sign in to continue your journey
                        </p>
                    </div>

                    {/* Error Alert */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <p className="text-red-700 text-sm">{error}</p>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            email: e.target.value,
                                        })
                                    }
                                    placeholder="you@president.ac.id"
                                    required
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
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
                                    placeholder="Enter your password"
                                    required
                                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
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
                                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                                />
                                <span className="text-sm text-gray-600">
                                    Remember me
                                </span>
                            </label>
                            <a
                                href="#"
                                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                            >
                                Forgot password?
                            </a>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-3 rounded-lg font-semibold hover:from-primary-700 hover:to-secondary-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-200"
                        >
                            {loading ? "Signing in..." : "Sign In"}
                        </button>
                    </form>

                    {/* Sign Up Link */}
                    <p className="text-center mt-6 text-gray-600">
                        Don't have an account?{" "}
                        <Link
                            to="/register"
                            className="text-primary-600 hover:text-primary-700 font-semibold"
                        >
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>

            {/* Face Verification Modal */}
            {showFaceVerification && (
                <FaceVerificationComponent
                    onVerify={handleFaceVerification}
                    onCancel={handleFaceVerificationCancel}
                    userEmail={pendingUser?.email}
                />
            )}
        </div>
    );
}