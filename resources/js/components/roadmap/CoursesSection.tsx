import {
    Play,
    ExternalLink,
    Clock,
    DollarSign,
    CheckCircle,
    Globe,
    MoreHorizontal,
    ArrowRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Course } from "@/data/roadmapData";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { CourseDetailsModal } from "./CourseDetailsModal";
import api from "@/lib/axios";
import { useToast } from "@/components/ui/use-toast";

interface CoursesSectionProps {
    courses: Course[];
    onCourseUpdate?: () => void;
}

export const CoursesSection = ({
    courses,
    onCourseUpdate,
}: CoursesSectionProps) => {
    const { toast } = useToast();
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [localCourses, setLocalCourses] = useState<Course[]>(courses);

    // Sync local state when props change
    useEffect(() => {
        setLocalCourses(courses);
    }, [courses]);

    if (!localCourses || localCourses.length === 0) {
        return null;
    }

    const groupedByCategory: Record<string, Course[]> = localCourses.reduce(
        (acc, course) => {
            const category = course.category || "Other";
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(course);
            return acc;
        },
        {} as Record<string, Course[]>
    );

    const handleStatusChange = async (
        courseName: string,
        status: "upcoming" | "in-progress" | "completed"
    ) => {
        // Optimistic update
        const updatedCourses = localCourses.map((c) =>
            c.name === courseName ? { ...c, status } : c
        );
        setLocalCourses(updatedCourses);

        if (selectedCourse && selectedCourse.name === courseName) {
            setSelectedCourse({ ...selectedCourse, status });
        }

        try {
            await api.patch("/roadmaps/course-status", {
                course_name: courseName,
                status,
            });

            toast({
                title: "Status Updated",
                description: `Course marked as ${status.replace("-", " ")}`,
            });

            // Refresh parent data in background
            if (onCourseUpdate) {
                onCourseUpdate();
            }
        } catch (error) {
            console.error("Failed to update status:", error);
            // Revert on failure
            setLocalCourses(courses);
            if (selectedCourse) {
                setSelectedCourse(
                    courses.find((c) => c.name === selectedCourse.name) || null
                );
            }

            toast({
                title: "Error",
                description: "Failed to update course status",
                variant: "destructive",
            });
        }
    };

    return (
        <section className="mb-12 animate-fade-up stagger-4">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-primary/10 rounded-lg">
                    <Play className="w-6 h-6 text-primary" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-foreground">
                        Recommended Courses
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Online courses to build your skills
                    </p>
                </div>
            </div>

            <div className="space-y-8">
                {Object.entries(groupedByCategory).map(
                    ([category, categoryCourses]) => (
                        <div key={category}>
                            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                                <div className="w-1 h-6 bg-primary rounded-full" />
                                {category}
                                <Badge variant="secondary" className="ml-2">
                                    {categoryCourses.length}
                                </Badge>
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {categoryCourses.map((course) => (
                                    <div
                                        key={course.id}
                                        onClick={() =>
                                            setSelectedCourse(course)
                                        }
                                        className="glass-card p-6 rounded-xl border border-white/10 hover:bg-white/5 transition-all group cursor-pointer relative overflow-hidden"
                                    >
                                        {/* Status Indicator Strip */}
                                        {course.status &&
                                            course.status !== "upcoming" && (
                                                <div
                                                    className={cn(
                                                        "absolute top-0 left-0 w-1 h-full",
                                                        course.status ===
                                                            "completed"
                                                            ? "bg-green-500"
                                                            : "bg-primary"
                                                    )}
                                                />
                                            )}

                                        {/* Header */}
                                        <div className="flex items-start justify-between mb-3 pl-2">
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors line-clamp-2">
                                                    {course.name}
                                                </h4>
                                                <div className="flex items-center gap-2 flex-wrap mt-2">
                                                    <Badge
                                                        variant="outline"
                                                        className="text-xs bg-white/5"
                                                    >
                                                        <Globe className="w-3 h-3 mr-1" />
                                                        {course.provider}
                                                    </Badge>
                                                    {course.isFree && (
                                                        <Badge className="text-xs bg-green-500/10 text-green-400 border-green-500/30">
                                                            <CheckCircle className="w-3 h-3 mr-1" />
                                                            Free
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                            <div
                                                className={cn(
                                                    "p-2 rounded-lg flex-shrink-0 transition-colors",
                                                    course.status ===
                                                        "completed"
                                                        ? "bg-green-500/10 text-green-500"
                                                        : course.status ===
                                                          "in-progress"
                                                        ? "bg-primary/20 text-primary"
                                                        : "bg-primary/10 text-primary"
                                                )}
                                            >
                                                {course.status ===
                                                "completed" ? (
                                                    <CheckCircle className="w-5 h-5" />
                                                ) : (
                                                    <Play
                                                        className={cn(
                                                            "w-5 h-5",
                                                            course.status ===
                                                                "in-progress" &&
                                                                "animate-pulse"
                                                        )}
                                                    />
                                                )}
                                            </div>
                                        </div>

                                        {/* Description */}
                                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2 pl-2">
                                            {course.description}
                                        </p>

                                        {/* Details */}
                                        <div className="flex items-center gap-4 mb-4 text-xs text-gray-400 pl-2">
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                <span>{course.duration}</span>
                                            </div>
                                            {!course.isFree && (
                                                <div className="flex items-center gap-1">
                                                    <DollarSign className="w-3 h-3" />
                                                    <span>Paid</span>
                                                </div>
                                            )}
                                            {course.status &&
                                                course.status !==
                                                    "upcoming" && (
                                                    <Badge
                                                        variant="secondary"
                                                        className="ml-auto text-[10px] h-5"
                                                    >
                                                        {course.status.replace(
                                                            "-",
                                                            " "
                                                        )}
                                                    </Badge>
                                                )}
                                        </div>

                                        {/* Hover action hint */}
                                        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="bg-primary text-black text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                                                Details{" "}
                                                <ArrowRight className="w-3 h-3" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                )}
            </div>

            {selectedCourse && (
                <CourseDetailsModal
                    course={selectedCourse}
                    isOpen={!!selectedCourse}
                    onClose={() => setSelectedCourse(null)}
                    onStatusChange={handleStatusChange}
                />
            )}
        </section>
    );
};
