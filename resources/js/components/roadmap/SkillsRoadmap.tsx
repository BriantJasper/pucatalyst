import { useState } from "react";
import {
    Check,
    Play,
    Lock,
    Code,
    Braces,
    Atom,
    Server,
    Database,
    Network,
    Loader2,
} from "lucide-react";
import type { Skill } from "@/data/roadmapData";
import { cn } from "@/lib/utils";
import api from "@/lib/axios";
import { useToast } from "@/components/ui/use-toast";
import { SkillDetailsModal } from "./SkillDetailsModal";

interface SkillsRoadmapProps {
    skills: Skill[];
    onSkillUpdate?: () => void;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    Code,
    Braces,
    Atom,
    Server,
    Database,
    Network,
};

type SkillStatus = "upcoming" | "in-progress" | "completed";

export const SkillsRoadmap = ({
    skills,
    onSkillUpdate,
}: SkillsRoadmapProps) => {
    const [updatingSkill, setUpdatingSkill] = useState<string | null>(null);
    const [localSkills, setLocalSkills] = useState<Skill[]>(skills);
    const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { toast } = useToast();

    const handleSkillClick = (skill: Skill) => {
        setSelectedSkill(skill);
        setIsModalOpen(true);
    };

    const handleStatusChange = async (skill: Skill, newStatus: SkillStatus) => {
        setUpdatingSkill(skill.id);
        setIsModalOpen(false);

        try {
            await api.patch("/roadmaps/skill-status", {
                skill_name: skill.name,
                status: newStatus,
            });

            // Update local state
            setLocalSkills((prev) =>
                prev.map((s) =>
                    s.id === skill.id ? { ...s, status: newStatus } : s
                )
            );

            toast({
                title: "Skill Updated",
                description: `${skill.name} marked as ${newStatus.replace(
                    "-",
                    " "
                )}`,
            });

            // Notify parent to refresh dashboard data
            onSkillUpdate?.();
        } catch (error) {
            console.error("Failed to update skill status:", error);
            toast({
                variant: "destructive",
                title: "Update Failed",
                description: "Failed to update skill status. Please try again.",
            });
        } finally {
            setUpdatingSkill(null);
        }
    };

    return (
        <section className="mb-12 animate-fade-up stagger-1">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Code className="w-5 h-5 text-primary" />
                </div>
                <div>
                    <h2 className="font-display text-2xl font-bold text-foreground">
                        Skills to Master
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Click on skills to update progress
                    </p>
                </div>
            </div>

            {/* Desktop Timeline */}
            <div className="hidden md:block relative">
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-border -translate-y-1/2 rounded-full" />

                <div className="relative flex justify-between">
                    {localSkills.map((skill, index) => {
                        const Icon = iconMap[skill.icon] || Code;
                        const isCompleted = skill.status === "completed";
                        const isCurrent = skill.status === "in-progress";
                        const isUpdating = updatingSkill === skill.id;

                        return (
                            <div
                                key={skill.id}
                                className="flex flex-col items-center group"
                                style={{
                                    width: `${100 / localSkills.length}%`,
                                }}
                            >
                                {/* Progress Line */}
                                {index > 0 && (
                                    <div
                                        className={cn(
                                            "absolute h-0.5 top-5 -translate-y-1/2",
                                            isCompleted || isCurrent
                                                ? "bg-primary"
                                                : "bg-border"
                                        )}
                                        style={{
                                            left: `${
                                                ((index - 1) /
                                                    localSkills.length) *
                                                    100 +
                                                100 / localSkills.length / 2
                                            }%`,
                                            width: `${
                                                100 / localSkills.length
                                            }%`,
                                        }}
                                    />
                                )}

                                {/* Node */}
                                <button
                                    onClick={() => handleSkillClick(skill)}
                                    disabled={isUpdating}
                                    className={cn(
                                        "progress-step z-10 cursor-pointer transition-transform hover:scale-110",
                                        isCompleted && "completed",
                                        isCurrent && "current",
                                        !isCompleted &&
                                            !isCurrent &&
                                            "upcoming",
                                        isUpdating && "opacity-50"
                                    )}
                                    title={`Click to change status (current: ${skill.status})`}
                                >
                                    {isUpdating ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : isCompleted ? (
                                        <Check className="w-5 h-5" />
                                    ) : isCurrent ? (
                                        <Play className="w-4 h-4" />
                                    ) : (
                                        <Lock className="w-4 h-4" />
                                    )}
                                </button>

                                {/* Card - Click to open modal */}
                                <button
                                    onClick={() => handleSkillClick(skill)}
                                    className={cn(
                                        "mt-4 p-4 bg-card rounded-xl border transition-all duration-300 w-full max-w-[160px] text-left",
                                        "shadow-soft hover:shadow-medium group-hover:-translate-y-1 cursor-pointer",
                                        isCompleted && "border-primary/30",
                                        isCurrent &&
                                            "border-primary shadow-glow",
                                        !isCompleted &&
                                            !isCurrent &&
                                            "border-border/50 opacity-70"
                                    )}
                                >
                                    <div
                                        className={cn(
                                            "w-8 h-8 rounded-lg flex items-center justify-center mb-2",
                                            isCompleted &&
                                                "bg-primary/10 text-primary",
                                            isCurrent &&
                                                "bg-primary/10 text-primary",
                                            !isCompleted &&
                                                !isCurrent &&
                                                "bg-secondary text-muted-foreground"
                                        )}
                                    >
                                        <Icon className="w-4 h-4" />
                                    </div>
                                    <h3 className="font-semibold text-sm text-foreground mb-1 line-clamp-2">
                                        {skill.name}
                                    </h3>
                                    <span
                                        className={cn(
                                            "text-xs font-medium capitalize px-2 py-0.5 rounded-full inline-block",
                                            skill.level === "beginner" &&
                                                "bg-success/10 text-success",
                                            skill.level === "intermediate" &&
                                                "bg-warning/10 text-warning",
                                            skill.level === "advanced" &&
                                                "bg-accent/10 text-accent",
                                            skill.level === "expert" &&
                                                "bg-destructive/10 text-destructive"
                                        )}
                                    >
                                        {skill.level}
                                    </span>
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Mobile Stack */}
            <div className="md:hidden space-y-3">
                {localSkills.map((skill) => {
                    const Icon = iconMap[skill.icon] || Code;
                    const isCompleted = skill.status === "completed";
                    const isCurrent = skill.status === "in-progress";
                    const isUpdating = updatingSkill === skill.id;

                    return (
                        <button
                            key={skill.id}
                            onClick={() => handleSkillClick(skill)}
                            disabled={isUpdating}
                            className={cn(
                                "w-full flex items-center gap-4 p-4 bg-card rounded-xl border transition-all duration-300",
                                "shadow-soft hover:scale-[1.02] active:scale-[0.98]",
                                isCompleted && "border-primary/30",
                                isCurrent && "border-primary shadow-glow",
                                !isCompleted &&
                                    !isCurrent &&
                                    "border-border/50 opacity-70",
                                isUpdating && "opacity-50"
                            )}
                        >
                            <div
                                className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                                    isCompleted &&
                                        "bg-primary text-primary-foreground",
                                    isCurrent && "bg-primary/10 text-primary",
                                    !isCompleted &&
                                        !isCurrent &&
                                        "bg-secondary text-muted-foreground"
                                )}
                            >
                                {isUpdating ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : isCompleted ? (
                                    <Check className="w-5 h-5" />
                                ) : (
                                    <Icon className="w-5 h-5" />
                                )}
                            </div>

                            <div className="flex-1 min-w-0 text-left">
                                <h3 className="font-semibold text-foreground truncate">
                                    {skill.name}
                                </h3>
                                <p className="text-xs text-muted-foreground line-clamp-1">
                                    {skill.description}
                                </p>
                            </div>

                            <span
                                className={cn(
                                    "text-xs font-medium capitalize px-2 py-0.5 rounded-full flex-shrink-0",
                                    skill.level === "beginner" &&
                                        "bg-success/10 text-success",
                                    skill.level === "intermediate" &&
                                        "bg-warning/10 text-warning",
                                    skill.level === "advanced" &&
                                        "bg-accent/10 text-accent"
                                )}
                            >
                                {skill.level}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Skill Details Modal */}
            {selectedSkill && (
                <SkillDetailsModal
                    skill={
                        localSkills.find((s) => s.id === selectedSkill.id) ||
                        selectedSkill
                    }
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setSelectedSkill(null);
                    }}
                    onStatusChange={(status) => {
                        if (selectedSkill) {
                            handleStatusChange(selectedSkill, status);
                        }
                    }}
                />
            )}
        </section>
    );
};
