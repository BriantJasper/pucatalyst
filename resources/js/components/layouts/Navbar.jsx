import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LogOut, User } from "lucide-react";
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
            ? "text-primary-foreground bg-primary px-3 py-1 font-bold border-2 border-primary"
            : "text-foreground hover:translate-y-[-2px] hover:shadow-[2px_2px_0px_0px_currentColor] px-3 py-1 font-medium border-2 border-transparent transition-all";
    };

    return (
        <nav className="bg-black/20 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center gap-8">
                        <Link to="/" className="flex items-center gap-2">
                            <img
                                src="/images/logo1.png"
                                alt="PU Catalyst Logo"
                                className="h-10 w-auto object-contain"
                            />
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
                                to="/student/courses"
                                className={isActive("/student/courses")}
                            >
                                Courses
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
                        <span className="text-sm font-bold text-foreground">
                            Welcome, {user?.name}
                        </span>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 text-foreground hover:bg-black hover:text-white px-3 py-1 border-2 border-transparent hover:border-black transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
