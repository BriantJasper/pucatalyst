import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
    ArrowLeft,
    Award,
    ExternalLink,
    Clock,
    DollarSign,
    BookOpen,
    TrendingUp,
    CheckCircle,
    XCircle,
    Filter,
} from "lucide-react";
import api from "../../lib/axios";
import Navbar from "../../components/layouts/Navbar";

export default function CertificateExplorer() {
    const fetchCertificates = async () => {
        try {
            const response = await api.get("/certificates");
            setCertificates(response.data);
        } catch (err) {
            setError("Failed to load certificates");
        }
    };
    const [certificates, setCertificates] = useState([]);
    const [error, setError] = useState(null);
    const [selectedLevel, setSelectedLevel] = useState("All");
    const [selectedProvider, setSelectedProvider] = useState("All");
    const [showFreeOnly, setShowFreeOnly] = useState(false);

    useEffect(() => {
        fetchCertificates();
    }, []);

    const levels = ["All", "Beginner", "Intermediate", "Advanced"];
    const providers = [
        "All",
        ...new Set(certificates.map((cert) => cert.provider)),
    ];

    const filteredCertificates = certificates.filter((cert) => {
        const levelMatch =
            selectedLevel === "All" || cert.difficulty_level === selectedLevel;
        const providerMatch =
            selectedProvider === "All" || cert.provider === selectedProvider;
        const freeMatch = !showFreeOnly || cert.is_free;
        return levelMatch && providerMatch && freeMatch;
    });

    const getDifficultyColor = (level) => {
        switch (level) {
            case "Beginner":
                return "bg-green-100 text-green-700";
            case "Intermediate":
                return "bg-yellow-100 text-yellow-700";
            case "Advanced":
                return "bg-red-100 text-red-700";
            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    if (error) {
        return (
            <>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-red-500 text-center">
                        <p className="text-xl font-semibold mb-2">{error}</p>
                        <button
                            onClick={fetchCertificates}
                            className="text-primary-600 hover:text-primary-700 underline"
                        >
                            Try again
                        </button>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gray-50 p-8">
                <div className="max-w-7xl mx-auto">

                    <div className="mb-12">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                            <Award className="w-10 h-10 text-primary-600" />
                            Certificate Explorer
                        </h1>
                        <p className="text-lg text-gray-600">
                            Discover professional certificates to boost your
                            career. {certificates.length} certificates
                            available.
                        </p>
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
                        <div className="flex items-center gap-2 mb-4">
                            <Filter className="w-5 h-5 text-gray-600" />
                            <h2 className="text-lg font-semibold text-gray-900">
                                Filters
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Difficulty Level */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Difficulty Level
                                </label>
                                <select
                                    value={selectedLevel}
                                    onChange={(e) =>
                                        setSelectedLevel(e.target.value)
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                >
                                    {levels.map((level) => (
                                        <option key={level} value={level}>
                                            {level}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Provider */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Provider
                                </label>
                                <select
                                    value={selectedProvider}
                                    onChange={(e) =>
                                        setSelectedProvider(e.target.value)
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                >
                                    {providers.map((provider) => (
                                        <option key={provider} value={provider}>
                                            {provider}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Free Only */}
                            <div className="flex items-end">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={showFreeOnly}
                                        onChange={(e) =>
                                            setShowFreeOnly(e.target.checked)
                                        }
                                        className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700">
                                        Show Free Only
                                    </span>
                                </label>
                            </div>
                        </div>

                        <div className="mt-4 text-sm text-gray-600">
                            Showing {filteredCertificates.length} of{" "}
                            {certificates.length} certificates
                        </div>
                    </div>

                    {/* Certificates Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {filteredCertificates.map((cert) => (
                            <div
                                key={cert.id}
                                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow group"
                            >
                                {/* Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                                            {cert.name}
                                        </h3>
                                        <p className="text-sm text-gray-600 font-medium">
                                            {cert.provider}
                                        </p>
                                    </div>
                                    <Award className="w-8 h-8 text-primary-600 flex-shrink-0" />
                                </div>

                                {/* Description */}
                                <p className="text-gray-700 mb-4 line-clamp-2">
                                    {cert.description}
                                </p>

                                {/* Badges */}
                                <div className="flex flex-wrap gap-2 mb-4">
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(
                                            cert.difficulty_level
                                        )}`}
                                    >
                                        {cert.difficulty_level}
                                    </span>
                                    {cert.is_free && (
                                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 flex items-center gap-1">
                                            <CheckCircle className="w-3 h-3" />
                                            Free Course
                                        </span>
                                    )}
                                    {cert.has_exam && (
                                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                            Exam Included
                                        </span>
                                    )}
                                </div>

                                {/* Details */}
                                <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-gray-200">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Clock className="w-4 h-4" />
                                        <span>{cert.duration_hours} hours</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <DollarSign className="w-4 h-4" />
                                        <span>
                                            {cert.is_free
                                                ? "Free"
                                                : `$${cert.cost}`}
                                        </span>
                                    </div>
                                </div>

                                {/* Skills */}
                                {cert.skills_covered &&
                                    cert.skills_covered.length > 0 && (
                                        <div className="mb-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <BookOpen className="w-4 h-4 text-gray-600" />
                                                <span className="text-sm font-medium text-gray-700">
                                                    Skills Covered:
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap gap-1">
                                                {cert.skills_covered
                                                    .slice(0, 4)
                                                    .map((skill, idx) => (
                                                        <span
                                                            key={idx}
                                                            className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                                                        >
                                                            {skill}
                                                        </span>
                                                    ))}
                                                {cert.skills_covered.length >
                                                    4 && (
                                                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                                        +
                                                        {cert.skills_covered
                                                            .length - 4}{" "}
                                                        more
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                {/* Career Paths */}
                                {cert.career_paths &&
                                    cert.career_paths.length > 0 && (
                                        <div className="mb-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <TrendingUp className="w-4 h-4 text-gray-600" />
                                                <span className="text-sm font-medium text-gray-700">
                                                    Career Paths:
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap gap-1">
                                                {cert.career_paths.map(
                                                    (path, idx) => (
                                                        <span
                                                            key={idx}
                                                            className="px-2 py-1 bg-primary-50 text-primary-700 rounded text-xs font-medium"
                                                        >
                                                            {path}
                                                        </span>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    )}

                                {/* Learn More Button */}
                                {cert.url && (
                                    <a
                                        href={cert.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium text-sm group-hover:gap-3 transition-all"
                                    >
                                        Learn More
                                        <ExternalLink className="w-4 h-4" />
                                    </a>
                                )}
                            </div>
                        ))}
                    </div>

                    {filteredCertificates.length === 0 && (
                        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                            <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                No certificates found
                            </h3>
                            <p className="text-gray-600 mb-4">
                                Try adjusting your filters to see more results.
                            </p>
                            <button
                                onClick={() => {
                                    setSelectedLevel("All");
                                    setSelectedProvider("All");
                                    setShowFreeOnly(false);
                                }}
                                className="text-primary-600 hover:text-primary-700 font-medium"
                            >
                                Reset Filters
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
