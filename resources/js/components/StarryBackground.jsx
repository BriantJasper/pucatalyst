import React, { useMemo } from "react";

const StarryBackground = () => {
    const generateBoxShadow = (n) => {
        let value = "";
        for (let i = 0; i < n; i++) {
            const x = Math.floor(Math.random() * 2000);
            const y = Math.floor(Math.random() * 2000);
            value += `${x}px ${y}px #FFF`;
            if (i < n - 1) {
                value += ", ";
            }
        }
        return value;
    };

    const starsSmall = useMemo(() => generateBoxShadow(700), []);
    const starsMedium = useMemo(() => generateBoxShadow(200), []);
    const starsBig = useMemo(() => generateBoxShadow(100), []);

    return (
        <div className="fixed inset-0 z-0 overflow-hidden bg-gradient-to-b from-[#090A0F] to-[#1B2735]">
            <div
                className="absolute w-[1px] h-[1px] bg-transparent opacity-80"
                style={{
                    boxShadow: starsSmall,
                    animation: "moveStars 50s linear infinite",
                }}
            />
            <div
                className="absolute w-[2px] h-[2px] bg-transparent opacity-60"
                style={{
                    boxShadow: starsMedium,
                    animation: "moveStars 100s linear infinite",
                }}
            />
            <div
                className="absolute w-[3px] h-[3px] bg-transparent opacity-40"
                style={{
                    boxShadow: starsBig,
                    animation: "moveStars 150s linear infinite",
                }}
            />
        </div>
    );
};

export default StarryBackground;
