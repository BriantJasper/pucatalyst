import React, { useRef, useMemo, useState, useEffect, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
    OrbitControls,
    Stars,
    Float,
    Text,
    Html,
    useTexture,
    Environment,
    useGLTF,
} from "@react-three/drei";
import * as THREE from "three";
import { Link } from "react-router-dom";
import {
    FaBolt,
    FaSearch,
    FaUsers,
    FaLock,
    FaBrain,
    FaChartBar,
    FaBullseye,
    FaUser,
    FaTrophy,
    FaFolderOpen,
    FaRocket,
    FaBriefcase,
    FaStar,
    FaCalendarAlt,
    FaGraduationCap,
    FaCertificate,
    FaBook,
    FaCheckCircle,
    FaChartLine,
    FaMoneyBillWave,
    FaComments,
    FaHandsHelping,
    FaGlobe,
    FaSun,
    FaCircle,
    FaVenus,
    FaMars,
    FaStop,
    FaBullseye as FaTarget,
    FaHeart,
    FaEnvelope,
} from "react-icons/fa";
import LoadingAnimation from "../components/ui/LoadingAnimation";

// Page content for each planet section
const PAGE_CONTENT = {
    overview: {
        title: "PU Catalyst",
        subtitle: "Alumni Career Platform",
        description:
            "Connect with successful alumni, discover career paths, and accelerate your professional journey with AI-powered recommendations.",
        cta: { text: "Get Started", link: "/register" },
        secondaryCta: { text: "Learn More", link: "#features" },
    },
    Mercury: {
        title: "Quick Connect",
        subtitle: "Instant Alumni Network",
        description:
            "Like Mercury's swift orbit around the sun, connect instantly with alumni in your field. Browse profiles, send messages, and build meaningful professional relationships.",
        features: [
            {
                icon: <FaBolt className="text-cyan-400" />,
                text: "Instant messaging with alumni",
            },
            {
                icon: <FaSearch className="text-cyan-400" />,
                text: "Smart search by industry",
            },
            {
                icon: <FaUsers className="text-cyan-400" />,
                text: "Connection recommendations",
            },
        ],
    },
    Venus: {
        title: "AI Career Guidance",
        subtitle: "Personalized Recommendations",
        description:
            "Our AI-powered system analyzes successful alumni career paths to provide you with personalized guidance. Discover skills, certifications, and opportunities tailored to your goals.",
        features: [
            {
                icon: <FaBrain className="text-cyan-400" />,
                text: "SBERT-powered matching",
            },
            {
                icon: <FaChartBar className="text-cyan-400" />,
                text: "Skills gap analysis",
            },
            {
                icon: <FaBullseye className="text-cyan-400" />,
                text: "Career path mapping",
            },
        ],
    },
    Earth: {
        title: "Your Home Base",
        subtitle: "Complete Profile Management",
        description:
            "Earth is where you belong. Build your comprehensive profile, showcase your achievements, and let opportunities find you. Your professional identity starts here.",
        features: [
            {
                icon: <FaUser className="text-cyan-400" />,
                text: "Rich profile customization",
            },
            {
                icon: <FaTrophy className="text-cyan-400" />,
                text: "Achievement showcases",
            },
            {
                icon: <FaFolderOpen className="text-cyan-400" />,
                text: "Portfolio management",
            },
        ],
    },
    Mars: {
        title: "Pioneer New Paths",
        subtitle: "Explore Career Opportunities",
        description:
            "Like the pioneers heading to Mars, explore new career frontiers. Access job postings, internships, and opportunities shared exclusively by alumni.",
        features: [
            {
                icon: <FaRocket className="text-cyan-400" />,
                text: "Exclusive job listings",
            },
            {
                icon: <FaBriefcase className="text-cyan-400" />,
                text: "Internship programs",
            },
            {
                icon: <FaStar className="text-cyan-400" />,
                text: "Startup connections",
            },
        ],
    },
    Jupiter: {
        title: "Giant Impact",
        subtitle: "Events & Mentorship",
        description:
            "Jupiter's massive presence shapes the solar system. Similarly, our events and mentorship programs create lasting impact on your career trajectory.",
        features: [
            {
                icon: <FaCalendarAlt className="text-cyan-400" />,
                text: "Alumni networking events",
            },
            {
                icon: <FaGraduationCap className="text-cyan-400" />,
                text: "1-on-1 mentorship",
            },
            {
                icon: <FaTrophy className="text-cyan-400" />,
                text: "Workshops & webinars",
            },
        ],
    },
    Saturn: {
        title: "Structured Success",
        subtitle: "Learning & Certifications",
        description:
            "Like Saturn's beautiful rings, build structured layers of skills. Access recommended certifications and learning paths validated by successful alumni.",
        features: [
            {
                icon: <FaCertificate className="text-cyan-400" />,
                text: "Certification guidance",
            },
            {
                icon: <FaBook className="text-cyan-400" />,
                text: "Curated learning paths",
            },
            {
                icon: <FaCheckCircle className="text-cyan-400" />,
                text: "Skill verification",
            },
        ],
    },
    Uranus: {
        title: "Unique Perspective",
        subtitle: "Analytics & Insights",
        description:
            "Uranus rotates on its side, offering a unique view. Gain unique insights into industry trends, salary data, and career statistics from alumni data.",
        features: [
            {
                icon: <FaChartLine className="text-cyan-400" />,
                text: "Industry trend analysis",
            },
            {
                icon: <FaMoneyBillWave className="text-cyan-400" />,
                text: "Salary benchmarking",
            },
            {
                icon: <FaChartBar className="text-cyan-400" />,
                text: "Career projections",
            },
        ],
    },
    Neptune: {
        title: "Deep Connections",
        subtitle: "Alumni Community",
        description:
            "Neptune's deep blue mysteries await exploration. Dive deep into our alumni community forums, discussion groups, and collaborative projects.",
        features: [
            {
                icon: <FaComments className="text-cyan-400" />,
                text: "Discussion forums",
            },
            {
                icon: <FaUsers className="text-cyan-400" />,
                text: "Interest groups",
            },
            {
                icon: <FaHandsHelping className="text-cyan-400" />,
                text: "Collaborative projects",
            },
        ],
    },
    Sun: {
        title: "The Source",
        subtitle: "About PU Catalyst",
        description:
            "Just as the Sun powers our solar system, PU Catalyst powers your career journey. Join thousands of alumni and students building brighter futures together.",
        stats: [
            { value: "10,000+", label: "Alumni Network" },
            { value: "500+", label: "Companies Connected" },
            { value: "95%", label: "Satisfaction Rate" },
            { value: "50+", label: "Industries Covered" },
        ],
        cta: { text: "Join Now", link: "/register" },
    },
};

