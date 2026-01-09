import { Skeleton } from "@/components/ui/skeleton";

// =============================================================================
// DASHBOARD SKELETON
// =============================================================================
export const DashboardSkeleton = () => {
    return (
        <div className="max-w-7xl mx-auto">
            {/* Hero Section Skeleton */}
            <div className="relative overflow-hidden bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl p-8 md:p-12 mb-10">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div className="flex-1 space-y-4">
                        {/* Date/Major badge */}
                        <Skeleton shimmer className="h-5 w-40 bg-white/5" />
                        {/* Name greeting */}
                        <Skeleton shimmer className="h-12 w-72 bg-white/5" />
                        {/* Career goal */}
                        <Skeleton shimmer className="h-6 w-56 bg-white/5" />
                        {/* Progress bar */}
                        <div className="max-w-md space-y-2">
                            <div className="flex justify-between">
                                <Skeleton
                                    shimmer
                                    className="h-4 w-32 bg-white/5"
                                />
                                <Skeleton
                                    shimmer
                                    className="h-4 w-10 bg-white/5"
                                />
                            </div>
                            <Skeleton
                                shimmer
                                className="h-2.5 w-full bg-white/5"
                            />
                        </div>
                    </div>
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3">
                        {[1, 2, 3, 4].map((i) => (
                            <div
                                key={i}
                                className="bg-card rounded-xl p-4 border border-border/50"
                            >
                                <Skeleton
                                    shimmer
                                    className="w-10 h-10 rounded-lg mb-3 bg-white/5"
                                />
                                <Skeleton
                                    shimmer
                                    className="h-8 w-12 mb-1 bg-white/5"
                                />
                                <Skeleton
                                    shimmer
                                    className="h-3 w-20 bg-white/5"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Skills Roadmap Skeleton */}
            <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl p-8 mb-10">
                <Skeleton shimmer className="h-8 w-48 mb-6 bg-white/5" />
                <div className="flex items-center justify-between gap-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div
                            key={i}
                            className="flex-1 flex flex-col items-center"
                        >
                            <Skeleton
                                shimmer
                                className="w-16 h-16 rounded-full bg-white/5"
                            />
                            <Skeleton
                                shimmer
                                className="h-4 w-20 mt-3 bg-white/5"
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Sections Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[1, 2].map((i) => (
                    <div
                        key={i}
                        className="bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl p-6"
                    >
                        <Skeleton
                            shimmer
                            className="h-7 w-40 mb-4 bg-white/5"
                        />
                        <div className="space-y-3">
                            {[1, 2, 3].map((j) => (
                                <div
                                    key={j}
                                    className="flex items-center gap-4 p-4 rounded-xl bg-white/5"
                                >
                                    <Skeleton
                                        shimmer
                                        className="w-12 h-12 rounded-xl bg-white/10"
                                    />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton
                                            shimmer
                                            className="h-5 w-32 bg-white/10"
                                        />
                                        <Skeleton
                                            shimmer
                                            className="h-3 w-48 bg-white/10"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// =============================================================================
// CARD SKELETON (for Courses, Certs, Orgs grids)
// =============================================================================
interface CardSkeletonProps {
    count?: number;
    columns?: 1 | 2 | 3;
}

export const CardSkeleton = ({ count = 6, columns = 2 }: CardSkeletonProps) => {
    const gridClass = {
        1: "grid-cols-1",
        2: "grid-cols-1 lg:grid-cols-2",
        3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    };

    return (
        <div className={`grid ${gridClass[columns]} gap-6`}>
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    className="glass-card p-8 rounded-2xl border border-white/10"
                >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-2">
                                <Skeleton
                                    shimmer
                                    className="h-6 w-20 rounded-full bg-white/5"
                                />
                                <Skeleton
                                    shimmer
                                    className="h-6 w-16 rounded-full bg-white/5"
                                />
                            </div>
                            <Skeleton shimmer className="h-7 w-48 bg-white/5" />
                            <Skeleton shimmer className="h-4 w-32 bg-white/5" />
                        </div>
                        <Skeleton
                            shimmer
                            className="w-12 h-12 rounded-lg bg-white/5"
                        />
                    </div>

                    {/* Description */}
                    <Skeleton shimmer className="h-4 w-full mb-2 bg-white/5" />
                    <Skeleton shimmer className="h-4 w-3/4 mb-4 bg-white/5" />

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2 mb-4">
                        <Skeleton
                            shimmer
                            className="h-6 w-24 rounded-full bg-white/5"
                        />
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-white/10">
                        <Skeleton shimmer className="h-5 w-20 bg-white/5" />
                        <Skeleton shimmer className="h-5 w-20 bg-white/5" />
                    </div>

                    {/* Skills */}
                    <div className="mb-4">
                        <Skeleton
                            shimmer
                            className="h-4 w-32 mb-2 bg-white/5"
                        />
                        <div className="flex flex-wrap gap-1">
                            {[1, 2, 3, 4].map((j) => (
                                <Skeleton
                                    key={j}
                                    shimmer
                                    className="h-6 w-16 rounded bg-white/5"
                                />
                            ))}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                        <Skeleton
                            shimmer
                            className="flex-1 h-10 rounded-lg bg-white/5"
                        />
                        <Skeleton
                            shimmer
                            className="flex-1 h-10 rounded-lg bg-white/5"
                        />
                    </div>
                </div>
            ))}
        </div>
    );
};

// =============================================================================
// PAGE HEADER SKELETON
// =============================================================================
export const PageHeaderSkeleton = () => {
    return (
        <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
                <Skeleton shimmer className="w-10 h-10 rounded-lg bg-white/5" />
                <Skeleton shimmer className="h-10 w-64 bg-white/5" />
            </div>
            <Skeleton shimmer className="h-6 w-96 bg-white/5" />
        </div>
    );
};

// =============================================================================
// FILTER SKELETON
// =============================================================================
export const FilterSkeleton = () => {
    return (
        <div className="glass-card p-6 mb-8 rounded-2xl border border-white/10">
            <div className="flex items-center gap-2 mb-4">
                <Skeleton shimmer className="w-5 h-5 rounded bg-white/5" />
                <Skeleton shimmer className="h-6 w-20 bg-white/5" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                    <div key={i}>
                        <Skeleton
                            shimmer
                            className="h-4 w-20 mb-2 bg-white/5"
                        />
                        <Skeleton
                            shimmer
                            className="h-10 w-full rounded-lg bg-white/5"
                        />
                    </div>
                ))}
            </div>
            <Skeleton shimmer className="h-4 w-48 mt-4 bg-white/5" />
        </div>
    );
};

// =============================================================================
// PROFILE SKELETON
// =============================================================================
export const ProfileSkeleton = () => {
    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
                <Skeleton
                    shimmer
                    className="w-32 h-32 rounded-full mx-auto mb-4 bg-white/5"
                />
                <Skeleton
                    shimmer
                    className="h-8 w-48 mx-auto mb-2 bg-white/5"
                />
                <Skeleton shimmer className="h-5 w-64 mx-auto bg-white/5" />
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 justify-center">
                {[1, 2, 3, 4].map((i) => (
                    <Skeleton
                        key={i}
                        shimmer
                        className="h-10 w-24 rounded-lg bg-white/5"
                    />
                ))}
            </div>

            {/* Content */}
            <div className="glass-card p-6 rounded-2xl border border-white/10">
                <div className="space-y-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i}>
                            <Skeleton
                                shimmer
                                className="h-4 w-24 mb-2 bg-white/5"
                            />
                            <Skeleton
                                shimmer
                                className="h-10 w-full rounded-lg bg-white/5"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// =============================================================================
// SIMPLE SKELETON VARIANTS
// =============================================================================
export const TextSkeleton = ({ lines = 3 }: { lines?: number }) => {
    return (
        <div className="space-y-2">
            {Array.from({ length: lines }).map((_, i) => (
                <Skeleton
                    key={i}
                    shimmer
                    className={`h-4 bg-white/5 ${
                        i === lines - 1 ? "w-3/4" : "w-full"
                    }`}
                />
            ))}
        </div>
    );
};

export const AvatarSkeleton = ({
    size = "md",
}: {
    size?: "sm" | "md" | "lg";
}) => {
    const sizeClass = {
        sm: "w-8 h-8",
        md: "w-12 h-12",
        lg: "w-24 h-24",
    };
    return (
        <Skeleton
            shimmer
            className={`${sizeClass[size]} rounded-full bg-white/5`}
        />
    );
};

export const ButtonSkeleton = ({ width = "w-24" }: { width?: string }) => {
    return (
        <Skeleton shimmer className={`h-10 ${width} rounded-lg bg-white/5`} />
    );
};
