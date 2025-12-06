import {
    X,
    Play,
    CheckCircle,
    ArrowRight,
    ExternalLink,
    Clock,
    Globe,
    Award,
    BookOpen,
    Loader2,
} from "lucide-react";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { Course } from "@/data/roadmapData";
import { Badge } from "@/components/ui/badge";

interface CourseDetailsModalProps {
    course: Course;
    isOpen: boolean;
    onClose: () => void;
    onStatusChange: (
        courseName: string,
        status: "upcoming" | "in-progress" | "completed"
    ) => Promise<void>;
}

export const CourseDetailsModal = ({
    course,
    isOpen,
    onClose,
    onStatusChange,
}: CourseDetailsModalProps) => {
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleStatusUpdate = async (
        status: "upcoming" | "in-progress" | "completed"
    ) => {
        setUpdating(true);
        try {
            await onStatusChange(course.name, status);
            if (status === "in-progress" && course.url && course.url !== "#") {
                window.open(course.url, "_blank");
            }
        } finally {
            setUpdating(false);
        }
    };

    const getProgress = () => {
        if (course.status === "completed") return 100;
        if (course.status === "in-progress") return 50;
        return 0;
    };

    const progress = getProgress();

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onClose}
            />
            <div className="relative w-full max-w-2xl bg-[#0a0a0a]/90 border border-white/10 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex items-start justify-between bg-white/5 rounded-t-2xl">
                    <div className="flex gap-4">
                        <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
                            <Play className="w-8 h-8 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-1">
                                {course.name}
                            </h2>
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                <span className="flex items-center gap-1">
                                    <Globe className="w-3 h-3" />
                                    {course.provider}
                                </span>
                                <span>•</span>
                                <span>{course.category}</span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-8">
                    {/* Status & Progress */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400 font-medium">
                                Course Progress
                            </span>
                            <span className="text-white font-bold">
                                {progress}%
                            </span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500 ease-out"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-400">
                            <span
                                className={cn(
                                    progress >= 0 ? "text-white" : ""
                                )}
                            >
                                Not Started
                            </span>
                            <span
                                className={cn(
                                    progress >= 50 ? "text-white" : ""
                                )}
                            >
                                In Progress
                            </span>
                            <span
                                className={cn(
                                    progress >= 100 ? "text-white" : ""
                                )}
                            >
                                Completed
                            </span>
                        </div>
                    </div>

                    {/* About */}
                    <div className="space-y-3">
                        <h3 className="text-lg font-semibold flex items-center gap-2 text-white">
                            <BookOpen className="w-5 h-5 text-white" />
                            About this Course
                        </h3>
                        <div className="glass-card p-4 rounded-xl border border-white/10 bg-black/20">
                            <p className="text-gray-300 leading-relaxed">
                                {course.description}
                            </p>
                        </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="glass-card p-4 rounded-xl border border-white/10 bg-black/20 space-y-1">
                            <span className="text-xs text-gray-400 block">
                                Duration
                            </span>
                            <div className="flex items-center gap-2 font-semibold text-white">
                                <Clock className="w-4 h-4 text-white" />
                                {course.duration}
                            </div>
                        </div>
                        <div className="glass-card p-4 rounded-xl border border-white/10 bg-black/20 space-y-1">
                            <span className="text-xs text-gray-400 block">
                                Cost
                            </span>
                            <div className="flex items-center gap-2 font-semibold text-white">
                                <Award className="w-4 h-4 text-white" />
                                {course.isFree ? "Free" : "Paid"}
                            </div>
                        </div>
                        {course.url && course.url !== "#" && (
                            <div className="glass-card p-4 rounded-xl border border-white/10 bg-black/20 space-y-1 col-span-2">
                                <span className="text-xs text-gray-400 block">
                                    Course Link
                                </span>
                                <a
                                    href={course.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 font-semibold text-white/90 hover:text-white transition-colors truncate"
                                >
                                    <ExternalLink className="w-4 h-4 flex-shrink-0" />
                                    <span className="truncate">
                                        {course.url}
                                    </span>
                                </a>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="glass-card p-6 rounded-xl border border-white/10 bg-primary/5 space-y-4">
                        <h3 className="font-semibold text-white">
                            Take Action
                        </h3>
                        <div className="flex flex-col sm:flex-row gap-3">
                            {course.status !== "completed" ? (
                                <>
                                    <button
                                        onClick={() =>
                                            handleStatusUpdate("in-progress")
                                        }
                                        disabled={
                                            updating ||
                                            course.status === "in-progress"
                                        }
                                        className={cn(
                                            "flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold transition-all border-2",
                                            course.status === "in-progress"
                                                ? "border-amber-500/30 bg-amber-500/10 text-amber-400 cursor-default"
                                                : "border-white/30 bg-primary/10 text-white hover:bg-primary/20 hover:border-primary/50"
                                        )}
                                    >
                                        {updating ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : course.status === "in-progress" ? (
                                            <>
                                                <Play className="w-4 h-4 fill-current" />
                                                In Progress
                                            </>
                                        ) : (
                                            <>
                                                <Play className="w-4 h-4 fill-current" />
                                                Start Course
                                            </>
                                        )}
                                    </button>

                                    {course.status === "in-progress" && (
                                        <button
                                            onClick={() =>
                                                handleStatusUpdate("completed")
                                            }
                                            disabled={updating}
                                            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold transition-all border-2 border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                                        >
                                            {updating ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <>
                                                    <CheckCircle className="w-4 h-4" />
                                                    Mark Complete
                                                </>
                                            )}
                                        </button>
                                    )}
                                </>
                            ) : (
                                <div className="w-full p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center gap-2 text-emerald-400 font-bold">
                                    <CheckCircle className="w-5 h-5" />
                                    Course Completed
                                </div>
                            )}
                        </div>

                        {course.url && course.url !== "#" && (
                            <a
                                href={course.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors w-full justify-center mt-2 group"
                            >
                                Visit Course Page
                                <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};
