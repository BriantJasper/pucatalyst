import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useToast } from "../../hooks/use-toast";
import api from "../../lib/axios";
import StarryBackground from "../../components/StarryBackground";

export default function RegisterPage() {
    const navigate = useNavigate();
    const { toast } = useToast();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        student_id: "",
        password: "",
        password_confirmation: "",
        role: "student", // student, alumni
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showFaceCapture, setShowFaceCapture] = useState(false);
    const [faceImages, setFaceImages] = useState(null);
    const [enableFaceAuth, setEnableFaceAuth] = useState(false);

    // Password strength calculation
    const passwordStrength = useMemo(() => {
        const password = formData.password;
        if (!password) return { score: 0, label: "", color: "" };

        let score = 0;

        // Length check
        if (password.length >= 8) score++;
        if (password.length >= 12) score++;

        // Character variety checks
        if (/[a-z]/.test(password)) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;

        // Determine strength level
        if (score <= 2)
            return { score: 25, label: "Weak", color: "bg-red-500" };
        if (score <= 4)
            return { score: 50, label: "Fair", color: "bg-orange-500" };
        if (score <= 5)
            return { score: 75, label: "Good", color: "bg-yellow-500" };
        return { score: 100, label: "Strong", color: "bg-green-500" };
    }, [formData.password]);

    // Email validation
    const isValidEmail = (email) => {
        const allowedDomains = ["@president.ac.id", "@student.president.ac.id"];
        return allowedDomains.some((domain) =>
            email.toLowerCase().endsWith(domain)
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        // Validate email domain
        if (!isValidEmail(formData.email)) {
            setError(
                "Please use a valid President University email (@president.ac.id or @student.president.ac.id)"
            );
            return;
        }

        if (formData.password !== formData.password_confirmation) {
            setError("Passwords do not match");
            return;
        }

        // If face auth is enabled, show face capture modal
        if (enableFaceAuth) {
            setShowFaceCapture(true);
        } else {
            // Register without face authentication
            registerWithoutFace();
        }
    };

    const handleFaceCaptureComplete = async (capturedImages) => {
        setShowFaceCapture(false);
        setFaceImages(capturedImages);
        setLoading(true);

        try {
            const registrationData = {
                ...formData,
                face_images: capturedImages,
            };

            const response = await api.post("/auth/register", registrationData);

            if (response.data.face_auth_enabled) {
                toast({
                    title: "Registration Successful",
                    description:
                        "Registration successful with face authentication enabled!",
                });
            } else {
                toast({
                    title: "Registration Successful",
                    description:
                        "Registration successful! Face authentication will be set up later.",
                });
            }

            navigate("/login");
        } catch (err) {
            const message =
                err.response?.data?.message ||
                "Registration failed. Please try again.";
            setError(message);
            toast({
                variant: "destructive",
                title: "Registration Failed",
                description: message,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleFaceCaptureCancel = () => {
        setShowFaceCapture(false);
        toast({
            description:
                "You can set up face authentication later from your profile.",
        });
        // Register without face authentication
        registerWithoutFace();
    };

    const registerWithoutFace = async () => {
        setLoading(true);

        try {
            await api.post("/auth/register", formData);
            toast({
                title: "Registration Successful",
                description: "Registration successful! Please login.",
            });
            navigate("/login");
        } catch (err) {
            const message =
                err.response?.data?.message ||
                "Registration failed. Please try again.";
            setError(message);
            toast({
                variant: "destructive",
                title: "Registration Failed",
                description: message,
            });
        } finally {
            setLoading(false);
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
                            Create Account
                        </h1>
                        <p className="text-gray-300 font-medium">
                            Start your journey to success
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
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Role Selection */}
                        <div>
                            <label className="block text-sm font-bold text-white mb-2 uppercase">
                                I am a...
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setFormData({
                                            ...formData,
                                            role: "student",
                                        })
                                    }
                                    className={`p-4 border-2 transition-all shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] ${
                                        formData.role === "student"
                                            ? "border-white bg-white text-black"
                                            : "border-white/20 bg-white/5 text-white hover:bg-white/10"
                                    }`}
                                >
                                    <div className="font-bold uppercase">
                                        Student
                                    </div>
                                    <div
                                        className={`text-xs ${
                                            formData.role === "student"
                                                ? "text-gray-600"
                                                : "text-gray-400"
                                        }`}
                                    >
                                        Get roadmap
                                    </div>
                                </button>
                                <button
                                    type="button"
                                    onClick={() =>
                                        setFormData({
                                            ...formData,
                                            role: "alumni",
                                        })
                                    }
                                    className={`p-4 border-2 transition-all shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] ${
                                        formData.role === "alumni"
                                            ? "border-white bg-white text-black"
                                            : "border-white/20 bg-white/5 text-white hover:bg-white/10"
                                    }`}
                                >
                                    <div className="font-bold uppercase">
                                        Alumni
                                    </div>
                                    <div
                                        className={`text-xs ${
                                            formData.role === "alumni"
                                                ? "text-gray-600"
                                                : "text-gray-400"
                                        }`}
                                    >
                                        Share journey
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* Name */}
                        <div>
                            <label className="block text-sm font-bold text-white mb-2 uppercase">
                                Full Name
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            name: e.target.value,
                                        })
                                    }
                                    placeholder="REYNER"
                                    required
                                    className="w-full pl-10 pr-4 py-3 border-2 border-white/20 rounded-none focus:outline-none focus:border-white focus:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] transition-all bg-white/5 text-white font-bold placeholder:text-gray-600"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-bold text-white mb-2 uppercase">
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
                                    placeholder="YOU@PRESIDENT.AC.ID"
                                    required
                                    className="w-full pl-10 pr-4 py-3 border-2 border-white/20 rounded-none focus:outline-none focus:border-white focus:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] transition-all bg-white/5 text-white font-bold placeholder:text-gray-600"
                                />
                            </div>
                            <p className="mt-1 text-xs text-gray-400 font-medium">
                                Use your President University email
                                (@president.ac.id or @student.president.ac.id)
                            </p>
                        </div>

                        {/* Student ID */}
                        <div>
                            <label className="block text-sm font-bold text-white mb-2 uppercase">
                                Student ID
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={formData.student_id}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            student_id: e.target.value,
                                        })
                                    }
                                    placeholder="E.G., 002202200123"
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
                                    placeholder="MINIMUM 8 CHARACTERS"
                                    required
                                    minLength={8}
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

                            {/* Password Strength Indicator */}
                            {formData.password && (
                                <div className="mt-2 text-xs font-bold">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-white uppercase">
                                            Strength:
                                        </span>
                                        <span
                                            className={`${
                                                passwordStrength.label ===
                                                "Weak"
                                                    ? "text-red-400"
                                                    : passwordStrength.label ===
                                                      "Fair"
                                                    ? "text-orange-400"
                                                    : passwordStrength.label ===
                                                      "Good"
                                                    ? "text-yellow-400"
                                                    : "text-green-400"
                                            } uppercase`}
                                        >
                                            {passwordStrength.label}
                                        </span>
                                    </div>
                                    <div className="w-full bg-white/20 h-2 border border-white/30">
                                        <div
                                            className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                                            style={{
                                                width: `${passwordStrength.score}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-bold text-white mb-2 uppercase">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type={
                                        showConfirmPassword
                                            ? "text"
                                            : "password"
                                    }
                                    value={formData.password_confirmation}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            password_confirmation:
                                                e.target.value,
                                        })
                                    }
                                    placeholder="RE-ENTER PASSWORD"
                                    required
                                    className="w-full pl-10 pr-12 py-3 border-2 border-white/20 rounded-none focus:outline-none focus:border-white focus:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] transition-all bg-white/5 text-white font-bold placeholder:text-gray-600"
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowConfirmPassword(
                                            !showConfirmPassword
                                        )
                                    }
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Terms */}
                        <label className="flex items-start gap-2 cursor-pointer mt-4">
                            <input
                                type="checkbox"
                                required
                                className="mt-1 w-4 h-4 text-white border-2 border-white/50 rounded-none focus:ring-0 focus:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.4)] bg-transparent"
                            />
                            <span className="text-sm text-gray-300 font-medium">
                                I agree to the{" "}
                                <a
                                    href="#"
                                    className="text-white font-bold hover:underline"
                                >
                                    Terms of Service
                                </a>{" "}
                                and{" "}
                                <a
                                    href="#"
                                    className="text-white font-bold hover:underline"
                                >
                                    Privacy Policy
                                </a>
                            </span>
                        </label>

                        {/* Face Authentication Toggle */}
                        <div className="pt-4 border-t-2 border-white/20">
                            <label className="flex items-start gap-3 cursor-pointer group">
                                <div className="relative inline-flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={enableFaceAuth}
                                        onChange={(e) =>
                                            setEnableFaceAuth(e.target.checked)
                                        }
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-white/20 peer-focus:outline-none border-2 border-white/50 rounded-none peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full after:content-[''] after:absolute after:top-[4px] after:start-[4px] after:bg-white after:border-2 after:border-black after:rounded-none after:h-4 after:w-4 after:transition-all peer-checked:bg-white peer-checked:after:bg-black peer-checked:after:border-transparent"></div>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold text-white uppercase">
                                            Enable Face Authentication
                                        </span>
                                        <span className="text-xs px-2 py-0.5 bg-white text-black font-bold border border-white uppercase">
                                            Optional
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1 font-medium">
                                        {enableFaceAuth
                                            ? "You will capture 5-7 face images after registration"
                                            : "You can enable this later from your profile settings"}
                                    </p>
                                </div>
                            </label>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-white text-black py-4 rounded-none font-bold text-lg hover:bg-gray-200 border-2 border-white transition-all shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-50 disabled:cursor-not-allowed uppercase mt-6"
                        >
                            {loading ? "Creating account..." : "Create Account"}
                        </button>
                    </form>

                    {/* Sign In Link */}
                    <p className="text-center mt-8 text-gray-300 font-medium">
                        Already have an account?{" "}
                        <Link
                            to="/login"
                            className="text-white font-bold underline hover:bg-white hover:text-black transition-colors px-1"
                        >
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>

            {/* Face Capture Modal */}
            {showFaceCapture && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-xl">
                        <FaceCaptureComponent
                            onComplete={handleFaceCaptureComplete}
                            onCancel={handleFaceCaptureCancel}
                            minImages={5}
                            maxImages={7}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
