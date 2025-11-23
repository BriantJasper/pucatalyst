import React from "react";
import {
    Map,
    CheckCircle,
    Circle,
    BookOpen,
    Briefcase,
    Award,
    Target,
} from "lucide-react";

const RoadmapView = ({ roadmap }) => {
    if (!roadmap) {
        return (
            <div className="text-center p-8 bg-gray-50 rounded-lg border border-gray-200">
                <Map className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900">
                    No Roadmap Generated Yet
                </h3>
                <p className="text-gray-500 mt-1">
                    Complete your profile and skills assessment to generate a
                    personalized career roadmap.
                </p>
                <button className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                    Generate Roadmap
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <Target className="w-6 h-6 text-indigo-600" />
                            {roadmap.career_goal} Roadmap
                        </h2>
                        <p className="text-gray-600 mt-1">
                            Success Probability:{" "}
                            <span className="font-semibold text-green-600">
                                {roadmap.success_probability}%
                            </span>
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="text-sm text-gray-500 mb-1">
                            Progress
                        </div>
                        <div className="w-32 bg-gray-200 rounded-full h-2.5">
                            <div
                                className="bg-indigo-600 h-2.5 rounded-full"
                                style={{
                                    width: `${roadmap.completion_percentage}%`,
                                }}
                            ></div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                            {roadmap.completion_percentage}% Completed
                        </div>
                    </div>
                </div>
                {roadmap.ai_insights && (
                    <div className="mt-4 p-4 bg-indigo-50 rounded-lg text-indigo-800 text-sm">
                        <strong>AI Insight:</strong> {roadmap.ai_insights}
                    </div>
                )}
            </div>

            {/* Semester Plans */}
            <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-800">
                    Your Journey
                </h3>
                <div className="relative border-l-2 border-indigo-200 ml-3 space-y-8 pb-8">
                    {roadmap.semester_plans &&
                        roadmap.semester_plans.map((semester, index) => (
                            <div key={index} className="relative pl-8">
                                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-indigo-600 border-4 border-white shadow-sm"></div>
                                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                    <h4 className="text-lg font-bold text-gray-900 mb-3">
                                        {semester.semester_name}
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Courses */}
                                        {semester.courses && (
                                            <div className="space-y-2">
                                                <h5 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                    <BookOpen className="w-4 h-4 text-blue-500" />
                                                    Courses
                                                </h5>
                                                <ul className="text-sm text-gray-600 list-disc list-inside pl-1">
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

                                        {/* Activities */}
                                        {semester.activities && (
                                            <div className="space-y-2">
                                                <h5 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                    <Briefcase className="w-4 h-4 text-orange-500" />
                                                    Activities
                                                </h5>
                                                <ul className="text-sm text-gray-600 list-disc list-inside pl-1">
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

            {/* Gap Analysis */}
            {roadmap.gap_analysis && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        Gap Analysis
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-red-50 rounded-lg border border-red-100">
                            <h4 className="font-medium text-red-800 mb-2">
                                Missing Skills
                            </h4>
                            <ul className="list-disc list-inside text-sm text-red-700">
                                {roadmap.gap_analysis.missing_skills &&
                                    roadmap.gap_analysis.missing_skills.map(
                                        (skill, i) => <li key={i}>{skill}</li>
                                    )}
                            </ul>
                        </div>
                        <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                            <h4 className="font-medium text-green-800 mb-2">
                                Acquired Skills
                            </h4>
                            <ul className="list-disc list-inside text-sm text-green-700">
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
