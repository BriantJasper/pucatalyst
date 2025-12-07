import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, AlertCircle, Scan } from "lucide-react";
import { useToast } from "../../hooks/use-toast";
import api from "../../lib/axios";
import { useAuthStore } from "../../store/authStore";
import StarryBackground from "../../components/StarryBackground";
import FaceVerificationComponent from "../../components/FaceVerificationComponent";

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
    const [standaloneFaceLogin, setStandaloneFaceLogin] = useState(false);

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

    // Called when face verification succeeds - component handles the API call internally
    const handleFaceVerificationSuccess = (responseData) => {
        const { access_token, user, confidence } = responseData;

        localStorage.setItem("access_token", access_token);
        setAuth(user, access_token);

        toast({
            title: standaloneFaceLogin ? "Login Successful" : "Face Verified",
            description: confidence
                ? `Welcome back, ${
                      user.name
                  }! (Confidence: ${confidence.toFixed(1)}%)`
                : `Welcome back, ${user.name}!`,
        });

        setShowFaceVerification(false);
        setStandaloneFaceLogin(false);
        setTempToken(null);
        setPendingUser(null);

        redirectBasedOnRole(user);
    };

    const handleFaceVerificationCancel = () => {
        setShowFaceVerification(false);
        setTempToken(null);
        setPendingUser(null);
        setStandaloneFaceLogin(false);
    };

    const handleStandaloneFaceLogin = () => {
        setStandaloneFaceLogin(true);
        setShowFaceVerification(true);
        setError("");
    };

    const redirectBasedOnRole = (user) => {
        // Check if email is verified first
        if (!user.email_verified) {
            navigate("/verify-email");
            return;
        }

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
                        className="h-16 w-auto object-contain"
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
                            <Link
                                to="/forgot-password"
                                className="text-sm text-white hover:text-gray-300 hover:underline font-bold"
                            >
                                Forgot password?
                            </Link>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-white text-black py-4 rounded-none font-bold text-lg hover:bg-gray-200 border-2 border-white transition-all shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-50 disabled:cursor-not-allowed uppercase"
                        >
                            {loading ? "Signing in..." : "Sign In"}
                        </button>

                        {/* OR Divider */}
                        <div className="flex items-center gap-4 my-6">
                            <div className="flex-1 h-px bg-white/20"></div>
                            <span className="text-gray-400 text-sm font-bold uppercase">
                                Or
                            </span>
                            <div className="flex-1 h-px bg-white/20"></div>
                        </div>

                        {/* Face Login Button */}
                        <button
                            type="button"
                            onClick={handleStandaloneFaceLogin}
                            disabled={loading}
                            className="w-full bg-transparent text-white py-4 rounded-none font-bold text-lg border-2 border-white/50 hover:border-white hover:bg-white/10 transition-all shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-50 disabled:cursor-not-allowed uppercase flex items-center justify-center gap-3"
                        >
                            <Scan className="w-6 h-6" />
                            Login with Face
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

            {/* Face Verification Modal - component handles its own portal */}
            {showFaceVerification && (
                <FaceVerificationComponent
                    onVerify={handleFaceVerificationSuccess}
                    onCancel={handleFaceVerificationCancel}
                    userEmail={standaloneFaceLogin ? null : pendingUser?.email}
                    tempToken={tempToken}
                    isStandalone={standaloneFaceLogin}
                />
            )}
        </div>
    );
}
