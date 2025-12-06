import { Users, Calendar, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Organization } from "@/data/roadmapData";
import { cn } from "@/lib/utils";

interface OrganizationsSectionProps {
    organizations: Organization[];
}

export const OrganizationsSection = ({
    organizations,
}: OrganizationsSectionProps) => {
    return (
        <section className="mb-12 animate-fade-up stagger-3">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-success" />
                </div>
                <div>
                    <h2 className="font-display text-2xl font-bold text-foreground">
                        Campus Organizations
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Connect with like-minded peers and build your network
                    </p>
                </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
                {organizations.map((org) => (
                    <div
                        key={org.id}
                        className="group bg-card rounded-2xl border border-border/50 p-5 shadow-soft card-hover"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <span
                                    className={cn(
                                        "text-xs font-medium px-2 py-0.5 rounded-full capitalize",
                                        org.type === "club" &&
                                            "bg-primary/10 text-primary",
                                        org.type === "organization" &&
                                            "bg-accent/10 text-accent",
                                        org.type === "society" &&
                                            "bg-success/10 text-success"
                                    )}
                                >
                                    {org.type}
                                </span>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="opacity-0 group-hover:opacity-100 transition-opacity text-primary hover:text-primary hover:bg-primary/10"
                            >
                                Learn More
                                <ArrowRight className="w-4 h-4 ml-1" />
                            </Button>
                        </div>

                        <h3 className="font-display font-semibold text-lg text-foreground mb-2 group-hover:text-primary transition-colors">
                            {org.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                            {org.description}
                        </p>

                        <div className="flex flex-wrap gap-1.5 mb-4">
                            {org.tags.map((tag) => (
                                <Badge
                                    key={tag}
                                    variant="secondary"
                                    className="text-xs font-medium bg-secondary hover:bg-secondary/80"
                                >
                                    {tag}
                                </Badge>
                            ))}
                        </div>

                        <div className="flex items-center gap-4 text-xs text-muted-foreground border-t border-border/50 pt-4">
                            {org.memberCount && (
                                <div className="flex items-center gap-1.5">
                                    <Users className="w-3.5 h-3.5" />
                                    <span>{org.memberCount} members</span>
                                </div>
                            )}
                            {org.meetingFrequency && (
                                <div className="flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5" />
                                    <span>{org.meetingFrequency}</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};
