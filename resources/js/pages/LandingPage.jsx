import React, { useRef, useMemo, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
    OrbitControls,
    Html,
    useTexture,
    Stars as DreiStars,
    Loader,
} from "@react-three/drei";
import { motion } from "framer-motion";

// ---------- Utility: randomized star dust (small floating spheres) ------------
function StarDust({ count = 400, radius = 40 }) {
    const meshRef = useRef();
    const positions = useMemo(() => {
        const pos = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            const r = radius * (0.2 + Math.random() * 0.9);
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const x = r * Math.sin(phi) * Math.cos(theta);
            const y = r * Math.sin(phi) * Math.sin(theta);
            const z = r * Math.cos(phi);
            pos[i * 3 + 0] = x;
            pos[i * 3 + 1] = y;
            pos[i * 3 + 2] = z;
        }
        return pos;
    }, [count, radius]);

    useFrame(({ clock }) => {
        if (meshRef.current) {
            meshRef.current.rotation.y = clock.getElapsedTime() * 0.01;
        }
    });

    return (
        <group rotation={[0, 0, 0]}>
            {/* Use simple manual meshes for reliability and to avoid instancing complexity */}
            {Array.from({ length: Math.min(count, 200) }).map((_, i) => (
                <mesh
                    key={i}
                    position={[
                        positions[i * 3 + 0],
                        positions[i * 3 + 1],
                        positions[i * 3 + 2],
                    ]}
                    rotation={[0, 0, 0]}
                >
                    <sphereGeometry args={[0.03, 6, 6]} />
               </mesh>
            ))}
        </group>
    );
}

// ----------------- Planet component (simple reflective-ish sphere) -----------------
function Planet({ position = [6, 0, -8], color = "#6dd3ff", size = 2 }) {
    const planetRef = useRef();
    useFrame(({ clock }) => {
        if (planetRef.current)
            planetRef.current.rotation.y = clock.getElapsedTime() * 0.05;
    });

    return (
        <mesh ref={planetRef} position={position}>
            <sphereGeometry args={[size, 64, 64]} />
            <meshStandardMaterial
                metalness={0.3}
                roughness={0.4}
                color={color}
                emissive={"#0f172a"}
                emissiveIntensity={0.05}
            />
        </mesh>
    );
}

// ----------------- Floating UI label for an object -----------------
function FloatingLabel({ position = [6, 1.8, -6], text = "Planet X" }) {
    return (
        <Html position={position} center>
            <div className="backdrop-blur-sm bg-white/5 rounded-md px-3 py-1 text-sm border border-white/5 shadow-lg">
                <div className="text-xs text-slate-200">{text}</div>
            </div>
        </Html>
    );
}

// ----------------- Camera motion: subtle forward drift on scroll -----------------
function CameraRig({ scroll = 0 }) {
    // For adaptive camera movement; this component can be extended to react to scroll
    const { camera } = useThree();
    useFrame(({ clock }) => {
        const t = clock.getElapsedTime();
        // Subtle slow orbit if user not interacting
        camera.position.x += Math.sin(t * 0.05) * 0.002;
        camera.position.y += Math.cos(t * 0.03) * 0.001;
        camera.lookAt(0, 0, -8);
    });
    return null;
}

// ----------------- Main Scene -----------------
function SpaceScene() {
    return (
        <>
            {/* ambient + fill lights for general visibility */}
            <ambientLight intensity={0.6} />
            <pointLight
                position={[10, 10, 10]}
                intensity={1.2}
                color={"#bde0ff"}
            />
            <pointLight
                position={[-10, -6, -8]}
                intensity={0.5}
                color={"#7a4fff"}
            />

            {/* Drei stars helper (nice performance, configurable) */}
            <DreiStars
                radius={100}
                depth={50}
                count={8000}
                factor={4}
                saturation={0.4}
                fade
            />

            {/* Star dust (small spheres) */}
            <StarDust count={220} radius={35} />

            {/* Planets / focal points */}
            <Planet position={[6, 0.4, -12]} color={"#9be7ff"} size={2.8} />
            <Planet position={[-4.5, -1.2, -8]} color={"#c8a2ff"} size={1.6} />

            {/* Floating label example */}
            <FloatingLabel position={[6, 2.6, -12]} text={"Kepler-UI"} />

            {/* subtle moveables (small glowing orb) */}
            <mesh position={[1.2, 0.4, -6]}>
                <sphereGeometry args={[0.25, 32, 32]} />
                <meshBasicMaterial emissive={"#9be7ff"} toneMapped={false} />
            </mesh>

            {/* Camera rig can add subtle automated motion */}
            <CameraRig />
        </>
    );
}

