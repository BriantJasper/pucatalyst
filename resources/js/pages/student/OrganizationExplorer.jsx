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
import LoadingAnimation from "../../components/ui/LoadingAnimation";
import Navbar from "../../components/layouts/Navbar";

export default function OrganizationExplorer() {
    const [organizations, setOrganizations] = useState([]);
    const [loading, setLoading] = useState(true);
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
            } finally {
                setLoading(false);
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

    if (loading) {
        return <LoadingAnimation />;
    }

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
        <>
            <Navbar />
            <div className="min-h-screen bg-gray-50 p-8">
                <div className="max-w-7xl mx-auto">
                    <Link
                        to="/student/dashboard"
                        className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-8 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to Dashboard
                    </Link>

                    <div className="mb-12">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">
                            Student Organizations
                        </h1>
                        <p className="text-lg text-gray-600">
                            Discover and join the vibrant communities at
                            President University.
                        </p>
                    </div>

                    {/* Bureaucracy Section */}
                    <section className="mb-16">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Award className="w-6 h-6 text-primary-600" />
                            Student Bureaucracy
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {bureaucracy.map((org) => (
                                <div
                                    key={org.id}
                                    className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="p-3 bg-primary-50 rounded-lg">
                                            <Award className="w-6 h-6 text-primary-600" />
                                        </div>
                                        <span className="px-3 py-1 text-xs font-medium text-primary-700 bg-primary-50 rounded-full">
                                            {org.category}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                                        {org.name}
                                    </h3>
                                    <p className="text-gray-600 mb-4 line-clamp-2">
                                        {org.description}
                                    </p>
                                    <button className="w-full py-2 px-4 bg-gray-50 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors">
                                        View Details
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Clubs & Communities Section */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Users className="w-6 h-6 text-primary-600" />
                            Clubs & Communities
                        </h2>

                        <div className="flex flex-wrap gap-2 mb-8">
                            {clubCategories.map((category) => (
                                <button
                                    key={category}
                                    onClick={() => setActiveTab(category)}
                                    className={`px-6 py-2 rounded-full font-medium transition-all ${
                                        activeTab === category
                                            ? "bg-primary-600 text-white shadow-md"
                                            : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
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
                                        className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow group"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="p-3 bg-gray-50 rounded-lg group-hover:bg-primary-50 transition-colors">
                                                {getIcon(org.category)}
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                                            {org.name}
                                        </h3>
                                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                            {org.description}
                                        </p>
                                        <button className="w-full py-2 px-4 border border-primary-600 text-primary-600 font-medium rounded-lg hover:bg-primary-50 transition-colors">
                                            Join Club
                                        </button>
                                    </div>
                                ))}
                        </div>

                        {clubs.filter((org) => org.category === activeTab)
                            .length === 0 && (
                            <div className="text-center py-12 bg-white rounded-xl border border-gray-200 border-dashed">
                                <p className="text-gray-500">
                                    No organizations found in this category.
                                </p>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </>
    );
}
