import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
    Rocket,
    Target,
    Users,
    TrendingUp,
    Award,
    BookOpen,
    Briefcase,
    Brain,
    ArrowRight,
    Sparkles,
} from "lucide-react";
import LoadingAnimation from "../components/ui/LoadingAnimation";
import Roadmap3D from "../components/Roadmap3D";

export default function LandingPage() {
    const [showLoading, setShowLoading] = useState(true);

    useEffect(() => {
        // Show loading for 3 seconds on initial mount/refresh
        const timer = setTimeout(() => {
            setShowLoading(false);
        }, 2500); // Total duration including fade out

        return () => clearTimeout(timer);
    }, []);

    if (showLoading) {
        return <LoadingAnimation />;
    }

    return (
        <div className="min-h-screen bg-[#0B0B15] text-white selection:bg-primary-500 selection:text-white">
            {/* Navbar */}
            <nav className="bg-[#0B0B15]/80 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-2">
                            <Rocket className="w-8 h-8 text-primary-400" />
                            <span className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
                                PU Catalyst
                            </span>
                        </div>
                        <div className="hidden md:flex items-center gap-6">
                            <a
                                href="#features"
                                className="text-gray-300 hover:text-primary-400 transition"
                            >
                                Features
                            </a>
                            <Link
                                to="/login"
                                className="text-gray-300 hover:text-primary-400 transition"
                            >
                                Login
                            </Link>
                            <Link
                                to="/register"
                                className="bg-primary-600 text-white px-5 py-2 rounded-lg hover:bg-primary-500 transition shadow-[0_0_15px_rgba(37,99,235,0.5)]"
                            >
                                Get Started
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-20 pb-32 px-4 overflow-hidden">
                {/* Background Elements */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-primary-600/20 rounded-full blur-[100px]"></div>
                    <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary-600/20 rounded-full blur-[100px]"></div>
                </div>

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="text-center lg:text-left">
                            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-primary-300 px-4 py-2 rounded-full text-sm font-medium mb-6 backdrop-blur-sm">
                                <Sparkles className="w-4 h-4" />
                                <span>AI-Powered University Roadmap</span>
                            </div>
                            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                                Reach for the{" "}
                                <span className="bg-gradient-to-r from-primary-400 via-secondary-400 to-primary-400 bg-clip-text text-transparent animate-gradient">
                                    Stars
                                </span>{" "}
                                in Your Career
                            </h1>
                            <p className="text-xl text-gray-400 mb-10 leading-relaxed">
                                Navigate your university journey like a
                                constellation. Get AI-powered guidance to
                                connect the dots between your skills,
                                organizations, and dream career.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                <Link
                                    to="/register"
                                    className="bg-primary-600 text-white px-8 py-4 rounded-xl hover:bg-primary-500 transition flex items-center justify-center gap-2 text-lg font-semibold shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)]"
                                >
                                    Launch Roadmap
                                    <Rocket className="w-5 h-5" />
                                </Link>
                                <a
                                    href="#features"
                                    className="bg-white/5 text-white px-8 py-4 rounded-xl hover:bg-white/10 transition border border-white/10 text-lg font-semibold backdrop-blur-sm"
                                >
                                    Explore Universe
                                </a>
                            </div>
                        </div>

                        <div className="relative hidden lg:block">
                            <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl blur opacity-30"></div>
                            <Roadmap3D />
                        </div>
                        {/* Mobile view for 3D map */}
                        <div className="relative lg:hidden">
                            <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl blur opacity-30"></div>
                            <Roadmap3D />
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 border-y border-white/5 bg-white/5 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div className="text-center">
                            <div className="text-4xl md:text-5xl font-bold text-white mb-2 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                                1000+
                            </div>
                            <div className="text-gray-400 font-medium">
                                Stars Aligned
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl md:text-5xl font-bold text-white mb-2 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                                500+
                            </div>
                            <div className="text-gray-400 font-medium">
                                Alumni Guides
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl md:text-5xl font-bold text-white mb-2 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                                50+
                            </div>
                            <div className="text-gray-400 font-medium">
                                Galaxies Explored
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl md:text-5xl font-bold text-white mb-2 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                                95%
                            </div>
                            <div className="text-gray-400 font-medium">
                                Mission Success
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 px-4 relative">
                <div className="absolute top-1/2 left-0 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            Your Mission Control
                        </h2>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                            Advanced tools to navigate the vast universe of
                            career opportunities
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Target className="w-8 h-8" />}
                            title="Personalized Trajectory"
                            description="AI-calculated flight path based on your unique goals and alumni data."
                        />
                        <FeatureCard
                            icon={<Users className="w-8 h-8" />}
                            title="Crew Assembly"
                            description="Find the perfect organizations and communities to join your mission."
                        />
                        <FeatureCard
                            icon={<Award className="w-8 h-8" />}
                            title="Achievement Unlocked"
                            description="Identify key certificates that act as boosters for your career rocket."
                        />
                        <FeatureCard
                            icon={<BookOpen className="w-8 h-8" />}
                            title="Knowledge Navigation"
                            description="Chart your course through elective subjects that matter most."
                        />
                        <FeatureCard
                            icon={<Brain className="w-8 h-8" />}
                            title="Skill Analysis"
                            description="Detect void spaces in your skill set and fill them before launch."
                        />
                        <FeatureCard
                            icon={<Briefcase className="w-8 h-8" />}
                            title="Alumni Constellations"
                            description="Learn from the star maps of successful alumni who went before you."
                        />
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="bg-gradient-to-br from-primary-900/50 to-secondary-900/50 rounded-3xl p-12 text-white shadow-2xl border border-white/10 backdrop-blur-md relative overflow-hidden">
                        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[length:20px_20px]"></div>
                        <div className="relative z-10">
                            <h2 className="text-4xl md:text-5xl font-bold mb-6">
                                Ready for Liftoff?
                            </h2>
                            <p className="text-xl mb-8 text-gray-300">
                                Join thousands of students launching their dream
                                careers today.
                            </p>
                            <Link
                                to="/register"
                                className="inline-flex items-center gap-2 bg-white text-primary-900 px-8 py-4 rounded-xl hover:bg-gray-100 transition text-lg font-bold shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                            >
                                Begin Countdown
                                <TrendingUp className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-black/50 text-white py-12 px-4 border-t border-white/10">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <Rocket className="w-8 h-8 text-primary-400" />
                        <span className="text-2xl font-bold">PU Catalyst</span>
                    </div>
                    <p className="text-gray-500 mb-6">
                        Empowering students to reach the stars with AI-driven
                        guidance
                    </p>
                    <p className="text-gray-600 text-sm">
                        © 2025 PU Catalyst. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}

function FeatureCard({ icon, title, description }) {
    return (
        <div className="bg-white/5 p-8 rounded-2xl border border-white/10 hover:border-primary-500/50 hover:bg-white/10 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] transition group backdrop-blur-sm">
            <div className="w-16 h-16 bg-primary-500/20 rounded-xl flex items-center justify-center text-primary-400 mb-5 group-hover:bg-primary-500 group-hover:text-white transition shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
            <p className="text-gray-400 leading-relaxed">{description}</p>
        </div>
    );
}
