import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
    X,
    Youtube,
    BookOpen,
    Users,
    FileText,
    ExternalLink,
    Check,
    Circle,
    GraduationCap,
    Lightbulb,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Skill } from "@/data/roadmapData";

interface SkillRequirement {
    id: string;
    type: "video" | "article" | "seminar" | "practice" | "course";
    title: string;
    description: string;
    url?: string;
    duration: string;
    completed: boolean;
}

interface SkillDetailsModalProps {
    skill: Skill;
    isOpen: boolean;
    onClose: () => void;
    onStatusChange: (status: "upcoming" | "in-progress" | "completed") => void;
}

// Generate sample requirements based on skill name
const generateRequirements = (skillName: string): SkillRequirement[] => {
    const baseRequirements: SkillRequirement[] = [
        {
            id: "1",
            type: "video",
            title: `Introduction to ${skillName}`,
            description: `Watch a comprehensive introduction video covering the fundamentals of ${skillName}.`,
            url: `https://www.youtube.com/results?search_query=${encodeURIComponent(
                skillName + " tutorial"
            )}`,
            duration: "15-30 min",
            completed: false,
        },
        {
            id: "2",
            type: "course",
            title: `${skillName} Fundamentals Course`,
            description: `Complete an online course to build a strong foundation in ${skillName}.`,
            url: `https://www.coursera.org/search?query=${encodeURIComponent(
                skillName
            )}`,
            duration: "2-4 hours",
            completed: false,
        },
        {
            id: "3",
            type: "article",
            title: `${skillName} Best Practices Guide`,
            description: `Read industry best practices and common patterns for ${skillName}.`,
            url: `https://medium.com/search?q=${encodeURIComponent(skillName)}`,
            duration: "20 min read",
            completed: false,
        },
        {
            id: "4",
            type: "practice",
            title: `Hands-on ${skillName} Project`,
            description: `Build a small project to apply your ${skillName} knowledge practically.`,
            duration: "2-5 hours",
            completed: false,
        },
        {
            id: "5",
            type: "seminar",
            title: `Join ${skillName} Community`,
            description: `Attend a webinar or join a community discussion about ${skillName}.`,
            url: `https://www.meetup.com/find/?keywords=${encodeURIComponent(
                skillName
            )}`,
            duration: "1 hour",
            completed: false,
        },
    ];

    return baseRequirements;
};

const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    video: Youtube,
    article: FileText,
    seminar: Users,
    practice: Lightbulb,
    course: GraduationCap,
};

const typeColors: Record<string, string> = {
    video: "text-red-400 bg-red-500/10",
    article: "text-blue-400 bg-blue-500/10",
    seminar: "text-purple-400 bg-purple-500/10",
    practice: "text-amber-400 bg-amber-500/10",
    course: "text-emerald-400 bg-emerald-500/10",
};

