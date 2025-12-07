import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
    Lock,
    Eye,
    EyeOff,
    KeyRound,
    CheckCircle,
    AlertCircle,
    ArrowLeft,
} from "lucide-react";
import { useToast } from "../../hooks/use-toast";
import api from "../../lib/axios";
import StarryBackground from "../../components/StarryBackground";

export default function ResetPasswordPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { toast } = useToast();

    const [email, setEmail] = useState(location.state?.email || "");
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const inputRefs = useRef([]);

    const handleOtpChange = (index, value) => {
        if (value && !/^\d$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        setError("");

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === "Backspace") {
            if (!otp[index] && index > 0) {
                inputRefs.current[index - 1]?.focus();
            }
        }
        if (e.key === "ArrowLeft" && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
        if (e.key === "ArrowRight" && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").slice(0, 6);
        if (/^\d+$/.test(pastedData)) {
            const newOtp = [...otp];
            pastedData.split("").forEach((digit, index) => {
                if (index < 6) newOtp[index] = digit;
            });
            setOtp(newOtp);
        }
    };

    const getPasswordStrength = () => {
        if (!password) return { strength: 0, label: "", color: "" };

        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^a-zA-Z0-9]/.test(password)) strength++;

        const levels = [
            { strength: 1, label: "Very Weak", color: "bg-red-500" },
            { strength: 2, label: "Weak", color: "bg-orange-500" },
            { strength: 3, label: "Fair", color: "bg-yellow-500" },
            { strength: 4, label: "Strong", color: "bg-lime-500" },
            { strength: 5, label: "Very Strong", color: "bg-green-500" },
        ];

        return (
            levels[Math.min(strength, 5) - 1] || {
                strength: 0,
                label: "",
                color: "",
            }
        );
    };

    const passwordStrength = getPasswordStrength();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        const otpString = otp.join("");
        if (otpString.length !== 6) {
            setError("Please enter the 6-digit reset code");
            return;
        }

        if (password.length < 8) {
            setError("Password must be at least 8 characters");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);

        try {
            const response = await api.post("/auth/reset-password", {
                email,
                otp: otpString,
                password,
                password_confirmation: confirmPassword,
            });

            if (response.data.success) {
                setSuccess(true);
                toast({
                    title: "Password Reset!",
                    description: "Your password has been reset successfully",
                });
            }
        } catch (err) {
            const message =
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Password reset failed";
            setError(message);
            toast({
                variant: "destructive",
                title: "Reset Failed",
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
                    {success ? (
                        <div className="text-center py-8">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 border-2 border-green-500 rounded-full mb-6">
                                <CheckCircle className="w-10 h-10 text-green-400" />
                            </div>
                            <h1 className="text-3xl font-bold text-white mb-2 uppercase">
                                Password Reset!
                            </h1>
                            <p className="text-gray-300 font-medium mb-8">
                                Your password has been reset successfully
                            </p>
                            <Link
                                to="/login"
                                className="inline-block w-full bg-white text-black py-4 rounded-none font-bold text-lg hover:bg-gray-200 border-2 border-white transition-all shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none uppercase text-center"
                            >
                                Sign In Now
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="text-center mb-8">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 border-2 border-white/20 rounded-full mb-4">
                                    <KeyRound className="w-8 h-8 text-white" />
                                </div>
                                <h1 className="text-3xl font-bold text-white mb-2 uppercase">
                                    Reset Password
                                </h1>
                                <p className="text-gray-300 font-medium">
                                    Enter your reset code and new password
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

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Email (if not coming from forgot password) */}
                                {!location.state?.email && (
                                    <div>
                                        <label className="block text-sm font-bold text-white mb-2 uppercase">
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) =>
                                                setEmail(e.target.value)
                                            }
                                            placeholder="ENTER YOUR EMAIL"
                                            required
                                            className="w-full px-4 py-3 border-2 border-white/20 rounded-none focus:outline-none focus:border-white focus:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] transition-all bg-white/5 text-white font-bold placeholder:text-gray-600"
                                        />
                                    </div>
                                )}

                                {/* Reset Code */}
                                <div>
                                    <label className="block text-sm font-bold text-white mb-2 uppercase">
                                        Reset Code
                                    </label>
                                    <div
                                        className="flex justify-between gap-2"
                                        onPaste={handlePaste}
                                    >
                                        {otp.map((digit, index) => (
                                            <input
                                                key={index}
                                                ref={(el) =>
                                                    (inputRefs.current[index] =
                                                        el)
                                                }
                                                type="text"
                                                inputMode="numeric"
                                                maxLength={1}
                                                value={digit}
                                                onChange={(e) =>
                                                    handleOtpChange(
                                                        index,
                                                        e.target.value
                                                    )
                                                }
                                                onKeyDown={(e) =>
                                                    handleKeyDown(index, e)
                                                }
                                                disabled={loading}
                                                className="w-11 h-12 text-center text-xl font-bold border-2 border-white/20 rounded-none focus:outline-none focus:border-white focus:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.2)] transition-all bg-white/5 text-white disabled:opacity-50"
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* New Password */}
                                <div>
                                    <label className="block text-sm font-bold text-white mb-2 uppercase">
                                        New Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type={
                                                showPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            value={password}
                                            onChange={(e) =>
                                                setPassword(e.target.value)
                                            }
                                            placeholder="ENTER NEW PASSWORD"
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
                                    {/* Password Strength */}
                                    {password && (
                                        <div className="mt-2">
                                            <div className="flex gap-1 mb-1">
                                                {[1, 2, 3, 4, 5].map(
                                                    (level) => (
                                                        <div
                                                            key={level}
                                                            className={`h-1 flex-1 ${
                                                                level <=
                                                                passwordStrength.strength
                                                                    ? passwordStrength.color
                                                                    : "bg-white/10"
                                                            }`}
                                                        />
                                                    )
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-400">
                                                Password Strength:{" "}
                                                <span className="font-bold">
                                                    {passwordStrength.label}
                                                </span>
                                            </p>
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
                                            value={confirmPassword}
                                            onChange={(e) =>
                                                setConfirmPassword(
                                                    e.target.value
                                                )
                                            }
                                            placeholder="CONFIRM NEW PASSWORD"
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
                                    {confirmPassword &&
                                        password !== confirmPassword && (
                                            <p className="text-red-400 text-xs mt-1 font-bold">
                                                Passwords do not match
                                            </p>
                                        )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={
                                        loading ||
                                        !email ||
                                        otp.some((d) => !d) ||
                                        !password ||
                                        password !== confirmPassword
                                    }
                                    className="w-full bg-white text-black py-4 rounded-none font-bold text-lg hover:bg-gray-200 border-2 border-white transition-all shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-50 disabled:cursor-not-allowed uppercase"
                                >
                                    {loading
                                        ? "Resetting..."
                                        : "Reset Password"}
                                </button>
                            </form>
                        </>
                    )}
                </div>

                {/* Back to Forgot Password */}
                <Link
                    to="/forgot-password"
                    className="flex items-center justify-center gap-2 mt-8 text-gray-300 font-medium hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Request New Code
                </Link>
            </div>
        </div>
    );
}
