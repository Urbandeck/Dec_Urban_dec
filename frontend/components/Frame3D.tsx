'use client';

import { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

function PhotoFrame({ position = [0, 0, 0], rotation = [0, 0, 0], scale = 1 }: any) {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.05;
    }
  });

  return (
    <group ref={meshRef} position={position} rotation={rotation} scale={scale}>
      {/* Frame outer border */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[3, 4, 0.2]} />
        <meshStandardMaterial color="#5C4033" roughness={0.3} metalness={0.1} />
      </mesh>

      {/* Frame inner cutout (darker) */}
      <mesh position={[0, 0, 0.05]}>
        <boxGeometry args={[2.4, 3.4, 0.15]} />
        <meshStandardMaterial color="#2d2d2d" roughness={0.9} />
      </mesh>

      {/* Glass/screen effect */}
      <mesh position={[0, 0, 0.12]}>
        <planeGeometry args={[2.3, 3.3]} />
        <meshPhysicalMaterial
          color="#ffffff"
          roughness={0.1}
          metalness={0}
          transmission={0.9}
          thickness={0.1}
        />
      </mesh>

      {/* Photo placeholder with gradient */}
      <mesh position={[0, 0, 0.11]}>
        <planeGeometry args={[2.2, 3.2]} />
        <meshBasicMaterial color="#f5f5f5" />
      </mesh>
    </group>
  );
}

function FloatingFrames() {
  return (
    <>
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
        <PhotoFrame position={[0, 0, 0]} scale={1} />
      </Float>

      <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.4}>
        <PhotoFrame position={[-4, -0.5, -2]} rotation={[0, 0.4, 0]} scale={0.6} />
      </Float>

      <Float speed={1.8} rotationIntensity={0.25} floatIntensity={0.3}>
        <PhotoFrame position={[4, 0.5, -2]} rotation={[0, -0.4, 0]} scale={0.6} />
      </Float>
    </>
  );
}

export default function Frame3D() {
  return (
    <div className="w-full h-full">
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={45} />
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
        <directionalLight position={[-5, 5, 5]} intensity={0.5} />
        <pointLight position={[0, 2, 4]} intensity={0.5} color="#f59e0b" />

        <Suspense fallback={null}>
          <FloatingFrames />
          <Environment preset="studio" />
        </Suspense>
      </Canvas>
    </div>
  );
}