// ----------------- UI Overlay (Tailwind) -----------------
function UIOverlay({ onStart }) {
    return (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-between px-6 py-8">
            {/* Top small nav */}
            <div className="w-full flex items-center justify-between max-w-5xl mx-auto">
                <div className="pointer-events-auto flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-cyan-400 rounded-full shadow-lg flex items-center justify-center text-white font-bold">
                        PU
                    </div>
                    <div className="text-slate-200 text-sm font-medium">
                        Stellar — Explore
                    </div>
                </div>
                <div className="pointer-events-auto flex gap-3">
                    <button className="px-3 py-1 rounded-full bg-white/6 text-sm text-slate-200 border border-white/6 backdrop-blur-sm">
                        Docs
                    </button>
                    <button className="px-3 py-1 rounded-full bg-white/6 text-sm text-slate-200 border border-white/6 backdrop-blur-sm">
                        Sign in
                    </button>
                </div>
            </div>

            {/* Center Hero */}
            <div className="flex flex-col items-center gap-6 max-w-2xl mx-auto text-center">
                <motion.h1
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-100/90 to-cyan-200"
                    style={{ textShadow: "0 6px 20px rgba(7,12,23,0.65)" }}
                >
                    Explore the Stars
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                    className="text-slate-200/80 max-w-xl text-base md:text-lg"
                >
                    A modern, interactive 3D landing page built with React &
                    Three.js — drag to orbit, scroll to zoom, and discover
                    floating celestial points.
                </motion.p>

                <div className="pointer-events-auto flex gap-3">
                    <button
                        onClick={onStart}
                        className="px-6 py-3 rounded-full bg-gradient-to-r from-cyan-400 to-indigo-500 font-semibold shadow-2xl text-slate-900"
                    >
                        Start Exploring
                    </button>
                    <button className="px-4 py-3 rounded-full border border-white/8 text-sm text-slate-200">
                        Learn more
                    </button>
                </div>

                <div className="mt-2 text-xs text-slate-300/60">
                    Tip: click and drag the scene to orbit • scroll to zoom
                </div>
            </div>

            {/* Bottom credits */}
            <div className="max-w-5xl w-full mx-auto flex items-center justify-between text-xs text-slate-400">
                <div>Made with ❤️ — React + R3F</div>
                <div>
                    Performance:{" "}
                    <span className="text-slate-200">Optimized</span>
                </div>
            </div>
        </div>
    );
}

// ----------------- Small helper Suspense fallback so code remains single-file -----------------
function SuspenseFallback({ children }) {
    // Minimal wrapper in case the user wants to add textures or lazy assets later
    return <React.Suspense fallback={null}>{children}</React.Suspense>;
}

// ----------------- Main App (Default export) -----------------
export default function LandingPage() {
    const [started, setStarted] = useState(false);

    function handleStart() {
        // Example: we can zoom camera in or trigger animation sequence
        setStarted(true);
        // Could add more stateful interactions (e.g., focus on a planet)
    }

    return (
        <div className="w-screen h-screen bg-gradient-to-b from-slate-900 via-slate-900/95 to-black overflow-hidden relative">
            {/* Canvas full-screen */}
            <Canvas
                camera={{ position: [0, 1.5, 8], fov: 50 }}
                gl={{ antialias: true, powerPreference: "high-performance" }}
                className="w-full h-full"
            >
                {/* Performance: adaptive pixel ratio can be set if desired */}

                {/* Scene */}
                <SuspenseFallback>
                    <SpaceScene />
                </SuspenseFallback>

                {/* Controls: orbit with damping and limited zoom for UX */}
                <OrbitControls
                    enablePan={false}
                    enableZoom={true}
                    minDistance={3}
                    maxDistance={30}
                    rotateSpeed={0.5}
                    zoomSpeed={0.6}
                    dampingFactor={0.12}
                />
            </Canvas>

            {/* UI overlay */}
            <UIOverlay onStart={handleStart} />

            {/* Simple loader from drei (optional) */}
            <div className="absolute right-4 bottom-4 pointer-events-none">
                <Loader />
            </div>

            {/* Small accessibility notice for pointer interactions */}
            <div className="sr-only">
                3D scene. Use mouse drag or touch to explore.
            </div>
        </div>
    );
}
