'use client';

import { useRef, Suspense, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment, PerspectiveCamera, MeshTransmissionMaterial } from '@react-three/drei';
import * as THREE from 'three';

function PremiumFrame({ position = [0, 0, 0], rotation = [0, 0, 0], scale = 1, color = '#b8860b' }: any) {
  const meshRef = useRef<THREE.Group>(null);
  const screenRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.15 + rotation[1];
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.05 + rotation[0];
    }
    // Animate screen color
    if (screenRef.current) {
      const mat = screenRef.current.material as THREE.MeshStandardMaterial;
      const hue = (state.clock.elapsedTime * 0.02) % 1;
      mat.emissiveIntensity = 0.3 + Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <group ref={meshRef} position={position} scale={scale}>
      {/* Frame body - rounded edges look */}
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[3, 4, 0.25]} />
        <meshPhysicalMaterial
          color={color}
          roughness={0.15}
          metalness={0.85}
          clearcoat={1}
          clearcoatRoughness={0.1}
          envMapIntensity={1.5}
        />
      </mesh>

      {/* Inner bezel - dark recessed area */}
      <mesh position={[0, 0, 0.08]}>
        <boxGeometry args={[2.5, 3.5, 0.12]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.95} metalness={0} />
      </mesh>

      {/* Screen - glowing display */}
      <mesh ref={screenRef} position={[0, 0, 0.14]}>
        <planeGeometry args={[2.3, 3.3]} />
        <meshStandardMaterial
          color="#1a1a2e"
          emissive="#f59e0b"
          emissiveIntensity={0.3}
          roughness={0.05}
          metalness={0.1}
        />
      </mesh>

      {/* Screen ambient glow overlay */}
      <mesh position={[0, 0, 0.15]}>
        <planeGeometry args={[2.3, 3.3]} />
        <meshPhysicalMaterial
          color="#000000"
          roughness={0}
          metalness={0}
          transmission={0.85}
          thickness={0.05}
          ior={1.5}
          opacity={0.6}
          transparent
        />
      </mesh>

      {/* Top edge highlight */}
      <mesh position={[0, 2.05, 0.05]}>
        <boxGeometry args={[3.05, 0.06, 0.3]} />
        <meshPhysicalMaterial
          color="#fbbf24"
          roughness={0.1}
          metalness={0.9}
          emissive="#f59e0b"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Bottom edge highlight */}
      <mesh position={[0, -2.05, 0.05]}>
        <boxGeometry args={[3.05, 0.06, 0.3]} />
        <meshPhysicalMaterial
          color="#fbbf24"
          roughness={0.1}
          metalness={0.9}
          emissive="#f59e0b"
          emissiveIntensity={0.2}
        />
      </mesh>
    </group>
  );
}

function OrbitingRing({ radius = 3, speed = 0.5, color = '#f59e0b', yOffset = 0 }: any) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = state.clock.elapsedTime * speed;
      ref.current.rotation.z = state.clock.elapsedTime * speed * 0.3;
    }
  });

  return (
    <mesh ref={ref} position={[0, yOffset, 0]}>
      <torusGeometry args={[radius, 0.015, 16, 100]} />
      <meshPhysicalMaterial
        color={color}
        roughness={0.1}
        metalness={0.9}
        emissive={color}
        emissiveIntensity={0.5}
        transparent
        opacity={0.6}
      />
    </mesh>
  );
}

function FloatingOrb({ position, size = 0.08, color = '#f59e0b', speed = 1 }: any) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * speed) * 0.5;
      ref.current.position.x = position[0] + Math.cos(state.clock.elapsedTime * speed * 0.7) * 0.3;
    }
  });

  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[size, 16, 16]} />
      <meshPhysicalMaterial
        color={color}
        roughness={0}
        metalness={1}
        emissive={color}
        emissiveIntensity={1}
      />
    </mesh>
  );
}

function GlowPlane() {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ref.current) {
      const mat = ref.current.material as THREE.MeshStandardMaterial;
      mat.opacity = 0.03 + Math.sin(state.clock.elapsedTime * 0.3) * 0.02;
    }
  });

  return (
    <mesh ref={ref} position={[0, 0, -3]} rotation={[0, 0, 0]}>
      <planeGeometry args={[20, 20]} />
      <meshStandardMaterial
        color="#f59e0b"
        emissive="#f59e0b"
        emissiveIntensity={0.5}
        transparent
        opacity={0.04}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function Scene() {
  return (
    <>
      {/* Main center frame - premium gold */}
      <Float speed={1.5} rotationIntensity={0.15} floatIntensity={0.4}>
        <PremiumFrame position={[0, 0.2, 0]} scale={0.95} color="#b8860b" />
      </Float>

      {/* Left frame - silver/platinum */}
      <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.3}>
        <PremiumFrame position={[-3.8, -0.8, -2.5]} rotation={[0, 0.5, 0.05]} scale={0.5} color="#8b8b8b" />
      </Float>

      {/* Right frame - rose gold */}
      <Float speed={1.8} rotationIntensity={0.2} floatIntensity={0.35}>
        <PremiumFrame position={[3.8, 0.3, -2]} rotation={[0, -0.45, -0.05]} scale={0.45} color="#b76e79" />
      </Float>

      {/* Decorative orbiting rings */}
      <OrbitingRing radius={4.5} speed={0.15} color="#f59e0b" yOffset={0} />
      <OrbitingRing radius={5} speed={-0.1} color="#d97706" yOffset={0.5} />

      {/* Floating ambient orbs */}
      <FloatingOrb position={[-2, 2, 1]} size={0.06} color="#fbbf24" speed={0.8} />
      <FloatingOrb position={[2.5, -1.5, 0.5]} size={0.05} color="#f59e0b" speed={1.2} />
      <FloatingOrb position={[-3, -1, -1]} size={0.04} color="#d97706" speed={0.6} />
      <FloatingOrb position={[1, 2.5, -1]} size={0.05} color="#fbbf24" speed={1} />
      <FloatingOrb position={[3.5, 1.5, -0.5]} size={0.035} color="#f59e0b" speed={0.9} />
      <FloatingOrb position={[-1.5, -2, 0]} size={0.04} color="#fcd34d" speed={1.1} />

      {/* Background glow */}
      <GlowPlane />
    </>
  );
}

export default function Frame3D() {
  return (
    <div className="w-full h-full">
      <Canvas shadows dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
        <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={45} />

        {/* Ambient light - soft overall illumination */}
        <ambientLight intensity={0.3} />

        {/* Key light - main warm light */}
        <directionalLight position={[5, 5, 5]} intensity={1.2} castShadow color="#fff5e6" />

        {/* Fill light - softer from opposite side */}
        <directionalLight position={[-5, 3, 5]} intensity={0.4} color="#e2e8f0" />

        {/* Rim light - creates edge glow */}
        <directionalLight position={[0, -3, -5]} intensity={0.3} color="#f59e0b" />

        {/* Accent spotlight on center frame */}
        <spotLight
          position={[0, 5, 4]}
          angle={0.4}
          penumbra={0.8}
          intensity={0.8}
          color="#fbbf24"
          castShadow
        />

        {/* Bottom warm bounce */}
        <pointLight position={[0, -4, 2]} intensity={0.3} color="#f59e0b" />

        <Suspense fallback={null}>
          <Scene />
          <Environment preset="city" />
        </Suspense>
      </Canvas>
    </div>
  );
}
