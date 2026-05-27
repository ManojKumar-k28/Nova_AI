import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface AIOrbProps {
  isThinking?: boolean;
}

export default function AIOrb({ isThinking = false }: AIOrbProps) {
  const coreRef = useRef<THREE.Mesh>(null);
  const shellRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime();
    
    // speed up pulsing when thinking
    const pulseSpeed = isThinking ? 8 : 2;
    const pulse = 1 + Math.sin(elapsed * pulseSpeed) * 0.05;

    if (coreRef.current) {
      coreRef.current.scale.set(pulse, pulse, pulse);
      coreRef.current.rotation.y = elapsed * 0.5;
      coreRef.current.rotation.x = elapsed * 0.2;
    }

    if (shellRef.current) {
      const shellPulse = 1.35 + Math.cos(elapsed * (pulseSpeed / 2)) * 0.04;
      shellRef.current.scale.set(shellPulse, shellPulse, shellPulse);
      shellRef.current.rotation.y = -elapsed * 0.3;
      shellRef.current.rotation.z = elapsed * 0.2;
    }
  });

  return (
    <group>
      {/* Inner Core: Solid glossy emissive blue sphere */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial
          color="#3B82F6"
          emissive="#1D4ED8"
          emissiveIntensity={2.0}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>

      {/* Outer Shell: Glowing wireframe cyan sphere */}
      <mesh ref={shellRef}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          color="#06B6D4"
          wireframe
          transparent
          opacity={0.15}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
