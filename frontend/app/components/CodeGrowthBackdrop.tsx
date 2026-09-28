"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sparkles } from "@react-three/drei";
import { useRef } from "react";

function Orb() {
  const mesh = useRef(null);

  useFrame((_, delta) => {
    if (!mesh.current) return;
    mesh.current.rotation.x += delta * 0.12;
    mesh.current.rotation.y += delta * 0.18;
  });

  return (
    <Float speed={1.2} rotationIntensity={0.35} floatIntensity={0.45}>
      <mesh ref={mesh} scale={1.6}>
        <icosahedronGeometry args={[1, 2]} />
        <meshBasicMaterial color="#818cf8" wireframe transparent opacity={0.08} />
      </mesh>
    </Float>
  );
}

export default function CodeGrowthBackdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 opacity-90" aria-hidden="true">
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }} dpr={[1, 1.5]}>
        <ambientLight intensity={0.25} />
        <Orb />
        <Sparkles count={70} scale={[12, 7, 8]} size={1.4} speed={0.2} color="#a5b4fc" />
      </Canvas>
    </div>
  );
}
