import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
    X,
    Github,
    ExternalLink,
    Check,
    Circle,
    FileCode,
    Video,
    BookOpen,
    Rocket,
    Star,
    Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Project } from "@/data/roadmapData";
import { Badge } from "@/components/ui/badge";

interface ProjectMilestone {
    id: string;
    title: string;
    description: string;
    type: "setup" | "build" | "feature" | "test" | "deploy";
    estimatedTime: string;
    completed: boolean;
    resources?: {
        title: string;
        url: string;
        type: "video" | "article" | "github";
    }[];
}

interface ProjectDetailsModalProps {
    project: Project;
    isOpen: boolean;
    onClose: () => void;
    onStatusChange: (status: "upcoming" | "in-progress" | "completed") => void;
}

// Generate milestones based on project name
const generateMilestones = (projectName: string): ProjectMilestone[] => {
    return [
        {
            id: "1",
            title: "Project Setup",
            description: `Initialize the repository and set up the development environment for ${projectName}.`,
            type: "setup",
            estimatedTime: "30 min",
            completed: false,
            resources: [
                {
                    title: "GitHub - Create new repository",
                    url: "https://github.com/new",
                    type: "github",
                },
                {
                    title: `${projectName} project setup tutorial`,
                    url: `https://www.youtube.com/results?search_query=${encodeURIComponent(
                        projectName + " project setup"
                    )}`,
                    type: "video",
                },
            ],
        },
        {
            id: "2",
            title: "Core Structure",
            description: `Build the basic structure and components for ${projectName}.`,
            type: "build",
            estimatedTime: "2-3 hours",
            completed: false,
            resources: [
                {
                    title: `${projectName} architecture guide`,
                    url: `https://dev.to/search?q=${encodeURIComponent(
                        projectName
                    )}`,
                    type: "article",
                },
            ],
        },
        {
            id: "3",
            title: "Main Features",
            description: `Implement the primary features and functionality.`,
            type: "feature",
            estimatedTime: "4-6 hours",
            completed: false,
            resources: [
                {
                    title: `Building ${projectName} - Complete Tutorial`,
                    url: `https://www.youtube.com/results?search_query=${encodeURIComponent(
                        "build " + projectName + " tutorial"
                    )}`,
                    type: "video",
                },
            ],
        },
        {
            id: "4",
            title: "Testing & Polish",
            description: `Add tests, fix bugs, and polish the user interface.`,
            type: "test",
            estimatedTime: "1-2 hours",
            completed: false,
            resources: [
                {
                    title: "Testing best practices",
                    url: "https://testing-library.com/docs/",
                    type: "article",
                },
            ],
        },
        {
            id: "5",
            title: "Deploy & Share",
            description: `Deploy your project and add it to your portfolio.`,
            type: "deploy",
            estimatedTime: "1 hour",
            completed: false,
            resources: [
                {
                    title: "Deploy with Vercel",
                    url: "https://vercel.com/new",
                    type: "github",
                },
                {
                    title: "Deploy with Netlify",
                    url: "https://app.netlify.com/start",
                    type: "github",
                },
            ],
        },
    ];
};

const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    setup: FileCode,
    build: Rocket,
    feature: Star,
    test: Check,
    deploy: ExternalLink,
};

const typeColors: Record<string, string> = {
    setup: "text-blue-400 bg-blue-500/10",
    build: "text-amber-400 bg-amber-500/10",
    feature: "text-purple-400 bg-purple-500/10",
    test: "text-emerald-400 bg-emerald-500/10",
    deploy: "text-pink-400 bg-pink-500/10",
};

const resourceIcons: Record<
    string,
    React.ComponentType<{ className?: string }>
> = {
    video: Video,
    article: BookOpen,
    github: Github,
};

