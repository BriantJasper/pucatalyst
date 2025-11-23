import React from "react";
import { Link } from "react-router-dom";
import {
    LayoutDashboard,
    Target,
    BookOpen,
    Award,
    Users,
    TrendingUp,
    CheckCircle,
    Clock,
    ArrowRight,
    Sparkles,
    LogOut,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import Navbar from "../../components/layouts/Navbar";

export default function StudentDashboard() {
    const { user, logout } = useAuthStore();

    const handleLogout = () => {
        logout();
        localStorage.removeItem("access_token");
    };

    const quickStats = [
        {
            label: "Roadmap Progress",
            value: "65%",
            icon: <Target className="w-6 h-6" />,
            color: "primary",
        },
        {
            label: "Skills Acquired",
            value: "12/20",
            icon: <TrendingUp className="w-6 h-6" />,
            color: "secondary",
        },
        {
            label: "Certificates",
            value: "3",
            icon: <Award className="w-6 h-6" />,
            color: "green",
        },
        {
            label: "Organizations",
            value: "2",
            icon: <Users className="w-6 h-6" />,
            color: "purple",
        },
    ];

    const recentActivities = [
        {
            title: "Completed Google UX Design Certificate",
            time: "2 days ago",
            type: "certificate",
        },
        {
            title: "Joined AI Research Club",
            time: "1 week ago",
            type: "organization",
        },
        {
            title: "Updated roadmap goals",
            time: "2 weeks ago",
            type: "roadmap",
        },
    ];

    const recommendations = [
        {
            title: "Take Data Structures Course",
            description:
                "90% of Software Engineers in our database took this course",
            action: "View Course",
            link: "/student/courses",
        },
        {
            title: "Join GDSC Organization",
            description: "Highly recommended for your career path",
            action: "Explore",
            link: "/student/organizations",
        },
        {
            title: "AWS Cloud Practitioner Certification",
            description: "Next step in your learning journey",
            action: "View Details",
            link: "/student/certificates",
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navbar */}
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Welcome back, {user?.name}! 👋
                    </h1>
                    <p className="text-gray-600">
                        Here's your progress overview
                    </p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {quickStats.map((stat, index) => (
                        <div
                            key={index}
                            className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div
                                    className={`p-3 rounded-lg bg-${stat.color}-100 text-${stat.color}-600`}
                                >
                                    {stat.icon}
                                </div>
                            </div>
                            <div className="text-2xl font-bold text-gray-900 mb-1">
                                {stat.value}
                            </div>
                            <div className="text-sm text-gray-600">
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* AI Recommendations */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <div className="flex items-center gap-2 mb-6">
                                <Sparkles className="w-6 h-6 text-primary-600" />
                                <h2 className="text-xl font-bold text-gray-900">
                                    AI Recommendations
                                </h2>
                            </div>
                            <div className="space-y-4">
                                {recommendations.map((rec, index) => (
                                    <div
                                        key={index}
                                        className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition"
                                    >
                                        <h3 className="font-semibold text-gray-900 mb-2">
                                            {rec.title}
                                        </h3>
                                        <p className="text-sm text-gray-600 mb-3">
                                            {rec.description}
                                        </p>
                                        <Link
                                            to={rec.link}
                                            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 text-sm font-medium"
                                        >
                                            {rec.action}
                                            <ArrowRight className="w-4 h-4" />
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">
                                Recent Activity
                            </h2>
                            <div className="space-y-4">
                                {recentActivities.map((activity, index) => (
                                    <div
                                        key={index}
                                        className="flex items-start gap-4"
                                    >
                                        <div className="w-2 h-2 rounded-full bg-primary-600 mt-2"></div>
                                        <div className="flex-1">
                                            <p className="text-gray-900 font-medium">
                                                {activity.title}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {activity.time}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Weekly Task */}
                        <div className="bg-gradient-to-br from-primary-600 to-secondary-600 text-white rounded-xl p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Target className="w-6 h-6" />
                                <h3 className="font-bold text-lg">
                                    This Week's Goal
                                </h3>
                            </div>
                            <p className="text-white/90 mb-4">
                                Complete React Fundamentals course
                            </p>
                            <div className="bg-white/20 rounded-full h-2 mb-2">
                                <div className="bg-white rounded-full h-2 w-3/4"></div>
                            </div>
                            <p className="text-sm text-white/80">
                                75% completed
                            </p>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <h3 className="font-bold text-gray-900 mb-4">
                                Quick Actions
                            </h3>
                            <div className="space-y-3">
                                <Link
                                    to="/student/roadmap"
                                    className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition"
                                >
                                    <Target className="w-5 h-5 text-primary-600" />
                                    <span className="text-gray-700">
                                        View Full Roadmap
                                    </span>
                                </Link>
                                <Link
                                    to="/student/skill-gap"
                                    className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition"
                                >
                                    <TrendingUp className="w-5 h-5 text-primary-600" />
                                    <span className="text-gray-700">
                                        Skill Gap Analysis
                                    </span>
                                </Link>
                                <Link
                                    to="/student/mentors"
                                    className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition"
                                >
                                    <Users className="w-5 h-5 text-primary-600" />
                                    <span className="text-gray-700">
                                        Find a Mentor
                                    </span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
