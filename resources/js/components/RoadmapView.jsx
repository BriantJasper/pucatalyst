import React from "react";
import {
    Map,
    CheckCircle,
    Circle,
    BookOpen,
    Briefcase,
    Award,
    Target,
    TrendingUp,
    Rocket,
} from "lucide-react";

const RoadmapView = ({ roadmap }) => {
    if (!roadmap) {
        return (
            <div className="text-center p-8 bg-black/30 backdrop-blur-md rounded-2xl border border-white/10">
                <Map className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <h3 className="text-lg font-medium text-foreground">
                    No Roadmap Generated Yet
                </h3>
                <p className="text-muted-foreground mt-1">
                    Complete your profile and skills assessment to generate a
                    personalized career roadmap.
                </p>
                <button className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-bold">
                    Generate Roadmap
                </button>
            </div>
        );
    }

    // Calculate skill statistics
    const skillsCount = roadmap.skills_to_learn?.length || 0;
    const certsCount = roadmap.certificates_to_earn?.length || 0;
    const orgsCount = roadmap.organizations_to_join?.length || 0;

    return (
        <div className="space-y-8">
            {/* Header - Hero Section Style */}
            <div className="relative overflow-hidden bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl p-8 md:p-10 shadow-lg animate-fade-up">
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                                    <Target className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                                        {roadmap.career_goal} Roadmap
                                    </h2>
                                    <p className="text-muted-foreground">
                                        Success Probability:{" "}
                                        <span className="font-bold text-primary">
                                            {(
                                                roadmap.success_probability *
                                                100
                                            ).toFixed(0)}
                                            %
                                        </span>
                                    </p>
                                </div>
                            </div>

                            {roadmap.ai_insights && (
                                <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
                                    <p className="text-sm text-muted-foreground">
                                        <span className="font-bold text-primary">
                                            AI Insight:
                                        </span>{" "}
                                        {roadmap.ai_insights}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col items-end gap-3">
                            <div className="text-sm text-muted-foreground font-medium">
                                Progress
                            </div>
                            <div className="w-40 bg-white/10 rounded-full h-3 overflow-hidden">
                                <div
                                    className="bg-gradient-to-r from-primary to-accent h-3 rounded-full transition-all duration-500"
                                    style={{
                                        width: `${
                                            roadmap.completion_percentage || 0
                                        }%`,
                                    }}
                                ></div>
                            </div>
                            <div className="text-sm font-bold text-primary">
                                {roadmap.completion_percentage || 0}% Completed
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-3 gap-4 mt-6">
                        <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-2">
                                <TrendingUp className="w-5 h-5 text-primary" />
                            </div>
                            <p className="text-2xl font-bold text-foreground">
                                {skillsCount}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Target Skills
                            </p>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mx-auto mb-2">
                                <Award className="w-5 h-5 text-accent" />
                            </div>
                            <p className="text-2xl font-bold text-foreground">
                                {certsCount}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Certifications
                            </p>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center mx-auto mb-2">
                                <Briefcase className="w-5 h-5 text-success" />
                            </div>
                            <p className="text-2xl font-bold text-foreground">
                                {orgsCount}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Organizations
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Semester Plans */}
            {roadmap.semester_plans && roadmap.semester_plans.length > 0 && (
                <div className="space-y-6 animate-fade-up stagger-1">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Rocket className="w-5 h-5 text-primary" />
                        </div>
                        <h3 className="font-display text-xl font-bold text-foreground">
                            Your Journey
                        </h3>
                    </div>
                    <div className="relative border-l-2 border-primary/30 ml-5 space-y-6 pb-4">
                        {roadmap.semester_plans.map((semester, index) => (
                            <div key={index} className="relative pl-8">
                                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-primary border-4 border-background shadow-lg shadow-primary/20"></div>
                                <div className="glass-card p-6 rounded-xl shadow-lg hover:bg-white/5 transition-all">
                                    <h4 className="text-lg font-bold text-foreground mb-3">
                                        {semester.semester_name}
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {semester.courses && (
                                            <div className="space-y-2">
                                                <h5 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                                                    <BookOpen className="w-4 h-4 text-primary" />
                                                    Courses
                                                </h5>
                                                <ul className="text-sm text-gray-300 list-disc list-inside pl-1 space-y-1">
                                                    {semester.courses.map(
                                                        (course, i) => (
                                                            <li key={i}>
                                                                {course}
                                                            </li>
                                                        )
                                                    )}
                                                </ul>
                                            </div>
                                        )}
                                        {semester.activities && (
                                            <div className="space-y-2">
                                                <h5 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                                                    <Briefcase className="w-4 h-4 text-accent" />
                                                    Activities
                                                </h5>
                                                <ul className="text-sm text-gray-300 list-disc list-inside pl-1 space-y-1">
                                                    {semester.activities.map(
                                                        (activity, i) => (
                                                            <li key={i}>
                                                                {activity}
                                                            </li>
                                                        )
                                                    )}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* AI Generated Lists Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-up stagger-2">
                {/* Skills */}
                {roadmap.skills_to_learn &&
                    roadmap.skills_to_learn.length > 0 && (
                        <div className="glass-card p-6 rounded-2xl shadow-lg">
                            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <CheckCircle className="w-4 h-4 text-primary" />
                                </div>
                                Target Skills
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {roadmap.skills_to_learn.map((item, index) => {
                                    const skillName = Array.isArray(item)
                                        ? item[0]
                                        : item;
                                    return (
                                        <span
                                            key={index}
                                            className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm font-medium border border-primary/20 hover:bg-primary/20 transition-colors"
                                        >
                                            {skillName}
                                        </span>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                {/* Certificates */}
                {roadmap.certificates_to_earn &&
                    roadmap.certificates_to_earn.length > 0 && (
                        <div className="glass-card p-6 rounded-2xl shadow-lg">
                            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                                    <Award className="w-4 h-4 text-accent" />
                                </div>
                                Certifications
                            </h3>
                            <ul className="space-y-2">
                                {roadmap.certificates_to_earn.map(
                                    (item, index) => {
                                        const certName = Array.isArray(item)
                                            ? item[0]
                                            : item;
                                        return (
                                            <li
                                                key={index}
                                                className="flex items-start gap-3 text-sm text-gray-300 p-2 rounded-lg hover:bg-white/5 transition-colors"
                                            >
                                                <Circle className="w-2 h-2 mt-2 text-accent fill-current flex-shrink-0" />
                                                <span>{certName}</span>
                                            </li>
                                        );
                                    }
                                )}
                            </ul>
                        </div>
                    )}

                {/* Organizations */}
                {roadmap.organizations_to_join &&
                    roadmap.organizations_to_join.length > 0 && (
                        <div className="glass-card p-6 rounded-2xl shadow-lg">
                            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
                                    <Briefcase className="w-4 h-4 text-success" />
                                </div>
                                Organizations
                            </h3>
                            <ul className="space-y-2">
                                {roadmap.organizations_to_join.map(
                                    (item, index) => {
                                        const orgName = Array.isArray(item)
                                            ? item[0]
                                            : item;
                                        return (
                                            <li
                                                key={index}
                                                className="flex items-start gap-3 text-sm text-gray-300 p-2 rounded-lg hover:bg-white/5 transition-colors"
                                            >
                                                <Circle className="w-2 h-2 mt-2 text-success fill-current flex-shrink-0" />
                                                <span>{orgName}</span>
                                            </li>
                                        );
                                    }
                                )}
                            </ul>
                        </div>
                    )}

                {/* Projects */}
                {roadmap.projects_to_build &&
                    roadmap.projects_to_build.length > 0 && (
                        <div className="glass-card p-6 rounded-2xl shadow-lg">
                            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center">
                                    <Target className="w-4 h-4 text-destructive" />
                                </div>
                                Projects
                            </h3>
                            <ul className="space-y-2">
                                {roadmap.projects_to_build.map(
                                    (item, index) => {
                                        const projName = Array.isArray(item)
                                            ? item[0]
                                            : item;
                                        return (
                                            <li
                                                key={index}
                                                className="flex items-start gap-3 text-sm text-gray-300 p-2 rounded-lg hover:bg-white/5 transition-colors"
                                            >
                                                <Circle className="w-2 h-2 mt-2 text-destructive fill-current flex-shrink-0" />
                                                <span>{projName}</span>
                                            </li>
                                        );
                                    }
                                )}
                            </ul>
                        </div>
                    )}
            </div>

            {/* Gap Analysis */}
            {roadmap.gap_analysis && (
                <div className="glass-card p-6 rounded-2xl shadow-lg animate-fade-up stagger-3">
                    <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center">
                            <TrendingUp className="w-4 h-4 text-warning" />
                        </div>
                        Gap Analysis
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl">
                            <h4 className="font-medium text-destructive mb-2">
                                Missing Skills
                            </h4>
                            <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                                {roadmap.gap_analysis.missing_skills &&
                                    roadmap.gap_analysis.missing_skills.map(
                                        (skill, i) => <li key={i}>{skill}</li>
                                    )}
                            </ul>
                        </div>
                        <div className="p-4 bg-success/10 border border-success/20 rounded-xl">
                            <h4 className="font-medium text-success mb-2">
                                Acquired Skills
                            </h4>
                            <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                                {roadmap.gap_analysis.acquired_skills &&
                                    roadmap.gap_analysis.acquired_skills.map(
                                        (skill, i) => <li key={i}>{skill}</li>
                                    )}
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoadmapView;
