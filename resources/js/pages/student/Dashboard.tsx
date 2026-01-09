import { useState, useEffect } from "react";
import { HeroSection } from "@/components/roadmap/HeroSection";
import { SkillsRoadmap } from "@/components/roadmap/SkillsRoadmap";
import { CertificationsSection } from "@/components/roadmap/CertificationsSection";
import { OrganizationsSection } from "@/components/roadmap/OrganizationsSection";
import { ProjectsSection } from "@/components/roadmap/ProjectsSection";
import { CoursesSection } from "@/components/roadmap/CoursesSection";
import type {
    UserProfile,
    Skill,
    Certification,
    Organization,
    Project,
    Course,
} from "@/data/roadmapData";
import Navbar from "@/components/layouts/Navbar";
import Footer from "@/components/layouts/Footer";
import StarryBackground from "@/components/StarryBackground";
import api from "@/lib/axios";
import { Link } from "react-router-dom";
import { Rocket } from "lucide-react";
import { DashboardSkeleton } from "@/components/ui/skeletons";
import OnboardingTour from "@/components/OnboardingTour";

interface DashboardData {
    user: UserProfile;
    skills: Skill[];
    certifications: Certification[];
    organizations: Organization[];
    projects: Project[];
    courses: Course[];
}

const Dashboard = () => {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Initial data fetch with loading state
    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const response = await api.get("/dashboard");
            setData(response.data);
            setError(null);
        } catch (err: any) {
            console.error("Error fetching dashboard data:", err);
            setError(
                err.response?.data?.error || "Failed to load dashboard data"
            );
        } finally {
            setLoading(false);
        }
    };

    // Silent refresh without loading state (for skill updates)
    const refreshData = async () => {
        try {
            const response = await api.get("/dashboard");
            setData(response.data);
        } catch (err: any) {
            console.error("Error refreshing dashboard data:", err);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    // Loading state with skeleton
    if (loading) {
        return (
            <div className="min-h-screen relative font-sans space-theme text-foreground selection:bg-primary/30">
                <StarryBackground />
                <div className="relative z-10">
                    <Navbar />
                    <main className="p-8">
                        <DashboardSkeleton />
                    </main>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen relative font-sans space-theme text-foreground selection:bg-primary/30">
                <StarryBackground />
                <div className="relative z-10">
                    <Navbar />
                    <main className="p-8">
                        <div className="max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[60vh]">
                            <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-8 text-center max-w-md">
                                <p className="text-destructive font-medium mb-4">
                                    {error}
                                </p>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition"
                                >
                                    Try Again
                                </button>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    // No data or empty roadmap - prompt user to generate one
    const hasRoadmapData =
        data &&
        (data.skills.length > 0 ||
            data.certifications.length > 0 ||
            data.organizations.length > 0 ||
            data.projects.length > 0);

    if (!hasRoadmapData) {
        return (
            <div className="min-h-screen relative font-sans space-theme text-foreground selection:bg-primary/30">
                <StarryBackground />
                <div className="relative z-10">
                    <Navbar />
                    <main className="p-8">
                        <div className="max-w-7xl mx-auto">
                            {data && (
                                <HeroSection
                                    user={data.user}
                                    skills={data.skills}
                                />
                            )}
                            <div className="flex flex-col items-center justify-center py-20">
                                <div className="bg-card border border-border/50 rounded-2xl p-12 text-center max-w-lg shadow-soft">
                                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                                        <Rocket className="w-8 h-8 text-primary" />
                                    </div>
                                    <h2 className="font-display text-2xl font-bold text-foreground mb-3">
                                        Start Your Career Journey
                                    </h2>
                                    <p className="text-muted-foreground mb-6">
                                        You haven't generated a roadmap yet.
                                        Head over to the Roadmap page to create
                                        your personalized career path powered by
                                        AI.
                                    </p>
                                    <Link
                                        to="/student/roadmap"
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition shadow-lg"
                                    >
                                        <Rocket className="w-5 h-5" />
                                        Generate My Roadmap
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen relative font-sans space-theme text-foreground selection:bg-primary/30">
            <StarryBackground />

            <div className="relative z-10">
                <Navbar />

                {/* Main Content */}
                <main className="p-8">
                    <div className="max-w-7xl mx-auto">
                        <HeroSection
                            user={data.user}
                            skills={data.skills}
                            certifications={data.certifications}
                        />
                        {data.skills.length > 0 && (
                            <SkillsRoadmap
                                skills={data.skills}
                                onSkillUpdate={refreshData}
                            />
                        )}
                        {data.certifications.length > 0 && (
                            <CertificationsSection
                                certifications={data.certifications}
                                onCertUpdate={refreshData}
                            />
                        )}
                        {data.organizations.length > 0 && (
                            <OrganizationsSection
                                organizations={data.organizations}
                            />
                        )}
                        {data.projects.length > 0 && (
                            <ProjectsSection
                                projects={data.projects}
                                onProjectUpdate={refreshData}
                            />
                        )}
                        {data.courses.length > 0 && (
                            <CoursesSection
                                courses={data.courses}
                                onCourseUpdate={refreshData}
                            />
                        )}
                    </div>
                </main>

                <Footer />

                {/* Onboarding Tour for new users */}
                <OnboardingTour />
            </div>
        </div>
    );
};

export default Dashboard;
