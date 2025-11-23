import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "../../store/authStore";

export default function OAuthCallback() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const setAuth = useAuthStore((state) => state.setAuth);
    const [error, setError] = useState("");

    useEffect(() => {
        const handleCallback = () => {
            try {
                // Check for error from backend
                const errorParam = searchParams.get("error");
                if (errorParam) {
                    setError(errorParam);
                    toast.error(errorParam);
                    setTimeout(() => navigate("/login"), 2000);
                    return;
                }

                // Get token and user from URL parameters
                const token = searchParams.get("token");
                const userJson = searchParams.get("user");

                if (!token || !userJson) {
                    throw new Error("Missing authentication data");
                }

                const user = JSON.parse(userJson);

                // Store token and user
                localStorage.setItem("access_token", token);
                setAuth(user, token);

                toast.success(`Welcome, ${user.name}!`);

                // Redirect based on role
                if (user.role === "student") {
                    navigate("/student/dashboard");
                } else if (user.role === "alumni") {
                    navigate("/alumni/dashboard");
                } else if (user.role === "admin") {
                    navigate("/admin/dashboard");
                } else {
                    navigate("/");
                }
            } catch (err) {
                const message = err.message || "OAuth authentication failed";
                setError(message);
                toast.error(message);

                // Redirect to login after 2 seconds
                setTimeout(() => navigate("/login"), 2000);
            }
        };

        handleCallback();
    }, [navigate, setAuth, searchParams]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4">
            <div className="text-center">
                {!error ? (
                    <>
                        <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">
                            Completing sign in...
                        </h2>
                        <p className="text-gray-600">
                            Please wait while we authenticate your account
                        </p>
                    </>
                ) : (
                    <>
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">⚠️</span>
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">
                            Authentication Failed
                        </h2>
                        <p className="text-gray-600 mb-4">{error}</p>
                        <p className="text-sm text-gray-500">
                            Redirecting to login...
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}