// Global quality toggle tuned for low-power GPUs (e.g., MX150)
const LOW_QUALITY = true;

// Only preload essential models (Earth for intro, Sun as focal point)
useGLTF.preload("/assets/3d/earth.glb");
useGLTF.preload("/assets/3d/sun.glb");

// Camera configuration per planet for easy tuning
const PLANET_CAMERA_CONFIG = {
    Sun: {
        offset: [5, 4, 5],
        lookOffset: [0, 0, 0],
    },
    Mercury: {
        offset: [0.05, 0.025, 0.05],
        lookOffset: [0, 0, 0],
    },
    Venus: {
        offset: [0.05, 0.025, 0.05],
        lookOffset: [0, 0, 0],
    },
    Earth: {
        offset: [1, 0.5, 1],
        lookOffset: [0, 0, 0],
    },
    Mars: {
        offset: [0.05, 0.05, 0.05],
        lookOffset: [0, 0, 0],
    },
    Jupiter: {
        offset: [0.05, 0.025, 0.05],
        lookOffset: [0, 0, 0],
    },
    Saturn: {
        offset: [1, 1, 1],
        lookOffset: [0, 0, 0],
    },
    Uranus: {
        offset: [0.05, 0.025, 0.05],
        lookOffset: [0, 0, 0],
    },
    Neptune: {
        offset: [1, 1, 1],
        lookOffset: [0, 0, 0],
    },
};

// Planet data for solar system - Optimized for performance
const PLANETS = [
    {
        name: "Sun",
        size: 15,
        color: "#ffdd55",
        position: [0, 0, -60],
        orbitRadius: 0,
        speed: 0,
        modelPath: "/assets/3d/sun.glb",
    },
    {
        name: "Mercury",
        size: 5,
        color: "#8c7853",
        position: [0, 0, -5],
        orbitRadius: 4,
        speed: 0.01,
        modelPath: "/assets/3d/mercury.glb",
    },
    {
        name: "Venus",
        size: 20,
        color: "#ffd93d",
        position: [8, 1, -10],
        orbitRadius: 6,
        speed: 0.008,
        modelPath: "/assets/3d/venus.glb",
    },
    {
        name: "Earth",
        size: 0.65,
        color: "#4ecdc4",
        position: [-10, -1.5, -15],
        orbitRadius: 8,
        speed: 0.006,
        modelPath: "/assets/3d/earth.glb",
    },
    {
        name: "Mars",
        size: 5,
        color: "#ff6b6b",
        position: [12, 0.5, -20],
        orbitRadius: 10,
        speed: 0.005,
        modelPath: "/assets/3d/mars.glb",
    },
    {
        name: "Jupiter",
        size: 30,
        color: "#f4a261",
        position: [-15, -1, -28],
        orbitRadius: 14,
        speed: 0.003,
        modelPath: "/assets/3d/jupiter.glb",
    },
    {
        name: "Saturn",
        size: 0.11,
        color: "#e9c46a",
        position: [18, 1.5, -36],
        orbitRadius: 18,
        speed: 0.002,
        modelPath: "/assets/3d/saturn.glb",
    },
    {
        name: "Uranus",
        size: 0.1,
        color: "#a8dadc",
        position: [-20, -0.5, -44],
        orbitRadius: 22,
        speed: 0.0015,
        modelPath: "/assets/3d/uranus.glb",
    },
    {
        name: "Neptune",
        size: 0.3,
        color: "#457b9d",
        position: [22, 1, -52],
        orbitRadius: 26,
        speed: 0.001,
        modelPath: "/assets/3d/neptune.glb",
    },
];

// Display order for scroll/sidebar navigation (Sun last)
const PLANET_DISPLAY_ORDER = [
    "Mercury",
    "Venus",
    "Earth",
    "Mars",
    "Jupiter",
    "Saturn",
    "Uranus",
    "Neptune",
    "Sun", // Sun is now last in the logical order
];

// Map display order to actual PLANETS array indices
const orderedPlanetIndices = PLANET_DISPLAY_ORDER.map((name) =>
    PLANETS.findIndex((p) => p.name === name)
);

// Generic Planet Model Component - Optimized
const PlanetModel = React.memo(function PlanetModel({
    modelPath,
    scale = 1,
    ...props
}) {
    const { scene } = useGLTF(modelPath);

    // Clone and optimize the scene
    const clonedScene = useMemo(() => {
        const clone = scene.clone();
        // Traverse and optimize materials
        clone.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = false;
                child.receiveShadow = false;
                child.frustumCulled = true;
                if (child.material) {
                    child.material.precision = "lowp";
                    // Reduce texture quality for low-end devices
                    if (LOW_QUALITY && child.material.map) {
                        child.material.map.minFilter = THREE.LinearFilter;
                        child.material.map.generateMipmaps = false;
                    }
                }
                // Simplify geometry if possible
                if (LOW_QUALITY && child.geometry) {
                    child.geometry.computeBoundingSphere();
                }
            }
        });
        return clone;
    }, [scene]);

    // Slightly reduce overall scale to lower pixel cost
    return <primitive object={clonedScene} scale={scale * 0.008} {...props} />;
});

