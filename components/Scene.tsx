import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Sparkles, Environment } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import ChristmasTree from './ChristmasTree';

const Scene: React.FC = () => {
  return (
    <div className="w-full h-screen bg-black relative">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 45 }}
        gl={{ antialias: false, alpha: false }}
        dpr={[1, 2]}
      >
        <color attach="background" args={['#050505']} />
        
        {/* Environment & Lighting */}
        <Environment preset="city" /> {/* Generic reflection map, or download specific HDR */}
        
        {/* Warm Key Light */}
        <pointLight position={[5, 5, 5]} intensity={1.5} color="#ff9900" distance={20} />
        {/* Cool Fill Light */}
        <pointLight position={[-5, 0, -5]} intensity={1} color="#0055ff" distance={20} />
        {/* Top Spotlight (Holy vibe) */}
        <spotLight 
            position={[0, 10, 0]} 
            angle={0.3} 
            penumbra={0.5} 
            intensity={2} 
            color="#ffffff" 
            castShadow 
        />
        <ambientLight intensity={0.2} />

        {/* Background Elements */}
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <Sparkles count={200} scale={12} size={2} speed={0.4} opacity={0.5} color="#fff" />

        {/* Main Content */}
        <ChristmasTree />

        {/* Post Processing */}
        <EffectComposer enableNormalPass={false}>
          <Bloom luminanceThreshold={1} mipmapBlur intensity={1.2} radius={0.4} />
          <Vignette eskil={false} offset={0.1} darkness={0.7} />
          <Noise opacity={0.02} />
        </EffectComposer>

        {/* Controls */}
        <OrbitControls 
            enablePan={false} 
            minPolarAngle={Math.PI / 3} 
            maxPolarAngle={Math.PI / 1.5}
            minDistance={5}
            maxDistance={20}
        />
      </Canvas>
    </div>
  );
};

export default Scene;