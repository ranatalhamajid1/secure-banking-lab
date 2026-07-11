import React, { useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Float, Text, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

const CardMesh = ({ balance, name }) => {
  const groupRef = useRef();
  const { viewport } = useThree();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useFrame((state) => {
    // Parallax mouse tilt
    const targetX = (state.pointer.x * viewport.width) / 10;
    const targetY = (state.pointer.y * viewport.height) / 10;
    
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetX * 0.4, 0.1);
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -targetY * 0.3, 0.1);
  });

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={1}>
      <group ref={groupRef}>
        
        {/* Glow behind the card */}
        <RoundedBox args={[3.6, 2.3, 0.05]} radius={0.15} position={[0, 0, -0.1]}>
          <meshBasicMaterial color="#8b5cf6" transparent opacity={0.3} depthWrite={false} />
        </RoundedBox>

        {/* Main Card Body */}
        <RoundedBox args={[3.4, 2.1, 0.12]} radius={0.15} smoothness={4}>
          <meshPhysicalMaterial
            color="#1a1a2e"
            metalness={0.9}
            roughness={0.15}
            clearcoat={1}
            clearcoatRoughness={0.1}
          />
        </RoundedBox>

        {/* Holographic Overlay */}
        <RoundedBox args={[3.41, 2.11, 0.13]} radius={0.15} smoothness={4}>
          <meshPhysicalMaterial
            color="#06b6d4"
            transparent
            opacity={0.08}
            metalness={1}
            roughness={0}
            iridescence={1}
            iridescenceIOR={1.5}
            iridescenceThicknessRange={[100, 400]}
            depthWrite={false}
          />
        </RoundedBox>

        {/* Chip */}
        <RoundedBox args={[0.4, 0.3, 0.13]} position={[-1.1, 0.3, 0.07]} radius={0.05} smoothness={4}>
          <meshStandardMaterial color="#ffd700" metalness={1} roughness={0.2} />
        </RoundedBox>
        {/* Chip Lines */}
        <RoundedBox args={[0.3, 0.02, 0.14]} position={[-1.1, 0.35, 0.07]} radius={0.01}>
          <meshStandardMaterial color="#ccac00" metalness={1} roughness={0.4} />
        </RoundedBox>
        <RoundedBox args={[0.3, 0.02, 0.14]} position={[-1.1, 0.3, 0.07]} radius={0.01}>
          <meshStandardMaterial color="#ccac00" metalness={1} roughness={0.4} />
        </RoundedBox>
        <RoundedBox args={[0.3, 0.02, 0.14]} position={[-1.1, 0.25, 0.07]} radius={0.01}>
          <meshStandardMaterial color="#ccac00" metalness={1} roughness={0.4} />
        </RoundedBox>

        {/* Contactless Icon */}
        <Text position={[-0.6, 0.3, 0.07]} fontSize={0.15} color="#aaaaaa" rotation={[0, 0, Math.PI / 2]}>
          ))))
        </Text>

        {/* Text Details */}
        <Text position={[-1.4, 0.75, 0.07]} fontSize={0.18} color="#ffffff" anchorX="left" font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2">
          SecureBank
        </Text>

        <Text position={[-1.4, -0.1, 0.07]} fontSize={0.24} color="#ffffff" anchorX="left" letterSpacing={0.15}>
          •••• •••• •••• 2026
        </Text>

        <Text position={[-1.4, -0.65, 0.07]} fontSize={0.1} color="#888888" anchorX="left">
          CARDHOLDER
        </Text>
        <Text position={[-1.4, -0.85, 0.07]} fontSize={0.14} color="#ffffff" anchorX="left" letterSpacing={0.05}>
          {name?.toUpperCase() || 'VALUED MEMBER'}
        </Text>

        {balance !== undefined && (
          <>
            <Text position={[1.4, -0.65, 0.07]} fontSize={0.1} color="#888888" anchorX="right">
              BALANCE
            </Text>
            <Text position={[1.4, -0.85, 0.07]} fontSize={0.16} color="#ffffff" anchorX="right">
              ${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </Text>
          </>
        )}
      </group>
    </Float>
  );
};

const AnimatedLight = () => {
  const lightRef = useRef();
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    lightRef.current.position.x = Math.sin(t * 0.5) * 5;
    lightRef.current.position.y = Math.cos(t * 0.5) * 5;
  });
  return <pointLight ref={lightRef} position={[0, 0, 5]} intensity={2} color="#06b6d4" />;
};

const Card3D = ({ balance, name }) => {
  return (
    <div style={{ width: '100%', height: '100%', minHeight: '300px', cursor: 'pointer' }}>
      <Canvas camera={{ position: [0, 0, 4.5], fov: 50 }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 10, 5]} intensity={1.5} color="#ffffff" />
        <directionalLight position={[-5, -10, 5]} intensity={1} color="#8b5cf6" />
        <AnimatedLight />
        <Environment preset="city" />
        <CardMesh balance={balance} name={name} />
      </Canvas>
    </div>
  );
};

export default Card3D;