export const ProjectDetailsModal = ({
    project,
    isOpen,
    onClose,
    onStatusChange,
}: ProjectDetailsModalProps) => {
    const [milestones, setMilestones] = useState<ProjectMilestone[]>(() =>
        generateMilestones(project.name)
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

    const completedCount = milestones.filter((m) => m.completed).length;
    const progress = Math.round((completedCount / milestones.length) * 100);

    const toggleMilestone = (id: string) => {
        setMilestones((prev) =>
            prev.map((m) =>
                m.id === id ? { ...m, completed: !m.completed } : m
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
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span
                                className={cn(
                                    "text-xs font-semibold px-2.5 py-1 rounded-full capitalize",
                                    project.difficulty === "beginner" &&
                                        "bg-emerald-500/10 text-emerald-400",
                                    project.difficulty === "intermediate" &&
                                        "bg-amber-500/10 text-amber-400",
                                    project.difficulty === "advanced" &&
                                        "bg-red-500/10 text-red-400"
                                )}
                            >
                                {project.difficulty}
                            </span>
                            <Badge variant="outline" className="text-xs">
                                {project.category}
                            </Badge>
                            <span
                                className={cn(
                                    "text-xs font-semibold px-2.5 py-1 rounded-full capitalize",
                                    project.status === "completed" &&
                                        "bg-emerald-500/10 text-emerald-400",
                                    project.status === "in-progress" &&
                                        "bg-amber-500/10 text-amber-400",
                                    project.status === "upcoming" &&
                                        "bg-muted text-muted-foreground"
                                )}
                            >
                                {project.status.replace("-", " ")}
                            </span>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-1">
                            {project.name}
                        </h2>
                        <p className="text-sm text-white/60 mb-2">
                            {project.description}
                        </p>
                        <div className="flex items-center gap-2 text-white/50">
                            <Clock className="w-4 h-4" />
                            <span className="text-xs">
                                {project.estimatedTime}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Skills Preview */}
                <div className="px-6 pt-4 flex flex-wrap gap-1.5">
                    {project.skills.map((skill) => (
                        <Badge
                            key={skill}
                            className="bg-primary/10 text-primary hover:bg-primary/20 text-xs"
                        >
                            {skill}
                        </Badge>
                    ))}
                </div>

                {/* Progress Section */}
                <div className="p-6 border-b border-white/10">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-white/70">
                            Project Progress
                        </span>
                        <span className="text-sm font-bold text-primary">
                            {completedCount}/{milestones.length} milestones
                        </span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-warning to-accent transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Milestones List */}
                <div className="p-6 overflow-y-auto max-h-[35vh] space-y-3">
                    <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-4">
                        Project Milestones
                    </h3>
                    {milestones.map((milestone, index) => {
                        const Icon = typeIcons[milestone.type] || Rocket;
                        return (
                            <div key={milestone.id} className="space-y-2">
                                <div
                                    className={cn(
                                        "group flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer",
                                        milestone.completed
                                            ? "border-emerald-500/30 bg-emerald-500/5"
                                            : "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20"
                                    )}
                                    onClick={() =>
                                        toggleMilestone(milestone.id)
                                    }
                                >
                                    {/* Step Number */}
                                    <div
                                        className={cn(
                                            "w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all",
                                            milestone.completed
                                                ? "border-emerald-400 bg-emerald-500/20"
                                                : "border-white/30"
                                        )}
                                    >
                                        {milestone.completed ? (
                                            <Check className="w-4 h-4 text-emerald-400" />
                                        ) : (
                                            <span className="text-sm font-bold text-white/50">
                                                {index + 1}
                                            </span>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <div
                                                className={cn(
                                                    "w-6 h-6 rounded-md flex items-center justify-center",
                                                    typeColors[milestone.type]
                                                )}
                                            >
                                                <Icon className="w-3.5 h-3.5" />
                                            </div>
                                            <span className="text-xs font-medium text-white/50 capitalize">
                                                {milestone.type}
                                            </span>
                                            <span className="text-xs text-white/30">
                                                • {milestone.estimatedTime}
                                            </span>
                                        </div>
                                        <h4
                                            className={cn(
                                                "font-semibold mb-1 transition-all",
                                                milestone.completed
                                                    ? "text-white/50 line-through"
                                                    : "text-white"
                                            )}
                                        >
                                            {milestone.title}
                                        </h4>
                                        <p className="text-sm text-white/50 line-clamp-2">
                                            {milestone.description}
                                        </p>
                                    </div>
                                </div>

                                {/* Resources */}
                                {milestone.resources &&
                                    milestone.resources.length > 0 && (
                                        <div className="ml-12 flex flex-wrap gap-2">
                                            {milestone.resources.map(
                                                (resource, rIndex) => {
                                                    const ResourceIcon =
                                                        resourceIcons[
                                                            resource.type
                                                        ] || ExternalLink;
                                                    return (
                                                        <a
                                                            key={rIndex}
                                                            href={resource.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white/60 hover:text-white hover:bg-white/10 transition-all"
                                                        >
                                                            <ResourceIcon className="w-3.5 h-3.5" />
                                                            <span className="truncate max-w-[150px]">
                                                                {resource.title}
                                                            </span>
                                                        </a>
                                                    );
                                                }
                                            )}
                                        </div>
                                    )}
                            </div>
                        );
                    })}
                </div>

                {/* Footer Actions */}
                <div className="sticky bottom-0 flex items-center justify-end gap-3 p-6 border-t border-white/10 bg-black/40 backdrop-blur-xl">
                    {project.status !== "in-progress" && (
                        <button
                            onClick={handleMarkInProgress}
                            className="px-4 py-2.5 rounded-xl border-2 border-amber-500/30 bg-amber-500/10 text-amber-400 font-semibold hover:bg-amber-500/20 transition-all"
                        >
                            Start Building
                        </button>
                    )}
                    {project.status !== "completed" && (
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
