import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Search, Sparkles, TrendingUp, Award, Users, Briefcase, Loader, X } from "lucide-react";
import axios from "../../lib/axios";
import RoadmapView from "../../components/RoadmapView";
import Navbar from "../../components/layouts/Navbar";

const AI_SERVICE_URL = 'http://localhost:5001';

export default function RoadmapPage() {
    const [roadmap, setRoadmap] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [recommendations, setRecommendations] = useState(null);
    const searchInputRef = useRef(null);
    const suggestionsTimeoutRef = useRef(null);

    useEffect(() => {
        fetchRoadmap();
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
            const response = await fetch(`${AI_SERVICE_URL}/autocomplete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query, max_suggestions: 5 })
            });
            const data = await response.json();
            setSuggestions(data.suggestions || []);
            setShowSuggestions(true);
        } catch (error) {
            console.error('Error fetching suggestions:', error);
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
        
        try {
            const response = await fetch(`${AI_SERVICE_URL}/recommend`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: query.trim(), top_n: 5 })
            });
            const data = await response.json();
            setRecommendations(data);
        } catch (error) {
            console.error('Error fetching recommendations:', error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSuggestionClick = (suggestion) => {
        setSearchQuery(suggestion);
        setShowSuggestions(false);
        handleSearch(suggestion);
    };

    const clearSearch = () => {
        setSearchQuery('');
        setRecommendations(null);
        setSuggestions([]);
        setShowSuggestions(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
            {/* Navbar */}
            <Navbar />

            <div className="p-8">
                <div className="max-w-6xl mx-auto">
                    <Link
                        to="/student/dashboard"
                        className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-6 font-medium"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to Dashboard
                    </Link>

                    {/* Header Section */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-3">
                            <Sparkles className="w-8 h-8 text-purple-600" />
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                AI Career Roadmap
                        </h1>
                    </div>
                    <p className="text-gray-600 text-lg">
                        Discover your path to success based on successful alumni patterns
                    </p>
                </div>

                {/* AI Search Section */}
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border-2 border-purple-100">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                            <Search className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">
                            Tell Us About Your Interests
                        </h2>
                    </div>
                    <p className="text-gray-600 mb-6">
                        Describe what you love doing or your career aspirations in your own words. 
                        For example: <span className="font-semibold text-purple-600">"I like editing feed designs using Canva"</span> or 
                        <span className="font-semibold text-purple-600"> "I enjoy building mobile apps"</span>.
                    </p>

                    {/* Search Input */}
                    <div className="relative">
                        <div className="relative">
                            <input
                                ref={searchInputRef}
                                type="text"
                                value={searchQuery}
                                onChange={handleSearchInput}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                placeholder="e.g., I like designing user interfaces, I enjoy analyzing data, I love coding websites..."
                                className="w-full px-6 py-4 pr-32 text-lg border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all outline-none"
                            />
                            {searchQuery && (
                                <button
                                    onClick={clearSearch}
                                    className="absolute right-24 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            )}
                            <button
                                onClick={() => handleSearch()}
                                disabled={isSearching || !searchQuery.trim()}
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
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
                            <div className="absolute z-10 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-xl overflow-hidden">
                                {suggestions.map((suggestion, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleSuggestionClick(suggestion)}
                                        className="w-full px-6 py-3 text-left hover:bg-purple-50 transition-colors border-b last:border-b-0 border-gray-100"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Search className="w-4 h-4 text-gray-400" />
                                            <span className="text-gray-900">{suggestion}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* AI Recommendations Results */}
                {recommendations && (
                    <div className="space-y-6 mb-8">
                        {/* Top Alumni Section */}
                        <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-blue-100">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
                                    <Users className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900">
                                        🌟 Top Alumni Match
                                    </h3>
                                    <p className="text-gray-600 text-sm">
                                        Alumni with similar career path for "{recommendations.query}"
                                    </p>
                                </div>
                            </div>

                            {/* Narrative Introduction */}
                            <div className="mb-6 p-5 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border-l-4 border-blue-500">
                                <p className="text-gray-700 leading-relaxed">
                                    <span className="font-semibold text-blue-600">Great news!</span> We found {recommendations.top_alumni.length} alumni who share a similar career path to your goal of becoming a <span className="font-semibold">{recommendations.query}</span>. 
                                    Their journey can be your roadmap to success! 🚀
                                </p>
                            </div>

                            <div className="space-y-4">
                                {recommendations.top_alumni.map((alumni, index) => (
                                    <div
                                        key={index}
                                        className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-100 hover:border-blue-300 transition-all"
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex-1">
                                                <h4 className="font-bold text-lg text-gray-900">{alumni.name}</h4>
                                                <p className="text-blue-600 font-semibold">{alumni.job_title}</p>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <span className="px-3 py-1 bg-white rounded-full text-sm font-medium text-gray-700 shadow-sm">
                                                        🏢 {alumni.current_company}
                                                    </span>
                                                    <span className="px-3 py-1 bg-blue-100 rounded-full text-sm text-blue-700">
                                                        📚 {alumni.major}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-right ml-4">
                                                <div className="text-2xl font-bold text-blue-600">
                                                    {alumni.similarity_percentage.toFixed(1)}%
                                                </div>
                                                <p className="text-xs text-gray-500">Match</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Skills & Recommendations Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Skills Prioritas */}
                            <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-green-100">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
                                        <TrendingUp className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900">
                                        💪 Skills You Need to Master
                                    </h3>
                                </div>
                                <div className="mb-4 p-4 bg-green-50 rounded-lg">
                                    <p className="text-gray-700 text-sm leading-relaxed">
                                        Based on <span className="font-bold text-green-700">{recommendations.top_alumni.length} successful alumni</span>, here are the most valuable skills they use:
                                    </p>
                                </div>
                                <div className="space-y-3">
                                    {recommendations.recommendations.skills.slice(0, 8).map(([skill, count], index) => {
                                        const percentage = Math.round((count / recommendations.top_alumni.length) * 100);
                                        return (
                                            <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                                                <div className="flex items-center gap-3 flex-1">
                                                    <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                                        {index + 1}
                                                    </span>
                                                    <span className="font-semibold text-gray-900">{skill}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-full">
                                                        {percentage}%
                                                    </span>
                                                    <span className="text-sm text-gray-600">
                                                        ({count}/{recommendations.top_alumni.length})
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Certifications */}
                            <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-amber-100">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg">
                                        <Award className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900">
                                        🏆 Certifications to Boost Your CV
                                    </h3>
                                </div>
                                <div className="mb-4 p-4 bg-amber-50 rounded-lg">
                                    <p className="text-gray-700 text-sm leading-relaxed">
                                        These certifications are <span className="font-bold text-amber-700">proven to boost careers</span> among successful alumni:
                                    </p>
                                </div>
                                <div className="space-y-3">
                                    {recommendations.recommendations.certifications.slice(0, 6).map(([cert, count], index) => {
                                        const percentage = Math.round((count / recommendations.top_alumni.length) * 100);
                                        return (
                                            <div key={index} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors">
                                                <div className="flex items-center gap-3 flex-1">
                                                    <span className="flex-shrink-0 w-6 h-6 bg-amber-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                                        {index + 1}
                                                    </span>
                                                    <span className="font-semibold text-gray-900">{cert}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="px-3 py-1 bg-amber-600 text-white text-xs font-bold rounded-full">
                                                        {percentage}%
                                                    </span>
                                                    <span className="text-sm text-gray-600">
                                                        ({count}/{recommendations.top_alumni.length})
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Organizations */}
                            <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-purple-100">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                                        <Users className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900">
                                        🤝 Build Your Network Here
                                    </h3>
                                </div>
                                <div className="mb-4 p-4 bg-purple-50 rounded-lg">
                                    <p className="text-gray-700 text-sm leading-relaxed">
                                        Join these organizations to <span className="font-bold text-purple-700">expand your network</span> and gain hands-on experience:
                                    </p>
                                </div>
                                <div className="space-y-3">
                                    {recommendations.recommendations.organizations.slice(0, 6).map(([org, count], index) => {
                                        const percentage = Math.round((count / recommendations.top_alumni.length) * 100);
                                        return (
                                            <div key={index} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                                                <div className="flex items-center gap-3 flex-1">
                                                    <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                                        {index + 1}
                                                    </span>
                                                    <span className="font-semibold text-gray-900">{org.replace(/_/g, ' ')}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="px-3 py-1 bg-purple-600 text-white text-xs font-bold rounded-full">
                                                        {percentage}%
                                                    </span>
                                                    <span className="text-sm text-gray-600">
                                                        ({count}/{recommendations.top_alumni.length})
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Projects */}
                            {recommendations.recommendations.projects && recommendations.recommendations.projects.length > 0 && (
                                <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-rose-100">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-2 bg-gradient-to-br from-rose-500 to-pink-500 rounded-lg">
                                            <Briefcase className="w-6 h-6 text-white" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900">
                                            💼 Build These Portfolio Projects
                                        </h3>
                                    </div>
                                    <div className="mb-4 p-4 bg-rose-50 rounded-lg">
                                        <p className="text-gray-700 text-sm leading-relaxed">
                                            <span className="font-bold text-rose-700">Prove your skills!</span> Build these projects that successful alumni created:
                                        </p>
                                    </div>
                                    <div className="space-y-3">
                                        {recommendations.recommendations.projects.slice(0, 6).map(([project, count], index) => {
                                            const percentage = Math.round((count / recommendations.top_alumni.length) * 100);
                                            return (
                                                <div key={index} className="flex items-center justify-between p-3 bg-rose-50 rounded-lg hover:bg-rose-100 transition-colors">
                                                    <div className="flex items-center gap-3 flex-1">
                                                        <span className="flex-shrink-0 w-6 h-6 bg-rose-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                                            {index + 1}
                                                        </span>
                                                        <span className="font-semibold text-gray-900">{project}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="px-3 py-1 bg-rose-600 text-white text-xs font-bold rounded-full">
                                                            {percentage}%
                                                        </span>
                                                        <span className="text-sm text-gray-600">
                                                            ({count}/{recommendations.top_alumni.length})
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Original Roadmap View */}
                {roadmap && (
                    <div className="mt-8">
                        <RoadmapView roadmap={roadmap} />
                    </div>
                )}
                </div>
            </div>
        </div>
    );
}
