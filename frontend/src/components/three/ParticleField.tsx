import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function ParticleField() {
  const pointsRef = useRef<THREE.Points>(null);

  const [positions, colors] = useMemo(() => {
    const count = 2000;
    const pos = new Float32Array(count * 3);
    const cols = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // Create random points in a spherical radius
      const r = Math.random() * 25 + 5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);

      // Stagger colors between glowing blue (#3B82F6) and white/cyan (#E8EAF0)
      const isBlue = Math.random() > 0.4;
      if (isBlue) {
        cols[i * 3] = 0.23; // R
        cols[i * 3 + 1] = 0.51; // G
        cols[i * 3 + 2] = 0.96; // B
      } else {
        cols[i * 3] = 0.91;
        cols[i * 3 + 1] = 0.92;
        cols[i * 3 + 2] = 0.98;
      }
    }

    return [pos, cols];
  }, []);

  useFrame((state) => {
    if (pointsRef.current) {
      // Slowly rotate entire field
      pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.05;
      pointsRef.current.rotation.x = state.clock.getElapsedTime() * 0.02;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}
