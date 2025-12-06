import { useState } from "react";
import {
    Award,
    Clock,
    ExternalLink,
    Cloud,
    Layout,
    Palette,
    Database,
    Check,
    Play,
    Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Certification } from "@/data/roadmapData";
import { cn } from "@/lib/utils";
import api from "@/lib/axios";
import { useToast } from "@/components/ui/use-toast";
import { CertDetailsModal } from "./CertDetailsModal";

interface ExtendedCertification extends Certification {
    status?: "upcoming" | "in-progress" | "completed";
}

interface CertificationsSectionProps {
    certifications: ExtendedCertification[];
    onCertUpdate?: () => void;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    Cloud,
    Layout,
    Palette,
    Database,
};

type CertStatus = "upcoming" | "in-progress" | "completed";

export const CertificationsSection = ({
    certifications,
    onCertUpdate,
}: CertificationsSectionProps) => {
    const [updatingCert, setUpdatingCert] = useState<string | null>(null);
    const [localCerts, setLocalCerts] =
        useState<ExtendedCertification[]>(certifications);
    const [selectedCert, setSelectedCert] =
        useState<ExtendedCertification | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { toast } = useToast();

    const handleCertClick = (cert: ExtendedCertification) => {
        setSelectedCert(cert);
        setIsModalOpen(true);
    };

    const handleStatusChange = async (
        cert: ExtendedCertification,
        newStatus: CertStatus
    ) => {
        setUpdatingCert(cert.id);
        setIsModalOpen(false);

        try {
            await api.patch("/roadmaps/cert-status", {
                cert_name: cert.name,
                status: newStatus,
            });

            // Update local state
            setLocalCerts((prev) =>
                prev.map((c) =>
                    c.id === cert.id ? { ...c, status: newStatus } : c
                )
            );

            toast({
                title: "Certificate Updated",
                description: `${cert.name} marked as ${newStatus.replace(
                    "-",
                    " "
                )}`,
            });

            // Notify parent to refresh dashboard data
            onCertUpdate?.();
        } catch (error) {
            console.error("Failed to update cert status:", error);
            toast({
                variant: "destructive",
                title: "Update Failed",
                description:
                    "Failed to update certificate status. Please try again.",
            });
        } finally {
            setUpdatingCert(null);
        }
    };

    return (
        <section className="mb-12 animate-fade-up stagger-2">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                    <Award className="w-5 h-5 text-accent" />
                </div>
                <div>
                    <h2 className="font-display text-2xl font-bold text-foreground">
                        Recommended Certifications
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Click to update progress
                    </p>
                </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {localCerts.map((cert) => {
                    const Icon = iconMap[cert.icon] || Award;
                    const isUpdating = updatingCert === cert.id;
                    const isCompleted = cert.status === "completed";
                    const isInProgress = cert.status === "in-progress";

                    return (
                        <button
                            key={cert.id}
                            onClick={() => handleCertClick(cert)}
                            disabled={isUpdating}
                            className={cn(
                                "group bg-card rounded-2xl border p-5 shadow-soft card-hover overflow-hidden relative text-left transition-all",
                                isCompleted &&
                                    "border-emerald-500/50 bg-emerald-500/5",
                                isInProgress &&
                                    "border-amber-500/50 bg-amber-500/5",
                                !isCompleted &&
                                    !isInProgress &&
                                    "border-border/50",
                                isUpdating && "opacity-50"
                            )}
                        >
                            {/* Gradient overlay on hover */}
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                            <div className="relative z-10">
                                <div className="flex items-start justify-between mb-4">
                                    <div
                                        className={cn(
                                            "w-12 h-12 rounded-xl flex items-center justify-center",
                                            isCompleted && "bg-emerald-500/20",
                                            isInProgress && "bg-amber-500/20",
                                            !isCompleted &&
                                                !isInProgress &&
                                                "bg-gradient-to-br from-primary/10 to-accent/10"
                                        )}
                                    >
                                        {isUpdating ? (
                                            <Loader2 className="w-6 h-6 text-primary animate-spin" />
                                        ) : isCompleted ? (
                                            <Check className="w-6 h-6 text-emerald-400" />
                                        ) : isInProgress ? (
                                            <Play className="w-6 h-6 text-amber-400" />
                                        ) : (
                                            <Icon className="w-6 h-6 text-primary" />
                                        )}
                                    </div>
                                    <div className="flex gap-1">
                                        {cert.status && (
                                            <span
                                                className={cn(
                                                    "text-xs font-semibold px-2 py-1 rounded-full",
                                                    isCompleted &&
                                                        "bg-emerald-500/10 text-emerald-400",
                                                    isInProgress &&
                                                        "bg-amber-500/10 text-amber-400",
                                                    !isCompleted &&
                                                        !isInProgress &&
                                                        "bg-muted text-muted-foreground"
                                                )}
                                            >
                                                {cert.status.replace("-", " ")}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <h3 className="font-display font-semibold text-foreground mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                                    {cert.name}
                                </h3>
                                <p className="text-xs text-muted-foreground mb-3">
                                    {cert.provider}
                                </p>
                                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                    {cert.description}
                                </p>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5 text-muted-foreground">
                                        <Clock className="w-4 h-4" />
                                        <span className="text-xs font-medium">
                                            {cert.estimatedTime}
                                        </span>
                                    </div>
                                    <span
                                        className={cn(
                                            "text-xs font-semibold px-2.5 py-1 rounded-full",
                                            cert.difficulty === "beginner" &&
                                                "bg-success/10 text-success",
                                            cert.difficulty ===
                                                "intermediate" &&
                                                "bg-warning/10 text-warning",
                                            cert.difficulty === "advanced" &&
                                                "bg-accent/10 text-accent"
                                        )}
                                    >
                                        {cert.difficulty}
                                    </span>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Certificate Details Modal */}
            {selectedCert && (
                <CertDetailsModal
                    cert={
                        localCerts.find((c) => c.id === selectedCert.id) ||
                        selectedCert
                    }
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setSelectedCert(null);
                    }}
                    onStatusChange={(status) => {
                        if (selectedCert) {
                            handleStatusChange(selectedCert, status);
                        }
                    }}
                />
            )}
        </section>
    );
};
