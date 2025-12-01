import React, { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
    OrbitControls,
    PerspectiveCamera,
    Float,
    Stars,
    Sparkles,
    Text,
    Trail,
} from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";

const RoadmapPath = () => {
    const curve = useMemo(() => {
        return new THREE.CatmullRomCurve3([
            new THREE.Vector3(-10, -5, 0),
            new THREE.Vector3(-6, 0, 4),
            new THREE.Vector3(0, 3, 0),
            new THREE.Vector3(6, -2, -4),
            new THREE.Vector3(10, 2, 0),
        ]);
    }, []);

    return (
        <group>
            {/* The main path tube */}
            <mesh>
                <tubeGeometry args={[curve, 100, 0.2, 16, false]} />
                <meshStandardMaterial
                    color="#00ffff"
                    emissive="#00ffff"
                    emissiveIntensity={2}
                    toneMapped={false}
                />
            </mesh>

            {/* Outer glow tube (transparent) */}
            <mesh>
                <tubeGeometry args={[curve, 100, 0.4, 16, false]} />
                <meshBasicMaterial
                    color="#8b5cf6"
                    transparent
                    opacity={0.1}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Nodes along the path */}
            <Milestone position={[-10, -5, 0]} label="Start" color="#3b82f6" />
            <Milestone position={[-6, 0, 4]} label="Learn" color="#10b981" />
            <Milestone position={[0, 3, 0]} label="Build" color="#f59e0b" />
            <Milestone position={[6, -2, -4]} label="Grow" color="#ef4444" />
            <Milestone position={[10, 2, 0]} label="Success" color="#d946ef" />
        </group>
    );
};

const Milestone = ({ position, label, color }) => {
    const meshRef = useRef();

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += 0.01;
            meshRef.current.rotation.z += 0.005;
        }
    });

    return (
        <Float speed={2} rotationIntensity={1} floatIntensity={1}>
            <group position={position}>
                {/* Core Star/Planet */}
                <mesh ref={meshRef}>
                    <icosahedronGeometry args={[0.6, 1]} />
                    <meshStandardMaterial
                        color={color}
                        emissive={color}
                        emissiveIntensity={3}
                        toneMapped={false}
                    />
                </mesh>

                {/* Orbital Ring */}
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[0.9, 1.0, 64]} />
                    <meshBasicMaterial
                        color={color}
                        side={THREE.DoubleSide}
                        transparent
                        opacity={0.3}
                    />
                </mesh>

                {/* Label */}
                <Text
                    position={[0, 1.2, 0]}
                    fontSize={0.6}
                    color="white"
                    anchorX="center"
                    anchorY="middle"
                    outlineWidth={0.02}
                    outlineColor="#000000"
                >
                    {label}
                </Text>
            </group>
        </Float>
    );
};

const Scene = () => {
    return (
        <>
            <PerspectiveCamera makeDefault position={[0, 0, 16]} fov={45} />
            <OrbitControls
                enableZoom={false}
                autoRotate
                autoRotateSpeed={0.5}
                maxPolarAngle={Math.PI / 1.5}
                minPolarAngle={Math.PI / 3}
            />

            {/* Lighting */}
            <ambientLight intensity={0.2} />
            <pointLight position={[10, 10, 10]} intensity={1} color="#ffffff" />
            <pointLight
                position={[-10, -10, -10]}
                intensity={1}
                color="#8b5cf6"
            />

            {/* Space Environment */}
            <Stars
                radius={100}
                depth={50}
                count={7000}
                factor={4}
                saturation={0}
                fade
                speed={1}
            />
            <Sparkles
                count={300}
                scale={20}
                size={2}
                speed={0.4}
                opacity={0.5}
                color="#ffffff"
            />

            <RoadmapPath />

            {/* Post Processing for Bloom/Glow */}
            <EffectComposer disableNormalPass>
                <Bloom
                    luminanceThreshold={1}
                    mipmapBlur
                    intensity={1.5}
                    radius={0.6}
                />
            </EffectComposer>
        </>
    );
};

const Roadmap3D = () => {
    return (
        <div className="w-full h-[500px] md:h-[600px] rounded-2xl overflow-hidden shadow-2xl border border-white/10 relative">
            {/* Background Gradient for the container itself, acts as the deep space backdrop */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-[#0B0B15] to-black -z-10" />

            <Canvas
                dpr={[1, 2]}
                gl={{
                    antialias: false,
                    toneMapping: THREE.ReinhardToneMapping,
                    toneMappingExposure: 1.5,
                }}
            >
                <Scene />
            </Canvas>
        </div>
    );
};

export default Roadmap3D;
