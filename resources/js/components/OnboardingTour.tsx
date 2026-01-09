import { useEffect, useState } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

interface OnboardingTourProps {
    isNewUser?: boolean;
    onComplete?: () => void;
}

const TOUR_STORAGE_KEY = "pucatalyst_tour_completed";

export function OnboardingTour({
    isNewUser = false,
    onComplete,
}: OnboardingTourProps) {
    const [showTour, setShowTour] = useState(false);

    useEffect(() => {
        // Check if tour should be shown
        const tourCompleted = localStorage.getItem(TOUR_STORAGE_KEY);

        if (
            !tourCompleted &&
            (isNewUser || !localStorage.getItem(TOUR_STORAGE_KEY))
        ) {
            // Small delay to ensure DOM elements are rendered
            const timer = setTimeout(() => {
                setShowTour(true);
                startTour();
            }, 1000);

            return () => clearTimeout(timer);
        }
    }, [isNewUser]);

    const startTour = () => {
        const driverObj = driver({
            showProgress: true,
            animate: true,
            smoothScroll: true,
            allowClose: true,
            overlayColor: "rgba(0, 0, 0, 0.75)",
            stagePadding: 10,
            popoverClass: "driverjs-theme-dark",
            onDestroyStarted: () => {
                // Mark tour as complete
                localStorage.setItem(TOUR_STORAGE_KEY, "true");
                setShowTour(false);
                onComplete?.();
                driverObj.destroy();
            },
            steps: [
                {
                    popover: {
                        title: "🚀 Welcome to PU Catalyst!",
                        description:
                            "Let's take a quick tour to help you get started on your career journey. Click 'Next' to begin!",
                        side: "over",
                        align: "center",
                    },
                },
                {
                    element: "#nav-dashboard",
                    popover: {
                        title: "📊 Dashboard",
                        description:
                            "Your personal command center! View your progress, skills, and career roadmap all in one place.",
                        side: "bottom",
                        align: "start",
                    },
                },
                {
                    element: "#nav-roadmap",
                    popover: {
                        title: "🗺️ AI Roadmap",
                        description:
                            "Get personalized career recommendations powered by AI! Discover skills, certifications, and organizations based on successful alumni.",
                        side: "bottom",
                        align: "start",
                    },
                },
                {
                    element: "#nav-organizations",
                    popover: {
                        title: "🤝 Organizations",
                        description:
                            "Explore student clubs, bureaucracy, and communities at President University. Join groups that match your interests!",
                        side: "bottom",
                        align: "start",
                    },
                },
                {
                    element: "#nav-certificates",
                    popover: {
                        title: "🏆 Certificates",
                        description:
                            "Browse professional certifications to boost your resume. Track which ones you've earned or are working on.",
                        side: "bottom",
                        align: "start",
                    },
                },
                {
                    element: "#nav-courses",
                    popover: {
                        title: "📚 Courses",
                        description:
                            "Discover online courses from YouTube, Coursera, Udemy and more. Add them to your learning roadmap!",
                        side: "bottom",
                        align: "start",
                    },
                },
                {
                    element: "#nav-profile",
                    popover: {
                        title: "👤 Profile",
                        description:
                            "Complete your profile to get better AI recommendations. Add your interests, skills, and career goals.",
                        side: "bottom",
                        align: "start",
                    },
                },
                {
                    element: "#chatbot-trigger",
                    popover: {
                        title: "💬 AI Assistant",
                        description:
                            "Need help? Chat with our AI assistant anytime! Ask questions about careers, courses, or how to use PU Catalyst.",
                        side: "left",
                        align: "end",
                    },
                },
                {
                    popover: {
                        title: "🎉 You're All Set!",
                        description:
                            "Start exploring your personalized career journey. Visit the Roadmap page to generate your AI-powered career plan!",
                        side: "over",
                        align: "center",
                    },
                },
            ],
        });

        driverObj.drive();
    };

    // Also expose a restart function
    const restartTour = () => {
        localStorage.removeItem(TOUR_STORAGE_KEY);
        startTour();
    };

    return null; // This component doesn't render anything visible
}

// Hook to manually trigger tour
export function useOnboardingTour() {
    const startTour = () => {
        localStorage.removeItem(TOUR_STORAGE_KEY);
        window.dispatchEvent(new CustomEvent("start-onboarding-tour"));
    };

    const isTourCompleted = () => {
        return localStorage.getItem(TOUR_STORAGE_KEY) === "true";
    };

    return { startTour, isTourCompleted };
}

export default OnboardingTour;
