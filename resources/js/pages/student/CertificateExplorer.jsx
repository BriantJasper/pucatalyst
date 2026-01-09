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
    Plus,
    Loader2,
} from "lucide-react";
import api from "../../lib/axios";
import Navbar from "../../components/layouts/Navbar";
import Footer from "../../components/layouts/Footer";
import StarryBackground from "../../components/StarryBackground";
import { useToast } from "@/components/ui/use-toast";
import {
    PageHeaderSkeleton,
    FilterSkeleton,
    CardSkeleton,
} from "@/components/ui/skeletons";

export default function CertificateExplorer() {
    const { toast } = useToast();
    const [savingCert, setSavingCert] = useState(null);
    const [savedCerts, setSavedCerts] = useState(new Set());
    const [certificates, setCertificates] = useState([]);
    const [error, setError] = useState(null);
    const [selectedLevel, setSelectedLevel] = useState("All");
    const [selectedProvider, setSelectedProvider] = useState("All");
    const [showFreeOnly, setShowFreeOnly] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchCertificates = async () => {
        try {
            const response = await api.get("/certificates");
            setCertificates(response.data);
            return response.data;
        } catch (err) {
            setError("Failed to load certificates");
            return [];
        }
    };

    const fetchRoadmapCerts = async (allCerts) => {
        try {
            const response = await api.get("/roadmaps/current");
            const roadmap = response.data;

            if (roadmap && roadmap.certificates_to_earn) {
                // Get certificate names from roadmap
                const roadmapCertNames = roadmap.certificates_to_earn.map(
                    (cert) =>
                        typeof cert === "string" ? cert : cert.name || cert[0]
                );

                // Find matching certificate IDs
                const savedIds = new Set();
                allCerts.forEach((cert) => {
                    if (roadmapCertNames.includes(cert.name)) {
                        savedIds.add(cert.id);
                    }
                });

                setSavedCerts(savedIds);
            }
        } catch (err) {
            // User might not have a roadmap yet, ignore error
            console.log("No existing roadmap found");
        }
    };

    const handleSaveToRoadmap = async (cert) => {
        setSavingCert(cert.id);
        try {
            await api.post("/roadmaps/items", {
                type: "certification",
                value: cert.name,
            });

            setSavedCerts((prev) => new Set([...prev, cert.id]));

            toast({
                title: "Certificate Added",
                description: `${cert.name} has been added to your roadmap!`,
            });
        } catch (error) {
            console.error("Failed to save certificate:", error);
            toast({
                variant: "destructive",
                title: "Failed to Save",
                description:
                    error.response?.data?.error ||
                    "Could not add certificate to roadmap.",
            });
        } finally {
            setSavingCert(null);
        }
    };

    useEffect(() => {
        const initializeData = async () => {
            const certs = await fetchCertificates();
            if (certs.length > 0) {
                await fetchRoadmapCerts(certs);
            }
            setLoading(false);
        };
        initializeData();
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
                <Navbar />
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
        <div className="min-h-screen relative font-sans space-theme text-foreground selection:bg-primary/30">
            <StarryBackground />
            <div className="relative z-10">
                <Navbar />
                <div className="p-8">
                    <div className="max-w-7xl mx-auto">
                        {loading ? (
                            <>
                                <PageHeaderSkeleton />
                                <FilterSkeleton />
                                <CardSkeleton count={6} columns={2} />
                            </>
                        ) : (
                            <>
                                <div className="mb-12 animate-fade-up">
                                    <h1 className="text-4xl font-bold text-foreground mb-4 flex items-center gap-3">
                                        <Award className="w-10 h-10 text-primary" />
                                        Certificate Explorer
                                    </h1>
                                    <p className="text-lg text-muted-foreground">
                                        Discover professional certificates to
                                        boost your career. {certificates.length}{" "}
                                        certificates available.
                                    </p>
                                </div>

                                {/* Filters */}
                                <div className="glass-card p-6 mb-8 shadow-lg animate-fade-up stagger-1 rounded-2xl border border-white/10">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Filter className="w-5 h-5 text-primary" />
                                        <h2 className="text-lg font-semibold text-foreground">
                                            Filters
                                        </h2>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {/* Difficulty Level */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                Difficulty Level
                                            </label>
                                            <select
                                                value={selectedLevel}
                                                onChange={(e) =>
                                                    setSelectedLevel(
                                                        e.target.value
                                                    )
                                                }
                                                className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-lg text-white focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                                            >
                                                {levels.map((level) => (
                                                    <option
                                                        key={level}
                                                        value={level}
                                                        className="bg-black text-white"
                                                    >
                                                        {level}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Provider */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                Provider
                                            </label>
                                            <select
                                                value={selectedProvider}
                                                onChange={(e) =>
                                                    setSelectedProvider(
                                                        e.target.value
                                                    )
                                                }
                                                className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-lg text-white focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                                            >
                                                {providers.map((provider) => (
                                                    <option
                                                        key={provider}
                                                        value={provider}
                                                        className="bg-black text-white"
                                                    >
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
                                                        setShowFreeOnly(
                                                            e.target.checked
                                                        )
                                                    }
                                                    className="w-5 h-5 text-primary border-white/20 rounded bg-black/50 focus:ring-primary"
                                                />
                                                <span className="text-sm font-medium text-gray-300">
                                                    Show Free Only
                                                </span>
                                            </label>
                                        </div>
                                    </div>

                                    <div className="mt-4 text-sm text-muted-foreground">
                                        Showing {filteredCertificates.length} of{" "}
                                        {certificates.length} certificates
                                    </div>
                                </div>

                                {/* Certificates Grid */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-up stagger-2">
                                    {filteredCertificates.map((cert) => (
                                        <div
                                            key={cert.id}
                                            className="glass-card p-8 shadow-lg hover:bg-white/5 transition-all group rounded-2xl border border-white/10"
                                        >
                                            {/* Header */}
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex-1">
                                                    <h3 className="text-xl font-bold text-foreground mb-2 group-hover:translate-x-1 transition-transform">
                                                        {cert.name}
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground font-medium">
                                                        {cert.provider}
                                                    </p>
                                                </div>
                                                <div className="p-2 bg-primary/10 rounded-lg">
                                                    <Award className="w-8 h-8 text-primary flex-shrink-0" />
                                                </div>
                                            </div>

                                            {/* Description */}
                                            <p className="text-gray-300 mb-4 line-clamp-2">
                                                {cert.description}
                                            </p>

                                            {/* Badges */}
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                <span
                                                    className={`px-3 py-1 text-xs font-bold rounded-full ${
                                                        cert.difficulty_level ===
                                                        "Beginner"
                                                            ? "bg-green-500/20 text-green-400"
                                                            : cert.difficulty_level ===
                                                              "Intermediate"
                                                            ? "bg-yellow-500/20 text-yellow-400"
                                                            : "bg-red-500/20 text-red-400"
                                                    }`}
                                                >
                                                    {cert.difficulty_level}
                                                </span>
                                                {cert.is_free && (
                                                    <span className="px-3 py-1 text-xs font-bold bg-primary/20 text-primary border border-primary/30 rounded-full flex items-center gap-1">
                                                        <CheckCircle className="w-3 h-3" />
                                                        Free Course
                                                    </span>
                                                )}
                                                {cert.has_exam && (
                                                    <span className="px-3 py-1 text-xs font-bold bg-white/10 text-white rounded-full">
                                                        Exam Included
                                                    </span>
                                                )}
                                            </div>

                                            {/* Details */}
                                            <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-white/10">
                                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                                    <Clock className="w-4 h-4" />
                                                    <span>
                                                        {cert.duration_hours}{" "}
                                                        hours
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-400">
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
                                                cert.skills_covered.length >
                                                    0 && (
                                                    <div className="mb-4">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <BookOpen className="w-4 h-4 text-primary" />
                                                            <span className="text-sm font-medium text-gray-300">
                                                                Skills Covered:
                                                            </span>
                                                        </div>
                                                        <div className="flex flex-wrap gap-1">
                                                            {cert.skills_covered
                                                                .slice(0, 4)
                                                                .map(
                                                                    (
                                                                        skill,
                                                                        idx
                                                                    ) => (
                                                                        <span
                                                                            key={
                                                                                idx
                                                                            }
                                                                            className="px-2 py-1 bg-white/5 border border-white/10 text-gray-300 text-xs font-medium rounded"
                                                                        >
                                                                            {
                                                                                skill
                                                                            }
                                                                        </span>
                                                                    )
                                                                )}
                                                            {cert.skills_covered
                                                                .length > 4 && (
                                                                <span className="px-2 py-1 bg-white/10 text-gray-400 rounded text-xs">
                                                                    +
                                                                    {cert
                                                                        .skills_covered
                                                                        .length -
                                                                        4}{" "}
                                                                    more
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                            {/* Career Paths */}
                                            {cert.career_paths &&
                                                cert.career_paths.length >
                                                    0 && (
                                                    <div className="mb-4">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <TrendingUp className="w-4 h-4 text-primary" />
                                                            <span className="text-sm font-medium text-gray-300">
                                                                Career Paths:
                                                            </span>
                                                        </div>
                                                        <div className="flex flex-wrap gap-1">
                                                            {cert.career_paths.map(
                                                                (path, idx) => (
                                                                    <span
                                                                        key={
                                                                            idx
                                                                        }
                                                                        className="px-2 py-1 bg-primary/10 border border-primary/20 text-primary text-xs font-bold rounded"
                                                                    >
                                                                        {path}
                                                                    </span>
                                                                )
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                            {/* Action Buttons */}
                                            <div className="flex gap-2">
                                                {cert.url && (
                                                    <a
                                                        href={cert.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex-1 inline-flex items-center gap-2 text-primary font-bold border border-primary/30 bg-primary/10 px-4 py-2 hover:bg-primary hover:text-black transition-all rounded-lg justify-center"
                                                    >
                                                        Learn More
                                                        <ExternalLink className="w-4 h-4" />
                                                    </a>
                                                )}
                                                <button
                                                    onClick={() =>
                                                        handleSaveToRoadmap(
                                                            cert
                                                        )
                                                    }
                                                    disabled={
                                                        savingCert ===
                                                            cert.id ||
                                                        savedCerts.has(cert.id)
                                                    }
                                                    className={`flex-1 inline-flex items-center gap-2 font-bold border px-4 py-2 transition-all rounded-lg justify-center ${
                                                        savedCerts.has(cert.id)
                                                            ? "border-green-500/30 bg-green-500/10 text-green-400 cursor-default"
                                                            : "border-accent/30 bg-accent/10 text-accent hover:bg-accent hover:text-black"
                                                    }`}
                                                >
                                                    {savingCert === cert.id ? (
                                                        <>
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                            Saving...
                                                        </>
                                                    ) : savedCerts.has(
                                                          cert.id
                                                      ) ? (
                                                        <>
                                                            <CheckCircle className="w-4 h-4" />
                                                            Added
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Plus className="w-4 h-4" />
                                                            Add to Roadmap
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {filteredCertificates.length === 0 && (
                                    <div className="glass-card rounded-2xl border border-white/10 p-12 text-center bg-white/5">
                                        <Award className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                                        <h3 className="text-xl font-semibold text-foreground mb-2">
                                            No certificates found
                                        </h3>
                                        <p className="text-muted-foreground mb-4">
                                            Try adjusting your filters to see
                                            more results.
                                        </p>
                                        <button
                                            onClick={() => {
                                                setSelectedLevel("All");
                                                setSelectedProvider("All");
                                                setShowFreeOnly(false);
                                            }}
                                            className="text-primary font-bold border border-primary/30 px-4 py-2 hover:bg-primary hover:text-black transition-all rounded-lg"
                                        >
                                            Reset Filters
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
                <Footer />
            </div>
        </div>
    );
}
