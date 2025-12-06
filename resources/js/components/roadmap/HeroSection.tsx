import {
    Target,
    TrendingUp,
    Award,
    Calendar,
    BadgeCheck,
    BookOpen,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import type { UserProfile, Skill, Certification } from "@/data/roadmapData";
import { useMemo } from "react";

interface HeroSectionProps {
    user: UserProfile;
    skills?: Skill[];
    certifications?: Certification[];
}

export const HeroSection = ({
    user,
    skills = [],
    certifications = [],
}: HeroSectionProps) => {
    // Calculate skill statistics dynamically
    const skillStats = useMemo(() => {
        const completed = skills.filter(
            (skill) => skill.status === "completed"
        ).length;
        const inProgress = skills.filter(
            (skill) => skill.status === "in-progress"
        ).length;
        const total = skills.length;
        return { completed, inProgress, total };
    }, [skills]);

    // Calculate certification statistics
    const certStats = useMemo(() => {
        // Check if certifications have status field (from extended type)
        const completed = certifications.filter(
            (cert: any) => cert.status === "completed"
        ).length;
        const inProgress = certifications.filter(
            (cert: any) => cert.status === "in-progress"
        ).length;
        const total = certifications.length;
        return { completed, inProgress, total };
    }, [certifications]);

    return (
        <section className="relative overflow-hidden bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl p-8 md:p-12 mb-10 animate-fade-up shadow-lg">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 text-muted-foreground mb-3">
                            <Calendar className="w-4 h-4" />
                            <span className="text-sm font-medium">
                                {user.year} • {user.major}
                            </span>
                        </div>

                        <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3">
                            Hi, {user.name.split(" ")[0]}! 👋
                        </h1>

                        <div className="flex items-center gap-2 mb-6">
                            <Target className="w-5 h-5 text-primary" />
                            <p className="text-lg md:text-xl text-muted-foreground">
                                Your path to becoming a{" "}
                                <span className="gradient-text font-semibold">
                                    {user.careerGoal}
                                </span>
                            </p>
                        </div>

                        <div className="max-w-md">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-muted-foreground">
                                    Roadmap Progress
                                </span>
                                <span className="text-sm font-bold text-primary">
                                    {user.completionPercentage}%
                                </span>
                            </div>
                            <Progress
                                value={user.completionPercentage}
                                className="h-2.5"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <StatCard
                            icon={<Award className="w-5 h-5" />}
                            value={skillStats.completed.toString()}
                            label="Skills Mastered"
                            color="primary"
                        />
                        <StatCard
                            icon={<TrendingUp className="w-5 h-5" />}
                            value={skillStats.inProgress.toString()}
                            label="Skills In Progress"
                            color="accent"
                        />
                        <StatCard
                            icon={<BadgeCheck className="w-5 h-5" />}
                            value={certStats.completed.toString()}
                            label="Certs Earned"
                            color="success"
                        />
                        <StatCard
                            icon={<BookOpen className="w-5 h-5" />}
                            value={certStats.inProgress.toString()}
                            label="Certs In Progress"
                            color="warning"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};

interface StatCardProps {
    icon: React.ReactNode;
    value: string;
    label: string;
    color: "primary" | "accent" | "success" | "warning";
}

const StatCard = ({ icon, value, label, color }: StatCardProps) => {
    const colorClasses = {
        primary: "bg-primary/10 text-primary",
        accent: "bg-accent/10 text-accent",
        success: "bg-emerald-500/10 text-emerald-400",
        warning: "bg-amber-500/10 text-amber-400",
    };

    return (
        <div className="bg-card rounded-xl p-4 shadow-soft border border-border/50 card-hover">
            <div
                className={`w-10 h-10 rounded-lg ${colorClasses[color]} flex items-center justify-center mb-3`}
            >
                {icon}
            </div>
            <p className="text-2xl font-bold font-display text-foreground">
                {value}
            </p>
            <p className="text-xs text-muted-foreground">{label}</p>
        </div>
    );
};
