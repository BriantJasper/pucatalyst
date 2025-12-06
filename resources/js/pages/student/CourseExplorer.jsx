import React, { useState, useEffect } from "react";
import {
    Play,
    ExternalLink,
    Clock,
    DollarSign,
    BookOpen,
    TrendingUp,
    CheckCircle,
    Filter,
    Plus,
    Loader2,
    Youtube,
    Globe,
    Award,
} from "lucide-react";
import api from "../../lib/axios";
import Navbar from "../../components/layouts/Navbar";
import Footer from "../../components/layouts/Footer";
import StarryBackground from "../../components/StarryBackground";
import { useToast } from "@/components/ui/use-toast";

export default function CourseExplorer() {
    const { toast } = useToast();
    const [savingCourse, setSavingCourse] = useState(null);
    const [savedCourses, setSavedCourses] = useState(new Set());
    const [courses, setCourses] = useState([]);
    const [error, setError] = useState(null);
    const [selectedProvider, setSelectedProvider] = useState("All");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [showFreeOnly, setShowFreeOnly] = useState(false);

    const fetchCourses = async () => {
        try {
            const response = await api.get("/courses");
            setCourses(response.data);
            return response.data;
        } catch (err) {
            setError("Failed to load courses");
            return [];
        }
    };

    const fetchRoadmapCourses = async (allCourses) => {
        try {
            const response = await api.get("/roadmaps/current");
            const roadmap = response.data;

            if (roadmap && roadmap.courses_to_take) {
                const roadmapCourseNames = roadmap.courses_to_take.map(
                    (course) =>
                        typeof course === "string"
                            ? course
                            : course.name || course[0]
                );

                const savedIds = new Set();
                allCourses.forEach((course) => {
                    if (roadmapCourseNames.includes(course.course_name)) {
                        savedIds.add(course.id);
                    }
                });

                setSavedCourses(savedIds);
            }
        } catch (err) {
            console.log("No existing roadmap found");
        }
    };

    const handleSaveToRoadmap = async (course) => {
        setSavingCourse(course.id);
        try {
            await api.post("/roadmaps/items", {
                type: "course",
                value: course.course_name,
            });

            setSavedCourses((prev) => new Set([...prev, course.id]));

            toast({
                title: "Course Added",
                description: `${course.course_name} has been added to your roadmap!`,
            });
        } catch (error) {
            console.error("Failed to save course:", error);
            toast({
                variant: "destructive",
                title: "Failed to Save",
                description:
                    error.response?.data?.error ||
                    "Could not add course to roadmap.",
            });
        } finally {
            setSavingCourse(null);
        }
    };

    useEffect(() => {
        const initializeData = async () => {
            const allCourses = await fetchCourses();
            if (allCourses.length > 0) {
                await fetchRoadmapCourses(allCourses);
            }
        };
        initializeData();
    }, []);

    const providers = [
        "All",
        ...new Set(courses.map((c) => c.provider).filter(Boolean)),
    ];
    const categories = [
        "All",
        ...new Set(courses.map((c) => c.category).filter(Boolean)),
    ];

    const filteredCourses = courses.filter((course) => {
        const providerMatch =
            selectedProvider === "All" || course.provider === selectedProvider;
        const categoryMatch =
            selectedCategory === "All" || course.category === selectedCategory;
        const freeMatch = !showFreeOnly || course.is_free;
        return providerMatch && categoryMatch && freeMatch;
    });

    const getDifficultyColor = (level) => {
        if (level <= 1.5) return "bg-green-500/20 text-green-400";
        if (level <= 2.5) return "bg-yellow-500/20 text-yellow-400";
        return "bg-red-500/20 text-red-400";
    };

    const getDifficultyLabel = (level) => {
        if (level <= 1.5) return "Beginner";
        if (level <= 2.5) return "Intermediate";
        return "Advanced";
    };

    const getProviderIcon = (provider) => {
        const lowerProvider = (provider || "").toLowerCase();
        if (lowerProvider.includes("youtube"))
            return <Youtube className="w-4 h-4" />;
        return <Globe className="w-4 h-4" />;
    };

    if (error) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-red-500 text-center">
                        <p className="text-xl font-semibold mb-2">{error}</p>
                        <button
                            onClick={fetchCourses}
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
                        <div className="mb-12 animate-fade-up">
                            <h1 className="text-4xl font-bold text-foreground mb-4 flex items-center gap-3">
                                <Play className="w-10 h-10 text-primary" />
                                Course Explorer
                            </h1>
                            <p className="text-lg text-muted-foreground">
                                Discover online courses to boost your skills.{" "}
                                {courses.length} courses available from YouTube,
                                Coursera, Udemy & more.
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
                                {/* Provider */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Provider
                                    </label>
                                    <select
                                        value={selectedProvider}
                                        onChange={(e) =>
                                            setSelectedProvider(e.target.value)
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

                                {/* Category */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Category
                                    </label>
                                    <select
                                        value={selectedCategory}
                                        onChange={(e) =>
                                            setSelectedCategory(e.target.value)
                                        }
                                        className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-lg text-white focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                                    >
                                        {categories.map((cat) => (
                                            <option
                                                key={cat}
                                                value={cat}
                                                className="bg-black text-white"
                                            >
                                                {cat}
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
                                            Free Courses Only
                                        </span>
                                    </label>
                                </div>
                            </div>

                            <div className="mt-4 text-sm text-muted-foreground">
                                Showing {filteredCourses.length} of{" "}
                                {courses.length} courses
                            </div>
                        </div>

                        {/* Courses Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-up stagger-2">
                            {filteredCourses.map((course) => (
                                <div
                                    key={course.id}
                                    className="glass-card p-8 shadow-lg hover:bg-white/5 transition-all group rounded-2xl border border-white/10"
                                >
                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                {course.provider && (
                                                    <span className="flex items-center gap-1 px-2 py-1 text-xs font-bold bg-white/10 text-white rounded-full">
                                                        {getProviderIcon(
                                                            course.provider
                                                        )}
                                                        {course.provider}
                                                    </span>
                                                )}
                                                {course.is_free && (
                                                    <span className="px-2 py-1 text-xs font-bold bg-green-500/20 text-green-400 rounded-full flex items-center gap-1">
                                                        <CheckCircle className="w-3 h-3" />
                                                        Free
                                                    </span>
                                                )}
                                                {course.category && (
                                                    <span className="px-2 py-1 text-xs font-bold bg-primary/20 text-primary rounded-full">
                                                        {course.category}
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className="text-xl font-bold text-foreground mb-2 group-hover:translate-x-1 transition-transform">
                                                {course.course_name}
                                            </h3>
                                            {course.instructor && (
                                                <p className="text-sm text-muted-foreground font-medium">
                                                    by {course.instructor}
                                                </p>
                                            )}
                                        </div>
                                        <div className="p-2 bg-primary/10 rounded-lg">
                                            <Play className="w-8 h-8 text-primary flex-shrink-0" />
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <p className="text-gray-300 mb-4 line-clamp-2">
                                        {course.description}
                                    </p>

                                    {/* Badges */}
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {course.difficulty_level !== null && (
                                            <span
                                                className={`px-3 py-1 text-xs font-bold rounded-full ${getDifficultyColor(
                                                    course.difficulty_level
                                                )}`}
                                            >
                                                {getDifficultyLabel(
                                                    course.difficulty_level
                                                )}
                                            </span>
                                        )}
                                    </div>

                                    {/* Details */}
                                    <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-white/10">
                                        {course.duration_hours && (
                                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                                <Clock className="w-4 h-4" />
                                                <span>
                                                    {course.duration_hours}{" "}
                                                    hours
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2 text-sm text-gray-400">
                                            <DollarSign className="w-4 h-4" />
                                            <span>
                                                {course.is_free
                                                    ? "Free"
                                                    : `$${course.cost || 0}`}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Skills */}
                                    {course.related_skills &&
                                        course.related_skills.length > 0 && (
                                            <div className="mb-4">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <BookOpen className="w-4 h-4 text-primary" />
                                                    <span className="text-sm font-medium text-gray-300">
                                                        Skills You'll Learn:
                                                    </span>
                                                </div>
                                                <div className="flex flex-wrap gap-1">
                                                    {course.related_skills
                                                        .slice(0, 4)
                                                        .map((skill, idx) => (
                                                            <span
                                                                key={idx}
                                                                className="px-2 py-1 bg-white/5 border border-white/10 text-gray-300 text-xs font-medium rounded"
                                                            >
                                                                {skill}
                                                            </span>
                                                        ))}
                                                    {course.related_skills
                                                        .length > 4 && (
                                                        <span className="px-2 py-1 bg-white/10 text-gray-400 rounded text-xs">
                                                            +
                                                            {course
                                                                .related_skills
                                                                .length -
                                                                4}{" "}
                                                            more
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                    {/* Career Paths */}
                                    {course.career_paths &&
                                        course.career_paths.length > 0 && (
                                            <div className="mb-4">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <TrendingUp className="w-4 h-4 text-primary" />
                                                    <span className="text-sm font-medium text-gray-300">
                                                        Career Paths:
                                                    </span>
                                                </div>
                                                <div className="flex flex-wrap gap-1">
                                                    {course.career_paths.map(
                                                        (path, idx) => (
                                                            <span
                                                                key={idx}
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
                                        {course.url && (
                                            <a
                                                href={course.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex-1 inline-flex items-center gap-2 text-primary font-bold border border-primary/30 bg-primary/10 px-4 py-2 hover:bg-primary hover:text-black transition-all rounded-lg justify-center"
                                            >
                                                Watch Course
                                                <ExternalLink className="w-4 h-4" />
                                            </a>
                                        )}
                                        <button
                                            onClick={() =>
                                                handleSaveToRoadmap(course)
                                            }
                                            disabled={
                                                savingCourse === course.id ||
                                                savedCourses.has(course.id)
                                            }
                                            className={`flex-1 inline-flex items-center gap-2 font-bold border px-4 py-2 transition-all rounded-lg justify-center ${
                                                savedCourses.has(course.id)
                                                    ? "border-green-500/30 bg-green-500/10 text-green-400 cursor-default"
                                                    : "border-accent/30 bg-accent/10 text-accent hover:bg-accent hover:text-black"
                                            }`}
                                        >
                                            {savingCourse === course.id ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    Saving...
                                                </>
                                            ) : savedCourses.has(course.id) ? (
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

                        {filteredCourses.length === 0 && (
                            <div className="glass-card rounded-2xl border border-white/10 p-12 text-center bg-white/5">
                                <Play className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-foreground mb-2">
                                    No courses found
                                </h3>
                                <p className="text-muted-foreground mb-4">
                                    {courses.length === 0
                                        ? "No courses are available yet."
                                        : "Try adjusting your filters to see more results."}
                                </p>
                                {courses.length > 0 && (
                                    <button
                                        onClick={() => {
                                            setSelectedProvider("All");
                                            setSelectedCategory("All");
                                            setShowFreeOnly(false);
                                        }}
                                        className="text-primary font-bold border border-primary/30 px-4 py-2 hover:bg-primary hover:text-black transition-all rounded-lg"
                                    >
                                        Reset Filters
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                <Footer />
            </div>
        </div>
    );
}
