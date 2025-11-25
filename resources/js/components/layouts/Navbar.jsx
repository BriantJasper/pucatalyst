import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Sparkles, LogOut, User } from "lucide-react";
import { useAuthStore } from "../../store/authStore";

export default function Navbar() {
    const { user, logout } = useAuthStore();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        localStorage.removeItem("access_token");
    };

    const isActive = (path) => {
        return location.pathname === path
            ? "text-primary-600 font-medium"
            : "text-gray-600 hover:text-gray-900";
    };

    return (
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center gap-8">
                        <Link to="/" className="flex items-center gap-2">
                            <Sparkles className="w-8 h-8 text-primary-600" />
                            <span className="text-xl font-bold text-gray-900">
                                PU Catalyst
                            </span>
                        </Link>
                        <div className="hidden md:flex gap-6">
                            <Link
                                to="/student/dashboard"
                                className={isActive("/student/dashboard")}
                            >
                                Dashboard
                            </Link>
                            <Link
                                to="/student/roadmap"
                                className={isActive("/student/roadmap")}
                            >
                                Roadmap
                            </Link>
                            <Link
                                to="/student/organizations"
                                className={isActive("/student/organizations")}
                            >
                                Organizations
                            </Link>
                            <Link
                                to="/student/certificates"
                                className={isActive("/student/certificates")}
                            >
                                Certificates
                            </Link>
                            <Link
                                to="/student/profile"
                                className={isActive("/student/profile")}
                            >
                                Profile
                            </Link>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">
                            Welcome, {user?.name}
                        </span>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
