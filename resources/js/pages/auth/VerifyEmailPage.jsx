import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Mail,
    KeyRound,
    RefreshCw,
    CheckCircle,
    AlertCircle,
    Edit2,
    X,
} from "lucide-react";
import { useToast } from "../../hooks/use-toast";
import api from "../../lib/axios";
import { useAuthStore } from "../../store/authStore";
import StarryBackground from "../../components/StarryBackground";

export default function VerifyEmailPage() {
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);
    const updateUser = useAuthStore((state) => state.updateUser);
    const { toast } = useToast();

    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    // Change email state
    const [showChangeEmail, setShowChangeEmail] = useState(false);
    const [newEmail, setNewEmail] = useState("");
    const [changeEmailLoading, setChangeEmailLoading] = useState(false);
    const [changeEmailError, setChangeEmailError] = useState("");

    const inputRefs = useRef([]);

    // Initialize with sending OTP on mount
    useEffect(() => {
        sendOtp();
    }, []);

    // Cooldown timer
    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(
                () => setResendCooldown(resendCooldown - 1),
                1000
            );
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    // Auto-submit when all digits are filled
    useEffect(() => {
        if (otp.every((digit) => digit !== "") && !loading) {
            handleVerify();
        }
    }, [otp]);

    const sendOtp = async () => {
        try {
            setResendLoading(true);
            await api.post("/auth/send-verification-otp");
            toast({
                title: "OTP Sent",
                description: "A verification code has been sent to your email",
            });
            setResendCooldown(60);
        } catch (err) {
            const message =
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Failed to send OTP";
            if (!message.includes("already verified")) {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: message,
                });
            } else {
                // Already verified, redirect to dashboard
                navigate("/student/dashboard");
            }
        } finally {
            setResendLoading(false);
        }
    };

    const handleOtpChange = (index, value) => {
        // Only allow digits
        if (value && !/^\d$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        setError("");

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        // Handle backspace
        if (e.key === "Backspace") {
            if (!otp[index] && index > 0) {
                inputRefs.current[index - 1]?.focus();
            }
        }
        // Handle arrow keys
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

    const handleVerify = async () => {
        const otpString = otp.join("");
        if (otpString.length !== 6) {
            setError("Please enter all 6 digits");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const response = await api.post("/auth/verify-otp", {
                otp: otpString,
            });

            if (response.data.success) {
                setSuccess(true);

                // Update user in auth store to reflect verified status
                if (user) {
                    updateUser({ ...user, email_verified: true });
                }

                toast({
                    title: "Email Verified!",
                    description: "Your email has been verified successfully",
                });

                // Redirect to dashboard after a brief delay
                setTimeout(() => {
                    navigate("/student/dashboard");
                }, 1500);
            }
        } catch (err) {
            const message =
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Verification failed";
            setError(message);
            setOtp(["", "", "", "", "", ""]);
            inputRefs.current[0]?.focus();
            toast({
                variant: "destructive",
                title: "Verification Failed",
                description: message,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (resendCooldown > 0) return;
        setOtp(["", "", "", "", "", ""]);
        setError("");
        await sendOtp();
        inputRefs.current[0]?.focus();
    };

    const handleChangeEmail = async (e) => {
        e.preventDefault();

        if (!newEmail || !newEmail.includes("@")) {
            setChangeEmailError("Please enter a valid email address");
            return;
        }

        setChangeEmailLoading(true);
        setChangeEmailError("");

        try {
            const response = await api.post("/auth/update-email", {
                email: newEmail,
            });

            if (response.data.success) {
                // Update user in auth store
                if (response.data.user) {
                    updateUser(response.data.user);
                }

                toast({
                    title: "Email Updated",
                    description:
                        "A new verification code has been sent to your new email",
                });

                setShowChangeEmail(false);
                setNewEmail("");
                setResendCooldown(60);
                setOtp(["", "", "", "", "", ""]);
                inputRefs.current[0]?.focus();
            }
        } catch (err) {
            const message =
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Failed to update email";
            setChangeEmailError(message);
        } finally {
            setChangeEmailLoading(false);
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
                                Verified!
                            </h1>
                            <p className="text-gray-300 font-medium">
                                Your email has been verified successfully
                            </p>
                            <p className="text-gray-400 text-sm mt-4">
                                Redirecting to dashboard...
                            </p>
                        </div>
                    ) : showChangeEmail ? (
                        /* Change Email Form */
                        <div>
                            <div className="text-center mb-6">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 border-2 border-white/20 rounded-full mb-4">
                                    <Edit2 className="w-8 h-8 text-white" />
                                </div>
                                <h1 className="text-2xl font-bold text-white mb-2 uppercase">
                                    Change Email
                                </h1>
                                <p className="text-gray-300 text-sm">
                                    Enter your new email address
                                </p>
                            </div>

                            {changeEmailError && (
                                <div className="mb-4 p-3 bg-red-500/20 border-2 border-red-500 flex gap-2">
                                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                                    <p className="text-white text-sm font-bold">
                                        {changeEmailError}
                                    </p>
                                </div>
                            )}

                            <form
                                onSubmit={handleChangeEmail}
                                className="space-y-4"
                            >
                                <div>
                                    <label className="block text-sm font-bold text-white mb-2 uppercase">
                                        New Email Address
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="email"
                                            value={newEmail}
                                            onChange={(e) =>
                                                setNewEmail(e.target.value)
                                            }
                                            placeholder="Enter new email"
                                            className="w-full pl-10 pr-4 py-3 border-2 border-white/20 rounded-none focus:outline-none focus:border-white transition-all bg-white/5 text-white font-bold placeholder:text-gray-600"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={changeEmailLoading}
                                    className="w-full bg-white text-black py-3 rounded-none font-bold hover:bg-gray-200 border-2 border-white transition-all shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-50 disabled:cursor-not-allowed uppercase"
                                >
                                    {changeEmailLoading
                                        ? "Updating..."
                                        : "Update Email"}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowChangeEmail(false);
                                        setNewEmail("");
                                        setChangeEmailError("");
                                    }}
                                    className="w-full text-gray-400 py-2 font-bold hover:text-white transition-colors uppercase text-sm flex items-center justify-center gap-2"
                                >
                                    <X className="w-4 h-4" />
                                    Cancel
                                </button>
                            </form>
                        </div>
                    ) : (
                        <>
                            <div className="text-center mb-8">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 border-2 border-white/20 rounded-full mb-4">
                                    <Mail className="w-8 h-8 text-white" />
                                </div>
                                <h1 className="text-3xl font-bold text-white mb-2 uppercase">
                                    Verify Email
                                </h1>
                                <p className="text-gray-300 font-medium">
                                    Enter the 6-digit code sent to your email
                                </p>
                                {user?.email && (
                                    <div className="mt-2 flex items-center justify-center gap-2">
                                        <p className="text-gray-400 text-sm">
                                            {user.email}
                                        </p>
                                        <button
                                            onClick={() =>
                                                setShowChangeEmail(true)
                                            }
                                            className="text-white/70 hover:text-white transition-colors"
                                            title="Change email"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
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

                            {/* OTP Input */}
                            <div
                                className="flex justify-center gap-3 mb-8"
                                onPaste={handlePaste}
                            >
                                {otp.map((digit, index) => (
                                    <input
                                        key={index}
                                        ref={(el) =>
                                            (inputRefs.current[index] = el)
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
                                        className="w-12 h-14 text-center text-2xl font-bold border-2 border-white/20 rounded-none focus:outline-none focus:border-white focus:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] transition-all bg-white/5 text-white disabled:opacity-50"
                                    />
                                ))}
                            </div>

                            {/* Verify Button */}
                            <button
                                onClick={handleVerify}
                                disabled={loading || otp.some((d) => !d)}
                                className="w-full bg-white text-black py-4 rounded-none font-bold text-lg hover:bg-gray-200 border-2 border-white transition-all shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-50 disabled:cursor-not-allowed uppercase"
                            >
                                {loading ? "Verifying..." : "Verify Email"}
                            </button>

                            {/* Resend OTP */}
                            <div className="mt-6 text-center">
                                <p className="text-gray-400 text-sm mb-2">
                                    Didn't receive the code?
                                </p>
                                <button
                                    onClick={handleResend}
                                    disabled={
                                        resendCooldown > 0 || resendLoading
                                    }
                                    className="inline-flex items-center gap-2 text-white font-bold hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <RefreshCw
                                        className={`w-4 h-4 ${
                                            resendLoading ? "animate-spin" : ""
                                        }`}
                                    />
                                    {resendCooldown > 0
                                        ? `Resend in ${resendCooldown}s`
                                        : resendLoading
                                        ? "Sending..."
                                        : "Resend Code"}
                                </button>
                            </div>
                        </>
                    )}
                </div>

                {/* Back to Login */}
                <p className="text-center mt-8 text-gray-300 font-medium">
                    <Link
                        to="/login"
                        className="text-white font-bold underline hover:bg-white hover:text-black transition-colors px-1"
                    >
                        Back to Login
                    </Link>
                </p>
            </div>
        </div>
    );
}
