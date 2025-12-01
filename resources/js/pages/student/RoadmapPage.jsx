import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import axios from "../../lib/axios";
import RoadmapView from "../../components/RoadmapView";
import Navbar from "../../components/layouts/Navbar";

export default function RoadmapPage() {
    const [roadmap, setRoadmap] = useState(null);

    useEffect(() => {
        fetchRoadmap();
    }, []);

    const fetchRoadmap = async () => {
        try {
            const userResponse = await axios.get("/auth/me");
            const userId = userResponse.data.id;

            const studentResponse = await axios.get(`/students/${userId}`);
            setRoadmap(studentResponse.data.roadmap);
        } catch (error) {
            console.error("Error fetching roadmap:", error);
        }
    };

    return (
        <>
            <Navbar />
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">

                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        My AI Roadmap
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Your personalized path to success, powered by AI.
                    </p>
                </div>

                <RoadmapView roadmap={roadmap} />
            </div>
        </div>
        </>
    );
}
