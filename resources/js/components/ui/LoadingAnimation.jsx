import React, { useState, useEffect } from "react";
import {
    BookOpen,
    GraduationCap,
    Microscope,
    Code,
    Palette,
    Award,
    Beaker,
    Calculator,
} from "lucide-react";

const LoadingAnimation = ({ onLoadingComplete }) => {
    const [isComplete, setIsComplete] = useState(false);
    const [isFadingOut, setIsFadingOut] = useState(false);

    useEffect(() => {
        // Mark as complete after 1.5 seconds
        const completeTimer = setTimeout(() => {
            setIsComplete(true);
        }, 1000);

        // Start fading out after showing completion for 0.5 seconds
        const fadeTimer = setTimeout(() => {
            setIsFadingOut(true);
        }, 2000);

        // Notify parent that loading is complete after fade out
        const unmountTimer = setTimeout(() => {
            if (onLoadingComplete) {
                onLoadingComplete();
            }
        }, 3000);

        return () => {
            clearTimeout(completeTimer);
            clearTimeout(fadeTimer);
            clearTimeout(unmountTimer);
        };
    }, [onLoadingComplete]);

    const subjects = [
        { icon: BookOpen, color: "text-blue-400" },
        { icon: Microscope, color: "text-green-400" },
        { icon: Code, color: "text-purple-400" },
        { icon: Palette, color: "text-pink-400" },
        { icon: Beaker, color: "text-orange-400" },
        { icon: Calculator, color: "text-yellow-400" },
    ];

    return (
        <div
            className={`fixed inset-0 bg-gradient-to-br from-indigo-950 via-purple-900 to-blue-950 flex items-center justify-center p-8 z-[9999] transition-opacity duration-1000 ease-out ${
                isFadingOut ? "opacity-0" : "opacity-100"
            }`}
        >
            <div className="flex flex-col items-center justify-center">
                <div
                    className={`relative w-80 h-80 transition-all duration-1000 ${
                        isComplete
                            ? "scale-0 opacity-0"
                            : "scale-100 opacity-100"
                    }`}
                >
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div
                            className={`relative transition-all duration-700 ${
                                isComplete
                                    ? "scale-150 rotate-[360deg]"
                                    : "scale-100 rotate-0"
                            }`}
                        >
                            <div
                                className={`absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full blur-2xl transition-opacity duration-700 ${
                                    isComplete
                                        ? "opacity-0"
                                        : "opacity-50 animate-pulse"
                                }`}
                            />
                            <GraduationCap
                                className={`w-24 h-24 text-white relative z-10 transition-all duration-700 ${
                                    isComplete ? "text-green-400" : ""
                                }`}
                            />
                        </div>
                    </div>

                    {subjects.map((subject, i) => {
                        const Icon = subject.icon;
                        return (
                            <div
                                key={i}
                                className={`absolute transition-all duration-700 ${
                                    isComplete
                                        ? "scale-0 opacity-0"
                                        : "scale-100 opacity-100"
                                }`}
                                style={{
                                    animationName: isComplete
                                        ? "none"
                                        : "orbit",
                                    animationDuration: "6s",
                                    animationTimingFunction: "linear",
                                    animationIterationCount: "infinite",
                                    animationDelay: `${-i * 1}s`,
                                    top: "50%",
                                    left: "50%",
                                    transitionDelay: `${i * 0.1}s`,
                                }}
                            >
                                <div
                                    className="bg-white/10 backdrop-blur-sm p-3 rounded-full border-2 border-white/20 shadow-lg"
                                    style={{
                                        animationName: isComplete
                                            ? "none"
                                            : "counter-rotate",
                                        animationDuration: "6s",
                                        animationTimingFunction: "linear",
                                        animationIterationCount: "infinite",
                                        animationDelay: `${-i * 1}s`,
                                    }}
                                >
                                    <Icon
                                        className={`w-8 h-8 ${subject.color}`}
                                    />
                                </div>
                            </div>
                        );
                    })}

                    <div
                        className={`absolute inset-0 border-4 border-dashed border-purple-400/30 rounded-full transition-all duration-700 ${
                            isComplete ? "scale-150 opacity-0" : "opacity-100"
                        }`}
                        style={{
                            animationName: isComplete ? "none" : "spin",
                            animationDuration: "20s",
                            animationTimingFunction: "linear",
                            animationIterationCount: "infinite",
                        }}
                    />
                    <div
                        className={`absolute inset-8 border-4 border-dashed border-pink-400/30 rounded-full transition-all duration-700 ${
                            isComplete ? "scale-150 opacity-0" : "opacity-100"
                        }`}
                        style={{
                            animationName: isComplete ? "none" : "spin",
                            animationDuration: "15s",
                            animationTimingFunction: "linear",
                            animationIterationCount: "infinite",
                            animationDirection: "reverse",
                        }}
                    />
                </div>

                <p
                    className={`text-white mt-8 text-xl font-semibold transition-all duration-500 ${
                        isComplete
                            ? "opacity-0 translate-y-4"
                            : "opacity-100 translate-y-0"
                    }`}
                >
                    {isComplete ? "" : "Preparing Your Journey..."}
                </p>

                {isComplete && !isFadingOut && (
                    <div className="absolute flex items-center justify-center">
                        <div className="text-center animate-fade-in">
                            <div className="flex items-center justify-center mb-4">
                                <Award className="w-20 h-20 text-green-400 animate-bounce" />
                            </div>
                            <p className="text-white text-3xl font-bold">
                                Ready to Begin!
                            </p>
                            <p className="text-purple-300 text-lg mt-2">
                                Your roadmap is loaded
                            </p>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                    @keyframes orbit {
                        from {
                            transform: translate(-50%, -50%) rotate(0deg)
                                translateX(140px);
                        }
                        to {
                            transform: translate(-50%, -50%) rotate(360deg)
                                translateX(140px);
                        }
                    }
                    @keyframes counter-rotate {
                        from {
                            transform: rotate(0deg);
                        }
                        to {
                            transform: rotate(-360deg);
                        }
                    }
                    @keyframes fade-in {
                        from {
                            opacity: 0;
                            transform: scale(0.8);
                        }
                        to {
                            opacity: 1;
                            transform: scale(1);
                        }
                    }
                    .animate-fade-in {
                        animation: fade-in 0.7s ease-out forwards;
                    }
                `}</style>
        </div>
    );
};

export default LoadingAnimation;