export const SkillDetailsModal = ({
    skill,
    isOpen,
    onClose,
    onStatusChange,
}: SkillDetailsModalProps) => {
    const [requirements, setRequirements] = useState<SkillRequirement[]>(() =>
        generateRequirements(skill.name)
    );

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const completedCount = requirements.filter((r) => r.completed).length;
    const progress = Math.round((completedCount / requirements.length) * 100);

    const toggleRequirement = (id: string) => {
        setRequirements((prev) =>
            prev.map((r) =>
                r.id === id ? { ...r, completed: !r.completed } : r
            )
        );
    };

    const handleMarkComplete = () => {
        onStatusChange("completed");
        onClose();
    };

    const handleMarkInProgress = () => {
        onStatusChange("in-progress");
        onClose();
    };

    const modalContent = (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl border-2 border-white/20 bg-black/80 backdrop-blur-xl shadow-[0_0_60px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)] animate-fade-up">
                {/* Header */}
                <div className="sticky top-0 z-10 flex items-start justify-between p-6 border-b border-white/10 bg-black/40 backdrop-blur-xl">
                    <div className="flex-1 pr-4">
                        <div className="flex items-center gap-2 mb-2">
                            <span
                                className={cn(
                                    "text-xs font-semibold px-2.5 py-1 rounded-full capitalize",
                                    skill.level === "beginner" &&
                                        "bg-emerald-500/10 text-emerald-400",
                                    skill.level === "intermediate" &&
                                        "bg-amber-500/10 text-amber-400",
                                    skill.level === "advanced" &&
                                        "bg-red-500/10 text-red-400",
                                    skill.level === "expert" &&
                                        "bg-purple-500/10 text-purple-400"
                                )}
                            >
                                {skill.level}
                            </span>
                            <span
                                className={cn(
                                    "text-xs font-semibold px-2.5 py-1 rounded-full capitalize",
                                    skill.status === "completed" &&
                                        "bg-emerald-500/10 text-emerald-400",
                                    skill.status === "in-progress" &&
                                        "bg-amber-500/10 text-amber-400",
                                    skill.status === "upcoming" &&
                                        "bg-muted text-muted-foreground"
                                )}
                            >
                                {skill.status.replace("-", " ")}
                            </span>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-1">
                            {skill.name}
                        </h2>
                        <p className="text-sm text-white/60">
                            {skill.description}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Progress Section */}
                <div className="p-6 border-b border-white/10">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-white/70">
                            Completion Progress
                        </span>
                        <span className="text-sm font-bold text-primary">
                            {completedCount}/{requirements.length} completed
                        </span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Requirements List */}
                <div className="p-6 overflow-y-auto max-h-[40vh] space-y-3">
                    <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-4">
                        Learning Requirements
                    </h3>
                    {requirements.map((req) => {
                        const Icon = typeIcons[req.type] || BookOpen;
                        return (
                            <div
                                key={req.id}
                                className={cn(
                                    "group flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer",
                                    req.completed
                                        ? "border-emerald-500/30 bg-emerald-500/5"
                                        : "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20"
                                )}
                                onClick={() => toggleRequirement(req.id)}
                            >
                                {/* Checkbox */}
                                <div
                                    className={cn(
                                        "w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all",
                                        req.completed
                                            ? "border-emerald-400 bg-emerald-500/20"
                                            : "border-white/30"
                                    )}
                                >
                                    {req.completed ? (
                                        <Check className="w-4 h-4 text-emerald-400" />
                                    ) : (
                                        <Circle className="w-3 h-3 text-white/30" />
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div
                                            className={cn(
                                                "w-6 h-6 rounded-md flex items-center justify-center",
                                                typeColors[req.type]
                                            )}
                                        >
                                            <Icon className="w-3.5 h-3.5" />
                                        </div>
                                        <span className="text-xs font-medium text-white/50 capitalize">
                                            {req.type}
                                        </span>
                                        <span className="text-xs text-white/30">
                                            • {req.duration}
                                        </span>
                                    </div>
                                    <h4
                                        className={cn(
                                            "font-semibold mb-1 transition-all",
                                            req.completed
                                                ? "text-white/50 line-through"
                                                : "text-white"
                                        )}
                                    >
                                        {req.title}
                                    </h4>
                                    <p className="text-sm text-white/50 line-clamp-2">
                                        {req.description}
                                    </p>
                                </div>

                                {/* External Link */}
                                {req.url && (
                                    <a
                                        href={req.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="p-2 rounded-lg text-white/30 hover:text-primary hover:bg-primary/10 transition-all"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                    </a>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Footer Actions */}
                <div className="sticky bottom-0 flex items-center justify-end gap-3 p-6 border-t border-white/10 bg-black/40 backdrop-blur-xl">
                    {skill.status !== "in-progress" && (
                        <button
                            onClick={handleMarkInProgress}
                            className="px-4 py-2.5 rounded-xl border-2 border-amber-500/30 bg-amber-500/10 text-amber-400 font-semibold hover:bg-amber-500/20 transition-all"
                        >
                            Mark In Progress
                        </button>
                    )}
                    {skill.status !== "completed" && (
                        <button
                            onClick={handleMarkComplete}
                            className="px-4 py-2.5 rounded-xl border-2 border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-semibold hover:bg-emerald-500/20 transition-all"
                        >
                            Mark Complete
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="px-4 py-2.5 rounded-xl border-2 border-white/20 bg-white/5 text-white font-semibold hover:bg-white/10 transition-all"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );

    // Use portal to render modal at body level for proper overlay
    return createPortal(modalContent, document.body);
};
