import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
    ArrowLeft,
    Search,
    Sparkles,
    TrendingUp,
    Award,
    Users,
    Briefcase,
    Loader,
    X,
    Save,
    Plus,
    Check,
} from "lucide-react";
import axios from "../../lib/axios";
import RoadmapView from "../../components/RoadmapView";
import Navbar from "../../components/layouts/Navbar";
import Footer from "../../components/layouts/Footer";
import { useToast } from "../../hooks/use-toast";
import StarryBackground from "../../components/StarryBackground";

const AI_SERVICE_URL = "http://localhost:5001";

export default function RoadmapPage() {
    const [roadmap, setRoadmap] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [recommendations, setRecommendations] = useState(null);
    const [searchError, setSearchError] = useState(null);
    const { toast } = useToast();
    const searchInputRef = useRef(null);
    const suggestionsTimeoutRef = useRef(null);

    // ... (useEffect and other code) ...

    const handleAddItem = async (type, value) => {
        try {
            const response = await axios.post("/roadmaps/items", {
                type,
                value,
                career_goal: searchQuery,
            });
            setRoadmap(response.data);
            toast({
                title: "Added to Roadmap",
                description: `${value} added to your roadmap!`,
            });
        } catch (error) {
            console.error("Error adding item:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to add item. Please try again.",
            });
        }
    };

    useEffect(() => {
        // Check for cached preview first
        const cachedPreview = localStorage.getItem("roadmap_preview");
        let hasCache = false;

        if (cachedPreview) {
            try {
                setRecommendations(JSON.parse(cachedPreview));
                hasCache = true;
            } catch (e) {
                console.error("Failed to parse cached roadmap preview", e);
                localStorage.removeItem("roadmap_preview");
            }
        }

        // Only fetch saved roadmap if no preview is pending
        if (!hasCache) {
            fetchRoadmap();
        }
    }, []);

    const fetchRoadmap = async () => {
        try {
            const userResponse = await axios.get("/auth/me");
            const userId = userResponse.data.id;

            const studentResponse = await axios.get(`/students/${userId}`);
            setRoadmap(studentResponse.data.roadmap);
        } catch (error) {
            console.error("Error fetching roadmap:", error);
        }
    };

    const fetchSuggestions = async (query) => {
        if (query.length < 2) {
            setSuggestions([]);
            return;
        }

        try {
            // Use backend proxy if available, or just mock it for now to avoid errors if backend isn't ready
            // But since we are fixing it, let's assume we will add the backend endpoint too.
            // For now, let's try to hit the AI service via backend proxy to avoid CORS.
            const response = await axios.post("/roadmaps/autocomplete", {
                query,
                max_suggestions: 5,
            });
            setSuggestions(response.data.suggestions || []);
            setShowSuggestions(true);
        } catch (error) {
            console.error("Error fetching suggestions:", error);
            setSuggestions([]);
        }
    };

    const handleSearchInput = (e) => {
        const value = e.target.value;
        setSearchQuery(value);

        // Debounce autocomplete
        if (suggestionsTimeoutRef.current) {
            clearTimeout(suggestionsTimeoutRef.current);
        }

        suggestionsTimeoutRef.current = setTimeout(() => {
            fetchSuggestions(value);
        }, 300);
    };

    const handleSearch = async (query = searchQuery) => {
        if (!query.trim()) return;

        setIsSearching(true);
        setShowSuggestions(false);
        setSearchError(null);

        // Reset states
        setRoadmap(null);
        setRecommendations(null);

        try {
            const response = await axios.post("/roadmaps/generate", {
                career_goal: query.trim(),
            });
            const data = response.data;

            if (data.error) {
                setSearchError(data.error);
                setRecommendations(null);
            } else {
                if (data.ai_response) {
                    setRecommendations(data.ai_response);
                    localStorage.setItem(
                        "roadmap_preview",
                        JSON.stringify(data.ai_response)
                    );
                }
                // Don't set roadmap yet, just preview
                // We might want to store the preview data in a ref or state to save later
            }
        } catch (error) {
            console.error("Error fetching recommendations:", error);
            setSearchError(
                error.response?.data?.error ||
                    "Failed to generate roadmap. Please ensure the backend and AI service are running."
            );
            setRecommendations(null);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSaveRoadmap = async () => {
        if (!recommendations) return;

        try {
            // We need to construct the payload for saving.
            // Ideally backend 'generate' returned the structured data for us to send back,
            // or we use the 'recommendations' state to build it.
            // Let's use the 'recommendations' to build it matching backend store validation.

            // Extract data from recommendations (AI response)
            const recs = recommendations.recommendations;

            const payload = {
                // we need student_id but backend handles it from auth if missing
                career_goal: recommendations.query || searchQuery,
                skills_to_learn: recs.skills || [],
                organizations_to_join: recs.organizations || [],
                certificates_to_earn: recs.certifications || [],
                projects_to_build: recs.projects || [],
                ai_insights: `Generated based on ${recommendations.top_alumni.length} successful alumni profiles.`,
                success_probability: 0.85,
                completion_percentage: 0,
            };

            const response = await axios.post("/roadmaps", payload);
            if (response.status === 201 || response.status === 200) {
                setRoadmap(response.data);
                // Clear recommendations to show the RoadmapView
                setRecommendations(null);
                localStorage.removeItem("roadmap_preview");
                toast({
                    title: "Success",
                    description: "Full roadmap saved successfully!",
                });
            }
        } catch (error) {
            console.error("Error saving roadmap:", error);
            setSearchError("Failed to save roadmap. Please try again.");
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to save roadmap.",
            });
        }
    };

    const handleSuggestionClick = (suggestion) => {
        setSearchQuery(suggestion);
        setShowSuggestions(false);
        handleSearch(suggestion);
    };

    const clearSearch = () => {
        setSearchQuery("");
        setRecommendations(null);
        setSearchError(null);
        setSuggestions([]);
        setShowSuggestions(false);
    };

    return (
        <div className="min-h-screen relative font-sans space-theme text-foreground selection:bg-primary/30">
            <StarryBackground />
            <div className="relative z-10">
                {/* Navbar */}
                <Navbar />

                <div className="p-8">
                    <div className="max-w-6xl mx-auto">
                        {/* Header Section */}
                        <div className="mb-8 animate-fade-up">
                            <div className="flex items-center gap-3 mb-3">
                                <Sparkles className="w-8 h-8 text-primary" />
                                <h1 className="text-4xl font-bold text-foreground">
                                    AI Career Roadmap
                                </h1>
                            </div>
                            <p className="text-muted-foreground text-lg">
                                Discover your path to success based on
                                successful alumni patterns
                            </p>
                        </div>

                        {/* AI Search Section */}
                        <div className="glass-card p-8 mb-8 shadow-lg animate-fade-up stagger-1 rounded-2xl">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-primary/10 text-primary rounded-lg border border-primary/20">
                                    <Search className="w-6 h-6" />
                                </div>
                                <h2 className="text-2xl font-bold text-foreground">
                                    Tell Us About Your Interests
                                </h2>
                            </div>
                            <p className="text-muted-foreground mb-6">
                                Describe what you love doing or your career
                                aspirations in your own words. For example:{" "}
                                <span className="font-bold text-primary">
                                    "I like editing feed designs using Canva"
                                </span>{" "}
                                or
                                <span className="font-bold text-primary">
                                    {" "}
                                    "I enjoy building mobile apps"
                                </span>
                                .
                            </p>

                            {/* Search Input */}
                            <div className="relative">
                                <div className="relative">
                                    <input
                                        ref={searchInputRef}
                                        type="text"
                                        value={searchQuery}
                                        onChange={handleSearchInput}
                                        onKeyPress={(e) =>
                                            e.key === "Enter" && handleSearch()
                                        }
                                        placeholder="e.g., I like designing user interfaces, I enjoy analyzing data, I love coding websites..."
                                        className="w-full px-6 py-4 pr-32 text-lg bg-black/20 border border-white/10 rounded-xl focus:ring-1 focus:ring-primary focus:border-primary transition-all outline-none text-white placeholder:text-gray-500"
                                    />
                                    {searchQuery && (
                                        <button
                                            onClick={clearSearch}
                                            className="absolute right-24 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleSearch()}
                                        disabled={
                                            isSearching || !searchQuery.trim()
                                        }
                                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-primary-foreground px-6 py-2 rounded-lg font-bold hover:bg-primary/90 hover:shadow-glow transition-all flex items-center gap-2"
                                    >
                                        {isSearching ? (
                                            <>
                                                <Loader className="w-5 h-5 animate-spin" />
                                                Searching...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="w-5 h-5" />
                                                Search
                                            </>
                                        )}
                                    </button>
                                </div>

                                {/* Autocomplete Suggestions */}
                                {showSuggestions && suggestions.length > 0 && (
                                    <div className="absolute z-10 w-full mt-2 bg-black/80 backdrop-blur-md border border-white/10 rounded-xl shadow-xl overflow-hidden">
                                        {suggestions.map(
                                            (suggestion, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() =>
                                                        handleSuggestionClick(
                                                            suggestion
                                                        )
                                                    }
                                                    className="w-full px-6 py-3 text-left hover:bg-white/10 text-gray-200 transition-colors border-b border-white/5 last:border-b-0 font-medium"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <Search className="w-4 h-4 text-primary" />
                                                        <span className="text-foreground">
                                                            {suggestion}
                                                        </span>
                                                    </div>
                                                </button>
                                            )
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Error Message */}
                        {searchError && (
                            <div className="mb-8 p-6 bg-destructive/10 border border-destructive/30 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-red-100 rounded-lg">
                                        <X className="w-6 h-6 text-red-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-red-800">
                                            Error
                                        </h3>
                                        <p className="text-red-600">
                                            {searchError}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Main Content Area */}
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-up stagger-2">
                            {/* 1. Roadmap View if exists */}
                            {roadmap && (
                                <div className="mb-16 animate-fade-in">
                                    <RoadmapView roadmap={roadmap} />
                                    {/* Divider if we also have recommendations to show */}
                                    {recommendations && (
                                        <div className="border-t border-gray-200 my-12" />
                                    )}
                                </div>
                            )}

                            {/* 2. Recommendations / Preview View */}
                            {recommendations && (
                                <div className="animate-fade-in">
                                    {/* Save Roadmap Overlay/Banner - Only show if no roadmap yet */}
                                    {!roadmap && (
                                        <div className="glass-card mb-8 p-6 flex items-center justify-between sticky top-24 z-20 transition-all border border-primary/20 bg-primary/5">
                                            <div>
                                                <h3 className="font-bold text-foreground text-xl">
                                                    Roadmap Preview
                                                </h3>
                                                <p className="text-sm text-muted-foreground font-medium">
                                                    Like this roadmap? Save it
                                                    as your starting point.
                                                </p>
                                            </div>
                                            <button
                                                onClick={handleSaveRoadmap}
                                                className="bg-primary text-primary-foreground border border-primary px-6 py-2 rounded-lg font-bold hover:bg-primary/90 hover:shadow-glow transition-all flex items-center gap-2"
                                            >
                                                <Save className="w-5 h-5" />
                                                Save Full Roadmap
                                            </button>
                                        </div>
                                    )}

                                    {/* Top Alumni Section */}
                                    <div className="glass-card p-8 shadow-lg mb-8 rounded-2xl">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="p-2 bg-primary/10 border border-primary/20 text-primary rounded-lg">
                                                <Users className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-bold text-foreground">
                                                    🌟 Top Alumni Match
                                                </h3>
                                                <p className="text-muted-foreground text-sm">
                                                    Alumni with similar career
                                                    path for "
                                                    {recommendations.query}"
                                                </p>
                                            </div>
                                        </div>

                                        {/* Narrative Introduction */}
                                        <div className="mb-6 p-5 bg-black/20 border border-white/10 rounded-xl">
                                            <p className="text-gray-300 leading-relaxed">
                                                <span className="font-bold text-primary-foreground bg-primary px-2 py-0.5 rounded mr-1">
                                                    Great news!
                                                </span>{" "}
                                                We found{" "}
                                                {
                                                    recommendations.top_alumni
                                                        .length
                                                }{" "}
                                                alumni who share a similar
                                                career path to your goal of
                                                becoming a{" "}
                                                <span className="font-semibold text-primary">
                                                    {recommendations.query}
                                                </span>
                                                . Their journey can be your
                                                roadmap to success! 🚀
                                            </p>
                                        </div>

                                        <div className="space-y-4">
                                            {recommendations.top_alumni.map(
                                                (alumni, index) => (
                                                    <div
                                                        key={index}
                                                        className="p-6 bg-black/20 border border-white/10 rounded-xl hover:bg-white/5 transition-all"
                                                    >
                                                        <div className="flex justify-between items-start mb-3">
                                                            <div className="flex-1">
                                                                <h4 className="font-bold text-lg text-foreground">
                                                                    {
                                                                        alumni.name
                                                                    }
                                                                </h4>
                                                                <p className="text-primary font-bold border-b border-primary/30 inline-block">
                                                                    {
                                                                        alumni.job_title
                                                                    }
                                                                </p>
                                                                <div className="flex items-center gap-2 mt-2">
                                                                    <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-sm font-medium text-gray-300">
                                                                        🏢{" "}
                                                                        {
                                                                            alumni.current_company
                                                                        }
                                                                    </span>
                                                                    <span className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-sm font-bold text-primary">
                                                                        📚{" "}
                                                                        {
                                                                            alumni.major
                                                                        }
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="text-right ml-4">
                                                                <div className="text-2xl font-bold text-primary">
                                                                    {(
                                                                        alumni.similarity_percentage ||
                                                                        0
                                                                    ).toFixed(
                                                                        1
                                                                    )}
                                                                    %
                                                                </div>
                                                                <p className="text-xs text-muted-foreground">
                                                                    Match
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </div>

                                    {/* Skills & Recommendations Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Skills Prioritas */}
                                        <div className="glass-card rounded-2xl shadow-lg p-8">
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="p-2 bg-primary/10 text-primary rounded-lg border border-primary/20">
                                                    <TrendingUp className="w-6 h-6" />
                                                </div>
                                                <h3 className="text-xl font-bold text-foreground">
                                                    💪 Skills You Need to Master
                                                </h3>
                                            </div>
                                            <div className="mb-4 p-4 bg-black/20 border border-white/10 rounded-xl">
                                                <p className="text-muted-foreground text-sm leading-relaxed">
                                                    Based on{" "}
                                                    <span className="font-bold text-primary">
                                                        {
                                                            recommendations
                                                                .top_alumni
                                                                .length
                                                        }{" "}
                                                        successful alumni
                                                    </span>
                                                    , here are the most valuable
                                                    skills they use:
                                                </p>
                                            </div>
                                            <div className="space-y-3">
                                                {recommendations.recommendations.skills
                                                    .slice(0, 8)
                                                    .map(
                                                        (
                                                            [skill, count],
                                                            index
                                                        ) => {
                                                            const percentage =
                                                                Math.round(
                                                                    (count /
                                                                        recommendations
                                                                            .top_alumni
                                                                            .length) *
                                                                        100
                                                                );

                                                            const isInRoadmap =
                                                                roadmap?.skills_to_learn?.some(
                                                                    (s) => {
                                                                        const sName =
                                                                            Array.isArray(
                                                                                s
                                                                            )
                                                                                ? s[0]
                                                                                : s;
                                                                        return (
                                                                            sName ===
                                                                            skill
                                                                        );
                                                                    }
                                                                );

                                                            return (
                                                                <div
                                                                    key={index}
                                                                    className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
                                                                >
                                                                    <div className="flex items-center gap-3 flex-1">
                                                                        <span className="flex-shrink-0 w-6 h-6 bg-primary/20 text-primary rounded flex items-center justify-center text-xs font-bold border border-primary/30">
                                                                            {index +
                                                                                1}
                                                                        </span>
                                                                        <span className="font-medium text-gray-200">
                                                                            {
                                                                                skill
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        {!isInRoadmap ? (
                                                                            <button
                                                                                onClick={() =>
                                                                                    handleAddItem(
                                                                                        "skill",
                                                                                        skill
                                                                                    )
                                                                                }
                                                                                className="p-1.5 bg-primary/10 text-primary rounded-md border border-primary/20 hover:bg-primary hover:text-black transition-colors"
                                                                                title="Add to Roadmap"
                                                                            >
                                                                                <Plus className="w-4 h-4" />
                                                                            </button>
                                                                        ) : (
                                                                            <Check className="w-5 h-5 text-green-400" />
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            );
                                                        }
                                                    )}
                                            </div>
                                        </div>

                                        {/* Certifications */}
                                        <div className="glass-card rounded-2xl shadow-lg p-8">
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="p-2 bg-primary/10 text-primary rounded-lg border border-primary/20">
                                                    <Award className="w-6 h-6" />
                                                </div>
                                                <h3 className="text-xl font-bold text-foreground">
                                                    🏆 Certifications to Boost
                                                    Your CV
                                                </h3>
                                            </div>
                                            <div className="mb-4 p-4 bg-black/20 border border-white/10 rounded-xl">
                                                <p className="text-muted-foreground text-sm leading-relaxed">
                                                    These certifications are{" "}
                                                    <span className="font-bold text-primary">
                                                        proven to boost careers
                                                    </span>{" "}
                                                    among successful alumni:
                                                </p>
                                            </div>
                                            <div className="space-y-3">
                                                {recommendations.recommendations.certifications
                                                    .slice(0, 6)
                                                    .map(
                                                        (
                                                            [cert, count],
                                                            index
                                                        ) => {
                                                            const percentage =
                                                                Math.round(
                                                                    (count /
                                                                        recommendations
                                                                            .top_alumni
                                                                            .length) *
                                                                        100
                                                                );

                                                            const isInRoadmap =
                                                                roadmap?.certificates_to_earn?.some(
                                                                    (s) => {
                                                                        const sName =
                                                                            Array.isArray(
                                                                                s
                                                                            )
                                                                                ? s[0]
                                                                                : s;
                                                                        return (
                                                                            sName ===
                                                                            cert
                                                                        );
                                                                    }
                                                                );

                                                            return (
                                                                <div
                                                                    key={index}
                                                                    className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
                                                                >
                                                                    <div className="flex items-center gap-3 flex-1">
                                                                        <span className="flex-shrink-0 w-6 h-6 bg-primary/20 text-primary rounded flex items-center justify-center text-xs font-bold border border-primary/30">
                                                                            {index +
                                                                                1}
                                                                        </span>
                                                                        <span className="font-medium text-gray-200">
                                                                            {
                                                                                cert
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        {!isInRoadmap ? (
                                                                            <button
                                                                                onClick={() =>
                                                                                    handleAddItem(
                                                                                        "certification",
                                                                                        cert
                                                                                    )
                                                                                }
                                                                                className="p-1.5 bg-primary/10 text-primary rounded-md border border-primary/20 hover:bg-primary hover:text-black transition-colors"
                                                                                title="Add to Roadmap"
                                                                            >
                                                                                <Plus className="w-4 h-4" />
                                                                            </button>
                                                                        ) : (
                                                                            <div className="flex items-center gap-1 text-xs text-green-400 font-bold px-2 py-1 bg-green-400/10 border border-green-400/20 rounded">
                                                                                <Check className="w-3 h-3" />{" "}
                                                                                Added
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            );
                                                        }
                                                    )}
                                            </div>
                                        </div>

                                        {/* Organizations */}
                                        <div className="glass-card rounded-2xl shadow-lg p-8">
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="p-2 bg-primary/10 text-primary rounded-lg border border-primary/20">
                                                    <Users className="w-6 h-6" />
                                                </div>
                                                <h3 className="text-xl font-bold text-foreground">
                                                    🤝 Build Your Network Here
                                                </h3>
                                            </div>
                                            <div className="mb-4 p-4 bg-black/20 border border-white/10 rounded-xl">
                                                <p className="text-muted-foreground text-sm leading-relaxed">
                                                    Join these organizations to{" "}
                                                    <span className="font-bold text-primary">
                                                        expand your network
                                                    </span>{" "}
                                                    and gain hands-on
                                                    experience:
                                                </p>
                                            </div>
                                            <div className="space-y-3">
                                                {recommendations.recommendations.organizations
                                                    .slice(0, 6)
                                                    .map(
                                                        (
                                                            [org, count],
                                                            index
                                                        ) => {
                                                            const percentage =
                                                                Math.round(
                                                                    (count /
                                                                        recommendations
                                                                            .top_alumni
                                                                            .length) *
                                                                        100
                                                                );

                                                            const isInRoadmap =
                                                                roadmap?.organizations_to_join?.some(
                                                                    (s) => {
                                                                        const sName =
                                                                            Array.isArray(
                                                                                s
                                                                            )
                                                                                ? s[0]
                                                                                : s;
                                                                        return (
                                                                            sName ===
                                                                            org
                                                                        );
                                                                    }
                                                                );

                                                            return (
                                                                <div
                                                                    key={index}
                                                                    className="flex items-center justify-between p-3 bg-white border-2 border-black rounded-none hover:bg-gray-50 transition-colors"
                                                                >
                                                                    <div className="flex items-center gap-3 flex-1">
                                                                        <span className="flex-shrink-0 w-6 h-6 bg-black text-white rounded-none flex items-center justify-center text-xs font-bold border-2 border-black">
                                                                            {index +
                                                                                1}
                                                                        </span>
                                                                        <span className="font-semibold text-gray-900">
                                                                            {org.replace(
                                                                                /_/g,
                                                                                " "
                                                                            )}
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        {!isInRoadmap ? (
                                                                            <button
                                                                                onClick={() =>
                                                                                    handleAddItem(
                                                                                        "organization",
                                                                                        org
                                                                                    )
                                                                                }
                                                                                className="p-1.5 bg-white text-black rounded-none border-2 border-black hover:bg-black hover:text-white transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
                                                                                title="Add to Roadmap"
                                                                            >
                                                                                <Plus className="w-4 h-4" />
                                                                            </button>
                                                                        ) : (
                                                                            <div className="flex items-center gap-1 text-xs text-black font-bold px-2 py-1 bg-white border-2 border-black rounded-none">
                                                                                <Check className="w-3 h-3" />{" "}
                                                                                Added
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            );
                                                        }
                                                    )}
                                            </div>
                                        </div>

                                        {/* Projects */}
                                        {recommendations.recommendations
                                            .projects &&
                                            recommendations.recommendations
                                                .projects.length > 0 && (
                                                <div className="glass-card rounded-2xl shadow-lg p-8">
                                                    <div className="flex items-center gap-3 mb-6">
                                                        <div className="p-2 bg-primary/10 text-primary rounded-lg border border-primary/20">
                                                            <Briefcase className="w-6 h-6" />
                                                        </div>
                                                        <h3 className="text-xl font-bold text-foreground">
                                                            💼 Build These
                                                            Portfolio Projects
                                                        </h3>
                                                    </div>
                                                    <div className="mb-4 p-4 bg-black/20 border border-white/10 rounded-xl">
                                                        <p className="text-muted-foreground text-sm leading-relaxed">
                                                            <span className="font-bold text-primary">
                                                                Prove your
                                                                skills!
                                                            </span>{" "}
                                                            Build these projects
                                                            that successful
                                                            alumni created:
                                                        </p>
                                                    </div>
                                                    <div className="space-y-3">
                                                        {recommendations.recommendations.projects
                                                            .slice(0, 6)
                                                            .map(
                                                                (
                                                                    [
                                                                        project,
                                                                        count,
                                                                    ],
                                                                    index
                                                                ) => {
                                                                    const percentage =
                                                                        Math.round(
                                                                            (count /
                                                                                recommendations
                                                                                    .top_alumni
                                                                                    .length) *
                                                                                100
                                                                        );

                                                                    const isInRoadmap =
                                                                        roadmap?.projects_to_build?.some(
                                                                            (
                                                                                s
                                                                            ) => {
                                                                                const sName =
                                                                                    Array.isArray(
                                                                                        s
                                                                                    )
                                                                                        ? s[0]
                                                                                        : s;
                                                                                return (
                                                                                    sName ===
                                                                                    project
                                                                                );
                                                                            }
                                                                        );

                                                                    return (
                                                                        <div
                                                                            key={
                                                                                index
                                                                            }
                                                                            className="flex items-center justify-between p-3 bg-white border-2 border-black rounded-none hover:bg-gray-50 transition-colors"
                                                                        >
                                                                            <div className="flex items-center gap-3 flex-1">
                                                                                <span className="flex-shrink-0 w-6 h-6 bg-black text-white rounded-none flex items-center justify-center text-xs font-bold border-2 border-black">
                                                                                    {index +
                                                                                        1}
                                                                                </span>
                                                                                <span className="font-semibold text-gray-900">
                                                                                    {
                                                                                        project
                                                                                    }
                                                                                </span>
                                                                            </div>
                                                                            <div className="flex items-center gap-2">
                                                                                {!isInRoadmap ? (
                                                                                    <button
                                                                                        onClick={() =>
                                                                                            handleAddItem(
                                                                                                "project",
                                                                                                project
                                                                                            )
                                                                                        }
                                                                                        className="p-1.5 bg-white text-black rounded-none border-2 border-black hover:bg-black hover:text-white transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
                                                                                        title="Add to Roadmap"
                                                                                    >
                                                                                        <Plus className="w-4 h-4" />
                                                                                    </button>
                                                                                ) : (
                                                                                    <div className="flex items-center gap-1 text-xs text-black font-bold px-2 py-1 bg-white border-2 border-black rounded-none">
                                                                                        <Check className="w-3 h-3" />{" "}
                                                                                        Added
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                }
                                                            )}
                                                    </div>
                                                </div>
                                            )}
                                    </div>
                                </div>
                            )}
                        </div>
                        {/* End Main Content Area */}
                    </div>
                </div>
                <Footer />
            </div>
        </div>
    );
}
