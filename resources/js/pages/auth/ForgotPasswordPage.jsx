import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, ArrowLeft, Send, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "../../hooks/use-toast";
import api from "../../lib/axios";
import StarryBackground from "../../components/StarryBackground";

export default function ForgotPasswordPage() {
    const navigate = useNavigate();
    const { toast } = useToast();

    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await api.post("/auth/forgot-password", { email });

            if (response.data.success) {
                setSuccess(true);
                toast({
                    title: "Reset Code Sent",
                    description: "Check your email for the password reset code",
                });
            }
        } catch (err) {
            const message =
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Failed to send reset code";
            setError(message);
            toast({
                variant: "destructive",
                title: "Error",
                description: message,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleContinue = () => {
        navigate("/reset-password", { state: { email } });
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
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 border-2 border-green-500 rounded-full mb-6">
                                <CheckCircle className="w-10 h-10 text-green-400" />
                            </div>
                            <h1 className="text-3xl font-bold text-white mb-2 uppercase">
                                Check Your Email
                            </h1>
                            <p className="text-gray-300 font-medium mb-6">
                                We've sent a password reset code to:
                            </p>
                            <p className="text-white font-bold text-lg mb-8 bg-white/10 py-3 px-4 border border-white/20">
                                {email}
                            </p>
                            <button
                                onClick={handleContinue}
                                className="w-full bg-white text-black py-4 rounded-none font-bold text-lg hover:bg-gray-200 border-2 border-white transition-all shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none uppercase"
                            >
                                Enter Reset Code
                            </button>
                            <p className="text-gray-400 text-sm mt-6">
                                Didn't receive the email? Check your spam folder
                                or{" "}
                                <button
                                    onClick={() => setSuccess(false)}
                                    className="text-white underline hover:no-underline"
                                >
                                    try again
                                </button>
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="text-center mb-8">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 border-2 border-white/20 rounded-full mb-4">
                                    <Mail className="w-8 h-8 text-white" />
                                </div>
                                <h1 className="text-3xl font-bold text-white mb-2 uppercase">
                                    Forgot Password?
                                </h1>
                                <p className="text-gray-300 font-medium">
                                    Enter your email to receive a reset code
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
                                <div>
                                    <label className="block text-sm font-bold text-white mb-2 uppercase">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) =>
                                                setEmail(e.target.value)
                                            }
                                            placeholder="ENTER YOUR EMAIL"
                                            required
                                            className="w-full pl-10 pr-4 py-3 border-2 border-white/20 rounded-none focus:outline-none focus:border-white focus:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] transition-all bg-white/5 text-white font-bold placeholder:text-gray-600"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-white text-black py-4 rounded-none font-bold text-lg hover:bg-gray-200 border-2 border-white transition-all shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-50 disabled:cursor-not-allowed uppercase flex items-center justify-center gap-2"
                                >
                                    <Send className="w-5 h-5" />
                                    {loading ? "Sending..." : "Send Reset Code"}
                                </button>
                            </form>
                        </>
                    )}
                </div>

                {/* Back to Login */}
                <Link
                    to="/login"
                    className="flex items-center justify-center gap-2 mt-8 text-gray-300 font-medium hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Login
                </Link>
            </div>
        </div>
    );
}
