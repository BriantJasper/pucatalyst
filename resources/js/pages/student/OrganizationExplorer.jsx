import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    ArrowLeft,
    Users,
    Award,
    Globe,
    Activity,
    Heart,
    Camera,
    Music,
    MapPin,
} from "lucide-react";
import api from "../../lib/axios";
import Navbar from "../../components/layouts/Navbar";
import Footer from "../../components/layouts/Footer";
import StarryBackground from "../../components/StarryBackground";

export default function OrganizationExplorer() {
    const [organizations, setOrganizations] = useState([]);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("Society");

    useEffect(() => {
        const fetchOrganizations = async () => {
            try {
                const response = await api.get("/organizations");
                setOrganizations(response.data);
            } catch (err) {
                setError("Failed to load organizations");
                console.error(err);
            }
        };

        fetchOrganizations();
    }, []);

    const bureaucracy = organizations.filter(
        (org) => org.category === "Bureaucracy"
    );
    const clubs = organizations.filter((org) => org.category !== "Bureaucracy");

    const clubCategories = [
        "Society",
        "Art",
        "Sport",
        "Region CNC",
        "Community",
    ];

    const getIcon = (category) => {
        switch (category) {
            case "Society":
                return <Users className="w-5 h-5" />;
            case "Art":
                return <Camera className="w-5 h-5" />;
            case "Sport":
                return <Activity className="w-5 h-5" />;
            case "Region CNC":
                return <MapPin className="w-5 h-5" />;
            case "Community":
                return <Heart className="w-5 h-5" />;
            default:
                return <Award className="w-5 h-5" />;
        }
    };

    if (error) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-red-500">{error}</div>
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
                            <h1 className="text-4xl font-bold text-foreground mb-4">
                                Student Organizations
                            </h1>
                            <p className="text-lg text-muted-foreground">
                                Discover and join the vibrant communities at
                                President University.
                            </p>
                        </div>

                        {/* Bureaucracy Section */}
                        <section className="mb-16 animate-fade-up stagger-1">
                            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                                <Award className="w-6 h-6 text-primary" />
                                Student Bureaucracy
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {bureaucracy.map((org) => (
                                    <div
                                        key={org.id}
                                        className="glass-card p-6 shadow-lg hover:bg-white/5 transition-all rounded-2xl border border-white/10"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
                                                <Award className="w-6 h-6 text-primary" />
                                            </div>
                                            <span className="px-3 py-1 text-xs font-bold text-primary-foreground bg-primary rounded-full">
                                                {org.category}
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-bold text-foreground mb-2">
                                            {org.name}
                                        </h3>
                                        <p className="text-muted-foreground mb-4 line-clamp-2">
                                            {org.description}
                                        </p>
                                        <button className="w-full py-2 px-4 bg-primary/10 border border-primary/20 text-primary font-bold hover:bg-primary hover:text-black transition-all rounded-lg">
                                            View Details
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Clubs & Communities Section */}
                        <section className="animate-fade-up stagger-2">
                            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                                <Users className="w-6 h-6 text-primary" />
                                Clubs & Communities
                            </h2>
                            <div className="flex flex-wrap gap-2 mb-8">
                                {clubCategories.map((category) => (
                                    <button
                                        key={category}
                                        onClick={() => setActiveTab(category)}
                                        className={`px-6 py-2 font-bold border transition-all rounded-lg ${
                                            activeTab === category
                                                ? "bg-primary text-black border-primary shadow-glow"
                                                : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white"
                                        }`}
                                    >
                                        <span className="flex items-center gap-2">
                                            {getIcon(category)}
                                            {category}
                                        </span>
                                    </button>
                                ))}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {clubs
                                    .filter((org) => org.category === activeTab)
                                    .map((org) => (
                                        <div
                                            key={org.id}
                                            className="glass-card p-6 shadow-lg hover:bg-white/5 transition-all group rounded-2xl border border-white/10"
                                        >
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="p-3 bg-white/5 border border-white/10 rounded-xl group-hover:bg-primary/20 group-hover:text-primary transition-colors text-gray-300">
                                                    {getIcon(org.category)}
                                                </div>
                                            </div>
                                            <h3 className="text-lg font-bold text-foreground mb-2">
                                                {org.name}
                                            </h3>
                                            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                                {org.description}
                                            </p>
                                            <button className="w-full py-2 px-4 border border-white/10 bg-white/5 text-gray-200 font-bold hover:bg-primary hover:text-black transition-all rounded-lg">
                                                Join Club
                                            </button>
                                        </div>
                                    ))}
                            </div>

                            {clubs.filter((org) => org.category === activeTab)
                                .length === 0 && (
                                <div className="text-center py-12 glass-card rounded-2xl border-dashed border-white/20 bg-white/5">
                                    <p className="text-muted-foreground">
                                        No organizations found in this category.
                                    </p>
                                </div>
                            )}
                        </section>
                    </div>
                </div>
                <Footer />
            </div>
        </div>
    );
}
