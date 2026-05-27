import { Canvas } from "@react-three/fiber";
import ParticleField from "./ParticleField";

export default function BackgroundScene() {
  return (
    <div className="fixed inset-0 w-full h-full -z-10 pointer-events-none bg-primary">
      <Canvas
        camera={{ position: [0, 0, 15], fov: 60 }}
        gl={{ alpha: true, antialias: true }}
      >
        {/* Lights for the 3D scene */}
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#3B82F6" />
        <pointLight position={[-10, -10, -10]} intensity={0.8} color="#8B5CF6" />
        <pointLight position={[0, 0, 5]} intensity={0.5} color="#06B6D4" />
        
        {/* Mounting our active particle field */}
        <ParticleField />
      </Canvas>
    </div>
  );
}
