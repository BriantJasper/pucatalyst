import { useState } from "react";
import {
    FolderKanban,
    Clock,
    Check,
    Play,
    Lock,
    ChevronDown,
    Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { Project } from "@/data/roadmapData";
import { cn } from "@/lib/utils";
import api from "@/lib/axios";
import { useToast } from "@/components/ui/use-toast";
import { ProjectDetailsModal } from "./ProjectDetailsModal";

interface ProjectsSectionProps {
    projects: Project[];
    onProjectUpdate?: () => void;
}

type ProjectStatus = "upcoming" | "in-progress" | "completed";

export const ProjectsSection = ({
    projects,
    onProjectUpdate,
}: ProjectsSectionProps) => {
    const [openProjects, setOpenProjects] = useState<string[]>([]);
    const [localProjects, setLocalProjects] = useState<Project[]>(projects);
    const [selectedProject, setSelectedProject] = useState<Project | null>(
        null
    );
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [updatingProject, setUpdatingProject] = useState<string | null>(null);
    const { toast } = useToast();

    const toggleProject = (id: string) => {
        setOpenProjects((prev) =>
            prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
        );
    };

    const handleProjectClick = (project: Project) => {
        setSelectedProject(project);
        setIsModalOpen(true);
    };

    const handleStatusChange = async (
        project: Project,
        newStatus: ProjectStatus
    ) => {
        setUpdatingProject(project.id);
        setIsModalOpen(false);

        try {
            await api.patch("/roadmaps/project-status", {
                project_name: project.name,
                status: newStatus,
            });

            // Update local state
            setLocalProjects((prev) =>
                prev.map((p) =>
                    p.id === project.id ? { ...p, status: newStatus } : p
                )
            );

            toast({
                title: "Project Updated",
                description: `${project.name} marked as ${newStatus.replace(
                    "-",
                    " "
                )}`,
            });

            // Notify parent to refresh dashboard data
            onProjectUpdate?.();
        } catch (error) {
            console.error("Failed to update project status:", error);
            toast({
                variant: "destructive",
                title: "Update Failed",
                description:
                    "Failed to update project status. Please try again.",
            });
        } finally {
            setUpdatingProject(null);
        }
    };

    const groupedProjects = {
        beginner: localProjects.filter((p) => p.difficulty === "beginner"),
        intermediate: localProjects.filter(
            (p) => p.difficulty === "intermediate"
        ),
        advanced: localProjects.filter((p) => p.difficulty === "advanced"),
    };

    return (
        <section className="mb-12 animate-fade-up stagger-4">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
                    <FolderKanban className="w-5 h-5 text-warning" />
                </div>
                <div>
                    <h2 className="font-display text-2xl font-bold text-foreground">
                        Suggested Projects
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Build your portfolio with hands-on experience
                    </p>
                </div>
            </div>

            <div className="space-y-6">
                {Object.entries(groupedProjects).map(
                    ([difficulty, projectList]) => (
                        <div key={difficulty}>
                            <div className="flex items-center gap-2 mb-3">
                                <span
                                    className={cn(
                                        "w-2 h-2 rounded-full",
                                        difficulty === "beginner" &&
                                            "bg-success",
                                        difficulty === "intermediate" &&
                                            "bg-warning",
                                        difficulty === "advanced" && "bg-accent"
                                    )}
                                />
                                <h3 className="font-semibold text-foreground capitalize">
                                    {difficulty}
                                </h3>
                                <span className="text-xs text-muted-foreground">
                                    ({projectList.length} projects)
                                </span>
                            </div>

                            <div className="space-y-3">
                                {projectList.map((project) => (
                                    <Collapsible
                                        key={project.id}
                                        open={openProjects.includes(project.id)}
                                        onOpenChange={() =>
                                            toggleProject(project.id)
                                        }
                                    >
                                        <div
                                            className={cn(
                                                "bg-card rounded-xl border shadow-soft overflow-hidden transition-all duration-300",
                                                openProjects.includes(
                                                    project.id
                                                ) && "shadow-medium",
                                                project.status ===
                                                    "completed" &&
                                                    "border-success/30",
                                                project.status ===
                                                    "in-progress" &&
                                                    "border-primary/30",
                                                project.status === "upcoming" &&
                                                    "border-border/50"
                                            )}
                                        >
                                            <CollapsibleTrigger className="w-full">
                                                <div className="flex items-center gap-4 p-4 hover:bg-secondary/30 transition-colors">
                                                    <div
                                                        className={cn(
                                                            "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                                                            project.status ===
                                                                "completed" &&
                                                                "bg-success/10 text-success",
                                                            project.status ===
                                                                "in-progress" &&
                                                                "bg-primary/10 text-primary",
                                                            project.status ===
                                                                "upcoming" &&
                                                                "bg-secondary text-muted-foreground"
                                                        )}
                                                    >
                                                        {project.status ===
                                                        "completed" ? (
                                                            <Check className="w-5 h-5" />
                                                        ) : project.status ===
                                                          "in-progress" ? (
                                                            <Play className="w-5 h-5" />
                                                        ) : (
                                                            <Lock className="w-5 h-5" />
                                                        )}
                                                    </div>

                                                    <div className="flex-1 text-left min-w-0">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <h4 className="font-semibold text-foreground">
                                                                {project.name}
                                                            </h4>
                                                            <Badge
                                                                variant="outline"
                                                                className="text-xs font-medium"
                                                            >
                                                                {
                                                                    project.category
                                                                }
                                                            </Badge>
                                                        </div>
                                                        <div className="flex items-center gap-3 mt-1">
                                                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                                <Clock className="w-3 h-3" />
                                                                {
                                                                    project.estimatedTime
                                                                }
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <ChevronDown
                                                        className={cn(
                                                            "w-5 h-5 text-muted-foreground transition-transform duration-200",
                                                            openProjects.includes(
                                                                project.id
                                                            ) && "rotate-180"
                                                        )}
                                                    />
                                                </div>
                                            </CollapsibleTrigger>

                                            <CollapsibleContent>
                                                <div className="px-4 pb-4 pt-0 border-t border-border/50">
                                                    <p className="text-sm text-muted-foreground mt-4 mb-4">
                                                        {project.description}
                                                    </p>

                                                    <div className="mb-4">
                                                        <p className="text-xs font-medium text-muted-foreground mb-2">
                                                            Skills you'll
                                                            practice:
                                                        </p>
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {project.skills.map(
                                                                (skill) => (
                                                                    <Badge
                                                                        key={
                                                                            skill
                                                                        }
                                                                        className="bg-primary/10 text-primary hover:bg-primary/20 text-xs"
                                                                    >
                                                                        {skill}
                                                                    </Badge>
                                                                )
                                                            )}
                                                        </div>
                                                    </div>

                                                    <Button
                                                        size="sm"
                                                        onClick={() =>
                                                            handleProjectClick(
                                                                project
                                                            )
                                                        }
                                                        className={cn(
                                                            project.status ===
                                                                "completed" &&
                                                                "bg-success hover:bg-success/90",
                                                            project.status ===
                                                                "in-progress" &&
                                                                "bg-primary hover:bg-primary/90",
                                                            project.status ===
                                                                "upcoming" &&
                                                                "bg-secondary text-foreground hover:bg-secondary/80"
                                                        )}
                                                    >
                                                        {project.status ===
                                                        "completed"
                                                            ? "View Project"
                                                            : project.status ===
                                                              "in-progress"
                                                            ? "Continue Building"
                                                            : "Start Project"}
                                                    </Button>
                                                </div>
                                            </CollapsibleContent>
                                        </div>
                                    </Collapsible>
                                ))}
                            </div>
                        </div>
                    )
                )}
            </div>

            {/* Project Details Modal */}
            {selectedProject && (
                <ProjectDetailsModal
                    project={
                        localProjects.find(
                            (p) => p.id === selectedProject.id
                        ) || selectedProject
                    }
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setSelectedProject(null);
                    }}
                    onStatusChange={(status) => {
                        if (selectedProject) {
                            handleStatusChange(selectedProject, status);
                        }
                    }}
                />
            )}
        </section>
    );
};