// Loading Screen Component
function LoadingScreen({ progress, onComplete }) {
    return (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
            <div className="text-center space-y-8">
                <div className="relative">
                    <div className="w-32 h-32 mx-auto">
                        <svg
                            className="animate-spin-slow"
                            viewBox="0 0 100 100"
                        >
                            <circle
                                cx="50"
                                cy="50"
                                r="45"
                                fill="none"
                                stroke="url(#gradient)"
                                strokeWidth="3"
                                strokeDasharray="283"
                                strokeDashoffset={283 - (283 * progress) / 100}
                                className="transition-all duration-300"
                            />
                            <defs>
                                <linearGradient
                                    id="gradient"
                                    x1="0%"
                                    y1="0%"
                                    x2="100%"
                                    y2="100%"
                                >
                                    <stop offset="0%" stopColor="#06b6d4" />
                                    <stop offset="100%" stopColor="#a855f7" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold text-white">
                            {Math.round(progress)}%
                        </span>
                    </div>
                </div>

                <LoadingAnimation />

                <div className="flex gap-2 justify-center">
                    {[0, 1, 2].map((i) => (
                        <div
                            key={i}
                            className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse"
                            style={{ animationDelay: `${i * 0.2}s` }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

// Intro Animation - Zoom out from Earth
function IntroAnimation({ startAnim, onComplete }) {
    const { camera } = useThree();
    const earthGroupRef = useRef();
    const startTime = useRef(null);

    useFrame((state) => {
        if (!startAnim) {
            // Keep camera close to Earth while waiting for loading to finish
            camera.position.set(-10, -1, -14);
            camera.lookAt(-5, -1.5, -10);
            return;
        }

        if (startTime.current === null) {
            startTime.current = state.clock.elapsedTime;
        }

        const elapsed = state.clock.elapsedTime - startTime.current;

        // Zoom out from Earth to reveal solar system (3 seconds)
        const progress = Math.min(elapsed / 3, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // Ease out cubic

        // Start: Close to Earth [-10, -1, -14]
        // End: Back to overview position to see solar system

        camera.position.x = THREE.MathUtils.lerp(-10, 0, eased);
        camera.position.y = THREE.MathUtils.lerp(-1, 2.5, eased);
        camera.position.z = THREE.MathUtils.lerp(-14, 15, eased);

        // Gradually shift look target from Earth to center of solar system
        const lookX = THREE.MathUtils.lerp(-10, 0, eased);
        const lookY = THREE.MathUtils.lerp(-1.5, 0, eased);
        const lookZ = THREE.MathUtils.lerp(-15, -10, eased);
        camera.lookAt(lookX, lookY, lookZ);

        if (earthGroupRef.current) {
            // Match rotation speed of main scene
            earthGroupRef.current.rotation.y = state.clock.elapsedTime * 0.006;
        }

        if (progress >= 1) {
            onComplete();
        }
    });

    return (
        <group>
            {/* Distant Earth during intro */}
            <Float speed={2} rotationIntensity={0.1}>
                <group ref={earthGroupRef} position={[-10, -1.5, -15]}>
                    <PlanetModel
                        modelPath="/assets/3d/earth.glb"
                        scale={0.65}
                    />
                </group>
            </Float>

            {/* Background stars - Reduced count */}
            <Stars
                radius={70}
                depth={35}
                count={LOW_QUALITY ? 400 : 800}
                factor={2.5}
                fade
                speed={0.3}
            />
        </group>
    );
}

// Individual Planet with orbital animation - Optimized
const Planet = React.memo(function Planet({
    data,
    index,
    currentPlanet,
    onClick,
    positionRef,
}) {
    const meshRef = useRef();
    const groupRef = useRef();
    const [hovered, setHovered] = useState(false);
    const isActive = currentPlanet === index;
    const frameCount = useRef(0);

    useFrame((state) => {
        // Throttle updates - only every 2nd frame for orbit, every frame for rotation
        frameCount.current++;

        if (meshRef.current) {
            // Rotate planet - smooth rotation every frame
            meshRef.current.rotation.y =
                state.clock.elapsedTime *
                (data.name === "Earth" ? 0.003 : data.speed);
        }

        // Orbital animation - throttled
        if (groupRef.current && frameCount.current % 2 === 0) {
            const time = state.clock.elapsedTime * data.speed;
            groupRef.current.position.x = Math.cos(time) * data.orbitRadius;
            groupRef.current.position.y = data.position[1];
            groupRef.current.position.z =
                Math.sin(time) * data.orbitRadius - 30;

            // Update position ref for camera tracking
            if (positionRef) {
                positionRef.copy(groupRef.current.position);
            }
        }
    });

    return (
        <group ref={groupRef} position={data.position}>
            <group
                ref={meshRef}
                onPointerOver={() => setHovered(true)}
                onPointerOut={() => setHovered(false)}
                onClick={onClick}
                scale={hovered || isActive ? 1.15 : 1}
            >
                <PlanetModel modelPath={data.modelPath} scale={data.size} />
            </group>

            {/* Planet label */}
            {(hovered || isActive) && (
                <Html position={[0, data.size + 0.8, 0]} center>
                    <div className="bg-black/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20 whitespace-nowrap">
                        <div className="text-white font-bold text-lg">
                            {data.name}
                        </div>
                        <div className="text-cyan-300 text-sm">{data.info}</div>
                    </div>
                </Html>
            )}
        </group>
    );
});

// Saturn with rings - Optimized
const Saturn = React.memo(function Saturn({
    data,
    index,
    currentPlanet,
    onClick,
    positionRef,
}) {
    const meshRef = useRef();
    const groupRef = useRef();
    const [hovered, setHovered] = useState(false);
    const frameCount = useRef(0);
    const isActive = currentPlanet === index;

    useFrame((state) => {
        frameCount.current++;

        if (meshRef.current) {
            meshRef.current.rotation.y += data.speed;
        }

        // Throttle orbital animation
        if (groupRef.current && frameCount.current % 2 === 0) {
            const time = state.clock.elapsedTime * data.speed;
            groupRef.current.position.x = Math.cos(time) * data.orbitRadius;
            groupRef.current.position.y = data.position[1];
            groupRef.current.position.z =
                Math.sin(time) * data.orbitRadius - 30;

            // Update position ref for camera tracking
            if (positionRef) {
                positionRef.copy(groupRef.current.position);
            }
        }
    });
    return (
        <group ref={groupRef} position={data.position}>
            <group
                ref={meshRef}
                onPointerOver={() => setHovered(true)}
                onPointerOut={() => setHovered(false)}
                onClick={onClick}
                scale={hovered || isActive ? 1.15 : 1}
            >
                <PlanetModel modelPath={data.modelPath} scale={data.size} />
            </group>

            {/* Label */}
            {(hovered || isActive) && (
                <Html position={[0, data.size + 0.8, 0]} center>
                    <div className="bg-black/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20 whitespace-nowrap">
                        <div className="text-white font-bold text-lg">
                            {data.name}
                        </div>
                        <div className="text-cyan-300 text-sm">{data.info}</div>
                    </div>
                </Html>
            )}
        </group>
    );
});

// Star trails - Optimized with reduced particles
const StarTrails = React.memo(function StarTrails({ active }) {
    const trails = useRef();
    const count = LOW_QUALITY ? 30 : 60;

    const particles = useMemo(() => {
        const positions = new Float32Array(count * 3);
        const velocities = [];

        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * 15 + 5;

            positions[i * 3] = Math.cos(angle) * radius;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
            positions[i * 3 + 2] = Math.random() * -50 - 10;

            velocities.push(Math.random() * 0.5 + 0.3);
        }

        return { positions, velocities };
    }, []);

    // Throttle frame updates for performance
    const frameCount = useRef(0);
    useFrame(() => {
        if (!active || !trails.current) return;

        // Only update every 2nd frame for performance
        frameCount.current++;
        if (frameCount.current % 2 !== 0) return;

        const positions = trails.current.geometry.attributes.position.array;
        for (let i = 0; i < count; i++) {
            positions[i * 3 + 2] += particles.velocities[i] * 2; // Compensate for skipped frames
            if (positions[i * 3 + 2] > 2) {
                positions[i * 3 + 2] = -50;
            }
        }
        trails.current.geometry.attributes.position.needsUpdate = true;
    });

    return (
        <points ref={trails}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={count}
                    array={particles.positions}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.1}
                color="#00ffff"
                transparent
                opacity={active ? 0.8 : 0.3}
                blending={THREE.AdditiveBlending}
            />
        </points>
    );
});

// Orbit line component for visualizing planet paths - Memoized - Memoized
const OrbitLine = React.memo(function OrbitLine({ radius, color = "#ffffff" }) {
    const points = useMemo(() => {
        const segments = LOW_QUALITY ? 32 : 64; // Reduced segments
        const pts = [];
        for (let i = 0; i <= segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            pts.push(
                new THREE.Vector3(
                    Math.cos(angle) * radius,
                    0,
                    Math.sin(angle) * radius - 30
                )
            );
        }
        return pts;
    }, [radius]);

    const lineGeometry = useMemo(() => {
        return new THREE.BufferGeometry().setFromPoints(points);
    }, [points]);

    return (
        <line geometry={lineGeometry}>
            <lineBasicMaterial
                color={color}
                transparent
                opacity={0.3}
                blending={THREE.AdditiveBlending}
            />
        </line>
    );
});

// Camera controller for scroll navigation
function CameraController({
    currentPlanet,
    introComplete,
    controlsRef,
    planetRefs,
    isUserInteracting,
}) {
    const { camera } = useThree();
    const targetPosition = useRef(new THREE.Vector3(0, 2.5, 15));
    const targetLookAt = useRef(new THREE.Vector3(0, 0, -10));
    const initialized = useRef(false);

    useFrame((state, delta) => {
        if (!introComplete) return;

        // Initialize camera at overview position on first frame after intro
        if (!initialized.current) {
            camera.position.set(0, 1, 8);
            if (controlsRef.current) {
                controlsRef.current.target.set(0, 0, -15);
            }
            initialized.current = true;
        }

        // Update target positions based on current planet only when
        // user is not actively dragging the view
        if (!isUserInteracting.current) {
            if (currentPlanet === -1) {
                // Start at solar system overview - closer view
                targetPosition.current.set(0, 2, 8);
                targetLookAt.current.set(0, 0, -15);
            } else if (currentPlanet >= 0 && currentPlanet < PLANETS.length) {
                const planetPos = planetRefs.current[currentPlanet];
                const planet = PLANETS[currentPlanet];
                if (planetPos && planetPos.x !== undefined && planet) {
                    const config = PLANET_CAMERA_CONFIG[planet.name] || {
                        offset: [4, 1, 4],
                        lookOffset: [0, 0, 0],
                    };

                    const [offX, offY, offZ] = config.offset;
                    const [lookOffX, lookOffY, lookOffZ] = config.lookOffset;

                    targetPosition.current.set(
                        planetPos.x + offX,
                        planetPos.y + offY,
                        planetPos.z + offZ
                    );

                    targetLookAt.current.set(
                        planetPos.x + lookOffX,
                        planetPos.y + lookOffY,
                        planetPos.z + lookOffZ
                    );
                }
            }
        }

        // Smoothly move camera
        camera.position.lerp(targetPosition.current, 1.5 * delta);

        // Update OrbitControls target to match where we want to look
        if (controlsRef.current) {
            controlsRef.current.target.lerp(targetLookAt.current, 1.5 * delta);
            controlsRef.current.update();
        }
    });

    return null;
}

// Main 3D Scene
function Scene({
    currentPlanet,
    warpActive,
    introComplete,
    onIntroComplete,
    loading,
}) {
    const controlsRef = useRef();
    const planetRefs = useRef(PLANETS.map(() => new THREE.Vector3()));
    const isUserInteracting = useRef(false);
    const [sceneReady, setSceneReady] = useState(false);

    // Mark scene as ready after a brief moment to ensure all assets are loaded
    useEffect(() => {
        if (introComplete && !loading) {
            const timer = setTimeout(() => setSceneReady(true), 200);
            return () => clearTimeout(timer);
        }
    }, [introComplete, loading]);

    return (
        <>
            {/* Keep IntroAnimation visible until scene is fully ready */}
            {(!introComplete || !sceneReady) && (
                <IntroAnimation
                    startAnim={!loading}
                    onComplete={onIntroComplete}
                />
            )}

            {/* Render main scene */}
            {sceneReady && (
                <>
                    {/* Optimized Lighting Setup */}
                    {/* Ambient light for overall visibility */}
                    <ambientLight intensity={0.5} color="#ffffff" />

                    {/* Main directional light simulating a star/sun */}
                    <directionalLight
                        position={[0, 0, 20]}
                        intensity={1}
                        color="#fff5e6"
                    />

                    {/* Single accent light for depth and planet highlighting */}
                    <pointLight
                        position={[15, 10, 0]}
                        intensity={0.25}
                        color="#ffa500"
                        distance={35}
                        decay={2}
                    />

                    {/* Stars - Reduced count for performance */}
                    <Stars
                        radius={35}
                        depth={22}
                        count={LOW_QUALITY ? 400 : 700}
                        factor={2}
                        fade
                        speed={0.2}
                    />

                    {/* HDR Nebulae Environment */}
                    <Environment
                        files="/assets/3d/HDR_multi_nebulae.hdr"
                        background
                        backgroundBlurriness={0} // No blur for sharp quality
                        backgroundIntensity={3} // Balanced intensity
                    />

                    <StarTrails active={warpActive} />

                    {/* Render orbit lines */}
                    {PLANETS.map(
                        (planet) =>
                            planet.orbitRadius > 0 && (
                                <OrbitLine
                                    key={`orbit-${planet.name}`}
                                    radius={planet.orbitRadius}
                                    color={planet.color}
                                />
                            )
                    )}

                    {/* Render all planets */}
                    {PLANETS.map((planet, index) =>
                        planet.name === "Saturn" ? (
                            <Saturn
                                key={planet.name}
                                data={planet}
                                index={index}
                                currentPlanet={currentPlanet}
                                onClick={() => {}}
                                positionRef={planetRefs.current[index]}
                            />
                        ) : (
                            <Planet
                                key={planet.name}
                                data={planet}
                                index={index}
                                currentPlanet={currentPlanet}
                                onClick={() => {}}
                                positionRef={planetRefs.current[index]}
                            />
                        )
                    )}

                    {/* Camera controls */}
                    <OrbitControls
                        ref={controlsRef}
                        enableZoom={false}
                        enablePan={true}
                        enableDamping={true}
                        dampingFactor={0.05}
                        minDistance={1}
                        maxDistance={25}
                        rotateSpeed={0.5}
                        zoomSpeed={0.5}
                        target={[0, 0, -10]}
                        onStart={() => (isUserInteracting.current = true)}
                        onEnd={() => (isUserInteracting.current = false)}
                    />

                    <CameraController
                        currentPlanet={currentPlanet}
                        introComplete={introComplete}
                        controlsRef={controlsRef}
                        planetRefs={planetRefs}
                        isUserInteracting={isUserInteracting}
                    />
                </>
            )}
        </>
    );
}

// Planet navigation sidebar
function PlanetNav({ currentPlanet, onPlanetSelect }) {
    return (
        <div className="fixed right-8 top-1/2 -translate-y-1/2 z-20">
            <div className="bg-black/30 backdrop-blur-sm p-3 rounded-full border border-white/10">
                <div className="space-y-3">
                    {orderedPlanetIndices.map((planetIndex, stepIndex) => {
                        const planet = PLANETS[planetIndex];
                        const isActive = currentPlanet === planetIndex;
                        return (
                            <div key={planet.name} className="relative group">
                                <button
                                    onClick={() => onPlanetSelect(stepIndex)}
                                    className={`block w-4 h-4 rounded-full transition-all duration-300 ${
                                        isActive
                                            ? "scale-150 ring-2 ring-white shadow-lg"
                                            : "scale-100 opacity-60 hover:opacity-100 hover:scale-125"
                                    }`}
                                    style={{
                                        backgroundColor: planet.color,
                                        boxShadow: isActive
                                            ? `0 0 15px ${planet.color}`
                                            : "none",
                                    }}
                                    title={planet.name}
                                />
                                {/* Tooltip */}
                                <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                    <div className="bg-black/80 backdrop-blur-sm px-3 py-1 rounded-lg whitespace-nowrap border border-white/20">
                                        <span className="text-white text-sm font-medium">
                                            {planet.name}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

// Memoize PlanetNav to prevent unnecessary re-renders
const MemoizedPlanetNav = React.memo(PlanetNav);

// UI Overlay - Memoized
const UIOverlay = React.memo(function UIOverlay({
    currentPlanet,
    warpActive,
    setWarpActive,
    introComplete,
}) {
    if (!introComplete) return null;

    const planet = PLANETS[currentPlanet] || PLANETS[0];
    const content =
        currentPlanet >= 0 ? PAGE_CONTENT[planet.name] : PAGE_CONTENT.overview;

    return (
        <>
            {/* Overview / Hero Section */}
            {currentPlanet === -1 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-center space-y-6 px-4 max-w-4xl mx-auto">
                        {/* Logo/Brand */}
                        <div className="mb-4 animate-fade-in">
                            <span className="text-cyan-400 text-lg tracking-widest uppercase font-medium">
                                Welcome to
                            </span>
                        </div>

                        <h1 className="text-6xl md:text-8xl font-bold text-white tracking-wider animate-fade-in">
                            <span
                                className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text"
                                style={{
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                    backgroundClip: "text",
                                    color: "transparent",
                                }}
                            >
                                {content.title}
                            </span>
                        </h1>

                        <h2 className="text-2xl md:text-3xl text-purple-300 font-light animate-fade-in-delay">
                            {content.subtitle}
                        </h2>

                        <p className="text-lg md:text-xl text-cyan-100/80 font-light max-w-2xl mx-auto animate-fade-in-delay leading-relaxed">
                            {content.description}
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex gap-4 justify-center items-center pt-8 animate-fade-in-delay-2">
                            <Link
                                to={content.cta.link}
                                className="pointer-events-auto px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold rounded-full hover:scale-105 transition-all shadow-lg shadow-cyan-500/50 hover:shadow-cyan-500/70"
                            >
                                {content.cta.text}
                            </Link>
                            <Link
                                to="/login"
                                className="pointer-events-auto px-8 py-4 bg-transparent text-white font-semibold rounded-full hover:bg-white/10 transition-all border-2 border-white"
                            >
                                Sign In
                            </Link>
                        </div>

                        {/* Feature Highlights */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 animate-fade-in-delay-2">
                            <div className="pointer-events-auto bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10 hover:border-cyan-500/50 transition-all hover:bg-white/10">
                                <div className="text-4xl mb-3">
                                    <FaBullseye className="text-cyan-400" />
                                </div>
                                <h3 className="text-white font-semibold mb-2">
                                    AI-Powered
                                </h3>
                                <p className="text-gray-400 text-sm">
                                    Smart career recommendations using advanced
                                    AI
                                </p>
                            </div>
                            <div className="pointer-events-auto bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10 hover:border-purple-500/50 transition-all hover:bg-white/10">
                                <div className="text-4xl mb-3">
                                    <FaUsers className="text-cyan-400" />
                                </div>
                                <h3 className="text-white font-semibold mb-2">
                                    Alumni Network
                                </h3>
                                <p className="text-gray-400 text-sm">
                                    Connect with successful graduates worldwide
                                </p>
                            </div>
                            <div className="pointer-events-auto bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10 hover:border-pink-500/50 transition-all hover:bg-white/10">
                                <div className="text-4xl mb-3">
                                    <FaLock className="text-cyan-400" />
                                </div>
                                <h3 className="text-white font-semibold mb-2">
                                    Secure Login
                                </h3>
                                <p className="text-gray-400 text-sm">
                                    Face recognition authentication
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Scroll Indicator */}
                    <div className="absolute bottom-8 animate-bounce">
                        <div className="text-center">
                            <p className="text-white/50 text-sm mb-2">
                                Scroll to explore
                            </p>
                            <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center pt-2 mx-auto">
                                <div className="w-1 h-3 bg-white/70 rounded-full"></div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Planet Content Sections */}
            {currentPlanet >= 0 && content && (
                <div className="absolute inset-0">
                    {/* Top Navigation Bar */}
                    <div className="absolute top-0 left-0 right-0 p-6">
                        <div className="flex justify-between items-center max-w-7xl mx-auto">
                            <Link to="/" className="pointer-events-auto">
                                <span
                                    className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text"
                                    style={{
                                        WebkitBackgroundClip: "text",
                                        WebkitTextFillColor: "transparent",
                                        backgroundClip: "text",
                                        color: "transparent",
                                    }}
                                >
                                    PU Catalyst
                                </span>
                            </Link>
                            <div className="flex gap-4 pointer-events-auto">
                                <Link
                                    to="/login"
                                    className="px-6 py-2 bg-transparent text-white font-semibold rounded-full hover:bg-white/10 transition-all border-2 border-white"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    to="/register"
                                    className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-full hover:scale-105 transition-transform"
                                >
                                    Get Started
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Card */}
                    <div className="absolute bottom-8 left-8 right-8 md:right-auto md:max-w-lg animate-slide-up">
                        <div className="bg-black/70 backdrop-blur-xl p-8 rounded-3xl border border-white/20 shadow-2xl">
                            {/* Planet indicator */}
                            <div className="flex items-center gap-4 mb-6">
                                <div
                                    className="w-14 h-14 rounded-full flex items-center justify-center"
                                    style={{
                                        backgroundColor: planet.color,
                                        boxShadow: `0 0 30px ${planet.color}`,
                                    }}
                                >
                                    <span className="text-2xl">
                                        {planet.name === "Sun" ? (
                                            <FaSun />
                                        ) : planet.name === "Mercury" ? (
                                            <FaCircle />
                                        ) : planet.name === "Venus" ? (
                                            <FaVenus />
                                        ) : planet.name === "Earth" ? (
                                            <FaGlobe />
                                        ) : planet.name === "Mars" ? (
                                            <FaMars />
                                        ) : (
                                            <FaCircle />
                                        )}
                                    </span>
                                </div>
                                <div>
                                    <h2 className="text-3xl font-bold text-white">
                                        {content.title}
                                    </h2>
                                    <p className="text-cyan-300 font-medium">
                                        {content.subtitle}
                                    </p>
                                </div>
                            </div>

                            {/* Description */}
                            <p className="text-gray-300 leading-relaxed mb-6">
                                {content.description}
                            </p>

                            {/* Features List */}
                            {content.features && (
                                <div className="space-y-3 mb-6">
                                    {content.features.map((feature, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center gap-3 text-white/90"
                                        >
                                            <span className="text-xl">
                                                {feature.icon}
                                            </span>
                                            <span>{feature.text}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Stats Grid (for Sun/About section) */}
                            {content.stats && (
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    {content.stats.map((stat, idx) => (
                                        <div
                                            key={idx}
                                            className="bg-white/5 rounded-xl p-4 text-center"
                                        >
                                            <div
                                                className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text"
                                                style={{
                                                    WebkitBackgroundClip:
                                                        "text",
                                                    WebkitTextFillColor:
                                                        "transparent",
                                                    backgroundClip: "text",
                                                    color: "transparent",
                                                }}
                                            >
                                                {stat.value}
                                            </div>
                                            <div className="text-gray-400 text-sm">
                                                {stat.label}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* CTA Button (if present) */}
                            {content.cta && (
                                <Link
                                    to={content.cta.link}
                                    className="pointer-events-auto inline-block w-full text-center px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold rounded-xl hover:scale-[1.02] transition-transform shadow-lg"
                                >
                                    {content.cta.text}
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Right side - Quick Facts */}
                    {currentPlanet >= 0 && planet.name !== "Sun" && (
                        <div className="hidden lg:block absolute top-1/2 right-8 -translate-y-1/2 animate-fade-in">
                            <div className="bg-black/50 backdrop-blur-sm p-6 rounded-2xl border border-white/10 max-w-xs">
                                <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                                    <span className="text-cyan-400">✦</span>{" "}
                                    Planet Facts
                                </h4>
                                <div className="space-y-3 text-sm text-gray-300">
                                    <div className="flex justify-between">
                                        <span>Distance:</span>
                                        <span className="text-cyan-300">
                                            {planet.orbitRadius * 10}M km
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Diameter:</span>
                                        <span className="text-cyan-300">
                                            {(planet.size * 10000).toFixed(0)}{" "}
                                            km
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Orbit:</span>
                                        <span className="text-cyan-300">
                                            {((1 / planet.speed) * 10).toFixed(
                                                1
                                            )}{" "}
                                            days
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Progress indicator */}
            <div className="absolute top-8 left-1/2 -translate-x-1/2">
                <div className="bg-black/40 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20">
                    <span className="text-white font-semibold">
                        {currentPlanet >= 0
                            ? `${
                                  orderedPlanetIndices.indexOf(currentPlanet) +
                                  1
                              } / ${PLANETS.length}`
                            : "Overview"}
                    </span>
                </div>
            </div>

            {/* Warp Button - Always visible */}
            <div className="fixed bottom-8 right-8 z-20">
                <button
                    onClick={() => setWarpActive(!warpActive)}
                    className="pointer-events-auto px-6 py-3 bg-black/50 backdrop-blur-sm text-white font-medium rounded-full hover:bg-black/70 transition-all border border-white/20 flex items-center gap-2"
                >
                    <span>{warpActive ? <FaStop /> : <FaRocket />}</span>
                    {warpActive ? "Exit Warp" : "Warp Speed"}
                </button>
            </div>
        </>
    );
});

// Main App
export default function LandingPage3D() {
    const [loading, setLoading] = useState(true);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [introComplete, setIntroComplete] = useState(false);
    const [currentPlanet, setCurrentPlanet] = useState(-1);
    const [warpActive, setWarpActive] = useState(false);

    // Simulate loading - faster progression
    useEffect(() => {
        const interval = setInterval(() => {
            setLoadingProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setTimeout(() => setLoading(false), 300);
                    return 100;
                }
                return prev + 4; // Faster loading
            });
        }, 30);

        return () => clearInterval(interval);
    }, []);

    // Handle scroll-based planet navigation with throttling
    useEffect(() => {
        if (!introComplete) return;

        let ticking = false;
        let lastPlanet = -1;

        const handleScroll = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    const scrollPercent =
                        window.scrollY /
                        (document.documentElement.scrollHeight -
                            window.innerHeight);
                    const totalStops = PLANETS.length + 1;
                    const rawStep = Math.floor(scrollPercent * totalStops) - 1;

                    let newPlanet;
                    if (rawStep < 0) {
                        newPlanet = -1;
                    } else {
                        const clampedStep = Math.min(
                            rawStep,
                            PLANETS.length - 1
                        );
                        newPlanet = orderedPlanetIndices[clampedStep];
                    }

                    // Only update if planet changed
                    if (newPlanet !== lastPlanet) {
                        lastPlanet = newPlanet;
                        setCurrentPlanet(newPlanet);
                    }
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, [introComplete]);

    const handleIntroComplete = () => {
        setIntroComplete(true);
    };

    return (
        <div className="w-full relative bg-black">
            {loading && <LoadingScreen progress={loadingProgress} />}

            {/* Canvas with extra height for scrolling */}
            <div className="fixed inset-0 z-0">
                <Canvas
                    camera={{ position: [0, 0, 100], fov: 60 }}
                    gl={{
                        antialias: false, // Disable antialiasing for performance
                        alpha: false,
                        powerPreference: "high-performance",
                        stencil: false,
                        depth: true,
                        failIfMajorPerformanceCaveat: false,
                    }}
                    dpr={LOW_QUALITY ? 0.75 : 1} // Lower DPR for performance
                    performance={{ min: 0.2 }} // Allow lower frame rates
                    frameloop="always" // Always render for smooth animations
                >
                    <color attach="background" args={["#000510"]} />
                    <fog attach="fog" args={["#000510", 15, 60]} />
                    <Suspense fallback={null}>
                        <Scene
                            currentPlanet={currentPlanet}
                            warpActive={warpActive}
                            introComplete={introComplete}
                            onIntroComplete={handleIntroComplete}
                            loading={loading}
                        />
                    </Suspense>
                </Canvas>
            </div>

            {/* UI Overlays - must be above Canvas z-0 */}
            <div className="fixed inset-0 z-10 pointer-events-none">
                <UIOverlay
                    currentPlanet={currentPlanet}
                    warpActive={warpActive}
                    setWarpActive={setWarpActive}
                    introComplete={introComplete}
                />
            </div>

            {introComplete && (
                <MemoizedPlanetNav
                    currentPlanet={currentPlanet}
                    onPlanetSelect={(i) => {
                        const scrollTarget =
                            ((i + 1) / (PLANETS.length + 1)) *
                            (document.documentElement.scrollHeight -
                                window.innerHeight);
                        window.scrollTo({
                            top: scrollTarget,
                            behavior: "smooth",
                        });
                    }}
                />
            )}

            {/* Spacer for scroll */}
            {introComplete && <div style={{ height: "600vh" }} />}

            {/* Footer Section - appears at the very end */}
            {introComplete && (
                <footer className="relative z-30 bg-gradient-to-t from-black via-black/95 to-transparent">
                    <div className="max-w-7xl mx-auto px-8 py-16">
                        {/* Main Footer Content */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                            {/* Brand Column */}
                            <div className="md:col-span-1">
                                <h3
                                    className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text mb-4"
                                    style={{
                                        WebkitBackgroundClip: "text",
                                        WebkitTextFillColor: "transparent",
                                        backgroundClip: "text",
                                        color: "transparent",
                                    }}
                                >
                                    PU Catalyst
                                </h3>
                                <p className="text-gray-400 text-sm leading-relaxed mb-4">
                                    Connecting alumni and students to build
                                    brighter futures through AI-powered career
                                    guidance.
                                </p>
                                <div className="flex gap-4">
                                    <a
                                        href="#"
                                        className="text-gray-400 hover:text-cyan-400 transition-colors"
                                    >
                                        <svg
                                            className="w-5 h-5"
                                            fill="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                                        </svg>
                                    </a>
                                    <a
                                        href="#"
                                        className="text-gray-400 hover:text-cyan-400 transition-colors"
                                    >
                                        <svg
                                            className="w-5 h-5"
                                            fill="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                        </svg>
                                    </a>
                                    <a
                                        href="#"
                                        className="text-gray-400 hover:text-cyan-400 transition-colors"
                                    >
                                        <svg
                                            className="w-5 h-5"
                                            fill="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                                        </svg>
                                    </a>
                                    <a
                                        href="#"
                                        className="text-gray-400 hover:text-cyan-400 transition-colors"
                                    >
                                        <svg
                                            className="w-5 h-5"
                                            fill="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                        </svg>
                                    </a>
                                </div>
                            </div>

                            {/* Platform Column */}
                            <div>
                                <h4 className="text-white font-semibold mb-4">
                                    Platform
                                </h4>
                                <ul className="space-y-2">
                                    <li>
                                        <Link
                                            to="/register"
                                            className="text-gray-400 hover:text-cyan-400 transition-colors text-sm"
                                        >
                                            Get Started
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            to="/login"
                                            className="text-gray-400 hover:text-cyan-400 transition-colors text-sm"
                                        >
                                            Sign In
                                        </Link>
                                    </li>
                                    <li>
                                        <a
                                            href="#"
                                            className="text-gray-400 hover:text-cyan-400 transition-colors text-sm"
                                        >
                                            Alumni Directory
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#"
                                            className="text-gray-400 hover:text-cyan-400 transition-colors text-sm"
                                        >
                                            Career Resources
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#"
                                            className="text-gray-400 hover:text-cyan-400 transition-colors text-sm"
                                        >
                                            Events
                                        </a>
                                    </li>
                                </ul>
                            </div>

                            {/* Features Column */}
                            <div>
                                <h4 className="text-white font-semibold mb-4">
                                    Features
                                </h4>
                                <ul className="space-y-2">
                                    <li>
                                        <a
                                            href="#"
                                            className="text-gray-400 hover:text-cyan-400 transition-colors text-sm"
                                        >
                                            AI Recommendations
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#"
                                            className="text-gray-400 hover:text-cyan-400 transition-colors text-sm"
                                        >
                                            Face Recognition
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#"
                                            className="text-gray-400 hover:text-cyan-400 transition-colors text-sm"
                                        >
                                            Mentorship Program
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#"
                                            className="text-gray-400 hover:text-cyan-400 transition-colors text-sm"
                                        >
                                            Job Board
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#"
                                            className="text-gray-400 hover:text-cyan-400 transition-colors text-sm"
                                        >
                                            Analytics
                                        </a>
                                    </li>
                                </ul>
                            </div>

                            {/* Support Column */}
                            <div>
                                <h4 className="text-white font-semibold mb-4">
                                    Support
                                </h4>
                                <ul className="space-y-2">
                                    <li>
                                        <a
                                            href="#"
                                            className="text-gray-400 hover:text-cyan-400 transition-colors text-sm"
                                        >
                                            Help Center
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#"
                                            className="text-gray-400 hover:text-cyan-400 transition-colors text-sm"
                                        >
                                            Contact Us
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#"
                                            className="text-gray-400 hover:text-cyan-400 transition-colors text-sm"
                                        >
                                            Privacy Policy
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#"
                                            className="text-gray-400 hover:text-cyan-400 transition-colors text-sm"
                                        >
                                            Terms of Service
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#"
                                            className="text-gray-400 hover:text-cyan-400 transition-colors text-sm"
                                        >
                                            FAQ
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Newsletter Signup */}
                        <div className="border-t border-white/10 pt-8 mb-8">
                            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                                <div>
                                    <h4 className="text-white font-semibold mb-1">
                                        Stay Updated
                                    </h4>
                                    <p className="text-gray-400 text-sm">
                                        Get the latest news and career tips
                                        delivered to your inbox.
                                    </p>
                                </div>
                                <div className="flex gap-2 w-full md:w-auto">
                                    <input
                                        type="email"
                                        placeholder="Enter your email"
                                        className="px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 flex-1 md:w-64"
                                    />
                                    <button className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold rounded-lg hover:scale-105 transition-transform">
                                        Subscribe
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Bar */}
                        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                            <p className="text-gray-500 text-sm">
                                © 2025 PU Catalyst. All rights reserved.
                            </p>
                            <div className="flex items-center gap-2 text-gray-500 text-sm">
                                <span>Made with</span>
                                <FaHeart className="text-red-500" />
                                <span>for the alumni community</span>
                            </div>
                        </div>
                    </div>
                </footer>
            )}

            <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-in-right {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(6, 182, 212, 0.5); }
          50% { box-shadow: 0 0 40px rgba(168, 85, 247, 0.7); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
        
        .animate-fade-in-delay {
          animation: fade-in 1s ease-out 0.3s both;
        }
        
        .animate-fade-in-delay-2 {
          animation: fade-in 1s ease-out 0.6s both;
        }
        
        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
        }
        
        .animate-slide-in-right {
          animation: slide-in-right 0.6s ease-out;
        }
        
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
        
        .animate-pulse-glow {
          animation: pulse-glow 3s ease-in-out infinite;
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        body {
          margin: 0;
          overflow-x: hidden;
        }
        
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: #000;
        }
        
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #06b6d4, #a855f7);
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #22d3ee, #c084fc);
        }
        
        /* Smooth scrolling */
        html {
          scroll-behavior: smooth;
        }
        
        /* Better text rendering */
        * {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
      `}</style>
        </div>
    );
}
