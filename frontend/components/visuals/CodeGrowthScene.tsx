"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Stars } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

function Orb({ position, color, size = 0.6 }) {
  const ref = useRef(null);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.x = state.clock.elapsedTime * 0.15;
    ref.current.rotation.y = state.clock.elapsedTime * 0.22;
  });

  return (
    <Float speed={1.2} rotationIntensity={0.4} floatIntensity={0.8}>
      <mesh ref={ref} position={position}>
        <icosahedronGeometry args={[size, 1]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.32} metalness={0.8} roughness={0.24} />
      </mesh>
    </Float>
  );
}

function SceneContent() {
  return (
    <>
      <ambientLight intensity={0.38} />
      <pointLight position={[2, 2, 4]} intensity={7} color="#8b5cf6" />
      <pointLight position={[-4, -2, 1]} intensity={5} color="#22d3ee" />
      <Stars radius={80} depth={30} count={900} factor={1.3} saturation={0} fade speed={0.25} />
      <Orb position={[-4.2, 1.6, -2]} color="#6366f1" size={0.85} />
      <Orb position={[3.8, 2.1, -4]} color="#22d3ee" size={0.62} />
      <Orb position={[4.4, -2.2, -3]} color="#a855f7" size={0.48} />
      <Orb position={[-3.8, -2.5, -5]} color="#38bdf8" size={0.54} />
    </>
  );
}

export default function CodeGrowthScene({ className = "" }) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 8], fov: 50 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <SceneContent />
      </Canvas>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(4,7,15,0.35)_42%,rgba(4,7,15,0.92)_100%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#04070f]" />
    </div>
  );
}
