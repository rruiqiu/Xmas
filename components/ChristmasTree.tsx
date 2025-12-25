
import React, { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Sparkles } from '@react-three/drei';
import gsap from 'gsap';
import { useStore } from '../store';
import { 
  generateGemPositions, 
  generateNebulaPositions, 
  generateOrnamentTreePositions, 
  generateOrnamentNebulaPositions,
  generatePearlPositions
} from '../utils/geometry';
import { ORNAMENT_COLORS, PHOTO_URLS } from '../types';

const ROUND_GEM_COUNT = 5000;
const HEART_GEM_COUNT = 20;
const ORNAMENT_COUNT = 50;
const PEARL_COUNT = 400;
const DEFAULT_PHOTO_COUNT = 24;

const tempObj = new THREE.Object3D();
const tempPos = new THREE.Vector3();

// --- Shapes ---
const StarShape = new THREE.Shape();
const points = 5;
const outerRadius = 0.6;
const innerRadius = 0.3;
for (let i = 0; i < points * 2; i++) {
    const angle = (i * Math.PI * 2) / (points * 2) + Math.PI / 2; 
    const r = i % 2 === 0 ? outerRadius : innerRadius;
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r;
    if (i === 0) StarShape.moveTo(x, y);
    else StarShape.lineTo(x, y);
}
StarShape.closePath();

const HeartShape = new THREE.Shape();
const hx = 0, hy = 0;
HeartShape.moveTo(hx + 0.25, hy + 0.25);
HeartShape.bezierCurveTo(hx + 0.25, hy + 0.25, hx + 0.20, hy, hx, hy);
HeartShape.bezierCurveTo(hx - 0.30, hy, hx - 0.30, hy + 0.35, hx - 0.30, hy + 0.35);
HeartShape.bezierCurveTo(hx - 0.30, hy + 0.55, hx - 0.10, hy + 0.77, hx + 0.25, hy + 0.95);
HeartShape.bezierCurveTo(hx + 0.60, hy + 0.77, hx + 0.80, hy + 0.55, hx + 0.80, hy + 0.35);
HeartShape.bezierCurveTo(hx + 0.80, hy + 0.35, hx + 0.80, hy, hx + 0.50, hy);
HeartShape.bezierCurveTo(hx + 0.35, hy, hx + 0.25, hy + 0.25, hx + 0.25, hy + 0.25);

const PhotoFrame: React.FC<{ url: string, position: THREE.Vector3, rotation: THREE.Euler, isNebula: boolean }> = ({ url, position, rotation, isNebula }) => {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const groupRef = useRef<THREE.Group>(null);
  const [isLandscape, setIsLandscape] = useState(false);

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');
    const loadTex = () => {
        loader.load(url, (tex) => {
            setTexture(tex);
            if (tex.image) setIsLandscape(tex.image.width / tex.image.height > 1);
        }, undefined, (err) => {
            console.warn("Failed to load texture, using fallback:", url);
            loader.load('https://picsum.photos/400/500?grayscale', (tex) => setTexture(tex));
        });
    };
    loadTex();
  }, [url]);

  useFrame((state) => {
    if(groupRef.current && isNebula) groupRef.current.lookAt(state.camera.position);
  });

  if (!texture) return null;
  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      <mesh position={[0, 0, -0.01]}>
        <boxGeometry args={[isLandscape ? 1.2 : 1, isLandscape ? 1 : 1.2, 0.02]} />
        <meshStandardMaterial color="#fff" roughness={0.2} metalness={0.1} />
      </mesh>
      <mesh position={[0, isLandscape ? 0 : 0.1, 0.01]}>
        <planeGeometry args={[isLandscape ? 1.0 : 0.8, isLandscape ? 0.8 : 0.8]} />
        <meshBasicMaterial map={texture} />
      </mesh>
    </group>
  );
};

const ChristmasTree: React.FC = () => {
  const { phase, gesture, handX, handY, setPhase, userPhotos } = useStore();
  const roundGemsRef = useRef<THREE.InstancedMesh>(null);
  const heartGemsRef = useRef<THREE.InstancedMesh>(null);
  const ornamentsRef = useRef<THREE.InstancedMesh>(null);
  const pearlsRef = useRef<THREE.InstancedMesh>(null);
  const starRef = useRef<THREE.Group>(null);
  const photosGroupRef = useRef<THREE.Group>(null);
  const nebulaRingRef = useRef<THREE.Group>(null); 
  const magicCoreRef = useRef<THREE.Mesh>(null);
  
  const { mouse } = useThree();
  const rotationVelocity = useRef(0);

  const { positions: roundPos } = useMemo(() => generateGemPositions(ROUND_GEM_COUNT, 3.5, 8), []);
  const roundNebulaPos = useMemo(() => generateNebulaPositions(ROUND_GEM_COUNT, 5, 2), []); 
  const { positions: heartPos } = useMemo(() => generateGemPositions(HEART_GEM_COUNT, 3.2, 7.5), []);
  const heartNebulaPos = useMemo(() => generateNebulaPositions(HEART_GEM_COUNT, 6, 1), []); 
  const heartColors = useMemo(() => {
    const colors = new Float32Array(HEART_GEM_COUNT * 3);
    const c1 = new THREE.Color('#87CEEB'), c2 = new THREE.Color('#FFB6C1'); 
    for(let i=0; i<HEART_GEM_COUNT; i++) {
        const c = Math.random() > 0.5 ? c1 : c2;
        colors[i*3] = c.r; colors[i*3+1] = c.g; colors[i*3+2] = c.b;
    }
    return colors;
  }, []);
  const ornamentTreePos = useMemo(() => generateOrnamentTreePositions(ORNAMENT_COUNT, 3.8, 8), []);
  const ornamentNebulaPos = useMemo(() => generateOrnamentNebulaPositions(ORNAMENT_COUNT, 5.5), []); 
  const pearlTreePos = useMemo(() => generatePearlPositions(PEARL_COUNT, 3.6, 8), []);
  const pearlNebulaPos = useMemo(() => generateNebulaPositions(PEARL_COUNT, 4.5, 0.5), []); 
  const activePhotos = useMemo(() => [...userPhotos, ...PHOTO_URLS].slice(0, DEFAULT_PHOTO_COUNT), [userPhotos]);
  const photoNebulaPos = useMemo(() => generateOrnamentNebulaPositions(activePhotos.length, 10), [activePhotos.length]); 

  const transitionProgress = useRef({ value: 0 });
  
  const initMesh = (ref: React.RefObject<THREE.InstancedMesh>, count: number, pos: Float32Array, colors: Float32Array | null, baseScale: number, randomScaleVar: number, baseColor?: string) => {
      if (!ref.current) return;
      const c = new THREE.Color();
      for (let i = 0; i < count; i++) {
        tempObj.position.set(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]);
        tempObj.scale.setScalar(baseScale + Math.random() * randomScaleVar);
        tempObj.rotation.set(Math.random()*Math.PI, Math.random()*Math.PI, Math.random()*Math.PI);
        tempObj.updateMatrix();
        ref.current.setMatrixAt(i, tempObj.matrix);
        if (colors) ref.current.setColorAt(i, new THREE.Color(colors[i * 3], colors[i * 3 + 1], colors[i * 3 + 2]));
        else if (baseColor) ref.current.setColorAt(i, c.set(baseColor));
      }
      ref.current.instanceMatrix.needsUpdate = true;
      if (ref.current.instanceColor) ref.current.instanceColor.needsUpdate = true;
  };

  useEffect(() => {
    initMesh(roundGemsRef, ROUND_GEM_COUNT, roundPos, null, 0.04, 0.03, '#FFFFFF'); 
    initMesh(heartGemsRef, HEART_GEM_COUNT, heartPos, heartColors, 0.15, 0.05); 
    initMesh(ornamentsRef, ORNAMENT_COUNT, ornamentTreePos, null, 0.2, 0, '#ffffff'); 
    if (ornamentsRef.current) {
        for(let i=0; i< ORNAMENT_COUNT; i++) ornamentsRef.current.setColorAt(i, new THREE.Color(ORNAMENT_COLORS[i % ORNAMENT_COLORS.length]));
        ornamentsRef.current.instanceColor!.needsUpdate = true;
    }
    initMesh(pearlsRef, PEARL_COUNT, pearlTreePos, null, 0.08, 0, '#fffaf0');
  }, [roundPos, heartPos, heartColors, ornamentTreePos, pearlTreePos]);

  useEffect(() => {
    if (phase === 'blooming') {
      gsap.to(transitionProgress.current, { value: 1, duration: 3, ease: 'power4.out', onComplete: () => setPhase('nebula') });
      if (starRef.current) gsap.to(starRef.current.scale, { x: 0, y: 0, z: 0, duration: 0.5 });
      if (photosGroupRef.current) gsap.to(photosGroupRef.current.scale, { x: 1, y: 1, z: 1, duration: 2.5, delay: 0.5, ease: 'back.out(1.2)' });
    } else if (phase === 'collapsing') {
      gsap.to(transitionProgress.current, { value: 0, duration: 3.5, ease: 'elastic.out(1, 0.5)', onComplete: () => setPhase('tree') });
      if (starRef.current) gsap.to(starRef.current.scale, { x: 1, y: 1, z: 1, duration: 1, delay: 2 });
      if (photosGroupRef.current) gsap.to(photosGroupRef.current.scale, { x: 0, y: 0, z: 0, duration: 1 });
    }
  }, [phase, setPhase]);

  useEffect(() => {
      if (gesture === 'Open_Palm' && phase === 'tree') setPhase('blooming');
      else if (gesture === 'Closed_Fist' && phase === 'nebula') setPhase('collapsing');
  }, [gesture, phase, setPhase]);

  useFrame((state, delta) => {
    const t = transitionProgress.current.value;
    const mouseVec = new THREE.Vector3(mouse.x * 10, mouse.y * 10, 2); 
    
    const updateParticles = (ref: React.RefObject<THREE.InstancedMesh>, count: number, startPos: Float32Array, endPos: Float32Array, baseScale: number, isGem: boolean, shouldRotate: boolean) => {
        if (!ref.current) return;
        for (let i = 0; i < count; i++) {
            const ix = i * 3;
            tempPos.set(THREE.MathUtils.lerp(startPos[ix], endPos[ix], t), THREE.MathUtils.lerp(startPos[ix+1], endPos[ix+1], t), THREE.MathUtils.lerp(startPos[ix+2], endPos[ix+2], t));
            tempPos.y += Math.sin(state.clock.elapsedTime * (isGem ? 1 : 0.5) + i) * 0.05;
            if (t < 0.5) {
                const dist = tempPos.distanceTo(mouseVec);
                if (dist < 3) tempPos.add(tempPos.clone().sub(mouseVec).normalize().multiplyScalar((3 - dist) * 2));
            }
            tempObj.position.copy(tempPos);
            let s = baseScale;
            if (isGem) {
                s *= (1 + Math.sin(state.clock.elapsedTime * 3 + i)*0.3);
                if (shouldRotate) { tempObj.rotation.x += delta * 0.5; tempObj.rotation.y += delta * 0.5; }
                else { const seed = i * 132.1; tempObj.rotation.set(seed % 3, (seed * 2) % 3, (seed * 3) % 3); }
            } else tempObj.rotation.set(0,0,0);
            tempObj.scale.setScalar(s);
            tempObj.updateMatrix();
            ref.current.setMatrixAt(i, tempObj.matrix);
        }
        ref.current.instanceMatrix.needsUpdate = true;
    };

    updateParticles(roundGemsRef, ROUND_GEM_COUNT, roundPos, roundNebulaPos, 0.04, true, false);
    updateParticles(heartGemsRef, HEART_GEM_COUNT, heartPos, heartNebulaPos, 0.15, true, true);
    updateParticles(ornamentsRef, ORNAMENT_COUNT, ornamentTreePos, ornamentNebulaPos, 0.2, false, false);
    updateParticles(pearlsRef, PEARL_COUNT, pearlTreePos, pearlNebulaPos, 0.08, false, false);

    if (phase === 'nebula' && nebulaRingRef.current) {
        let targetVelocity = 0;
        let targetScale = 0.5;

        if (gesture !== 'None') {
            const steer = (handX - 0.5) * 2; 
            const steerSensitivity = 0.005; 
            targetVelocity = steer * steerSensitivity;
            targetScale = 0.15 + (handY * 0.95);
        } else {
            targetVelocity = 0;
            targetScale = 0.5; 
        }
        
        rotationVelocity.current = THREE.MathUtils.lerp(rotationVelocity.current, targetVelocity, 0.02);
        nebulaRingRef.current.rotation.y += rotationVelocity.current;

        const currentScale = nebulaRingRef.current.scale.x;
        const lerpedScale = THREE.MathUtils.lerp(currentScale, targetScale, 0.04);
        nebulaRingRef.current.scale.setScalar(lerpedScale);

        if (magicCoreRef.current) {
            const hasHand = gesture !== 'None';
            const xOffset = hasHand ? (handX - 0.5) * 6 : 0;
            const yOffset = hasHand ? (handY - 0.5) * 4 : 0;
            
            magicCoreRef.current.position.x = THREE.MathUtils.lerp(magicCoreRef.current.position.x, xOffset, 0.05);
            magicCoreRef.current.position.y = THREE.MathUtils.lerp(magicCoreRef.current.position.y, yOffset, 0.05);
            
            const targetOpacity = hasHand ? (0.2 + Math.abs(handX - 0.5) * 0.4) : 0;
            if (magicCoreRef.current.material) {
                (magicCoreRef.current.material as THREE.MeshBasicMaterial).opacity = THREE.MathUtils.lerp(
                    (magicCoreRef.current.material as THREE.MeshBasicMaterial).opacity, 
                    targetOpacity, 
                    0.1
                );
            }
            
            magicCoreRef.current.scale.setScalar(THREE.MathUtils.lerp(magicCoreRef.current.scale.x, targetScale * 0.4, 0.1));
        }
    }
  });

  return (
    <group>
      <mesh ref={magicCoreRef} position={[0, 0, 0]} visible={phase === 'nebula'}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshBasicMaterial color="#FFD700" transparent opacity={0} toneMapped={false} />
      </mesh>

      <instancedMesh ref={roundGemsRef} args={[undefined, undefined, ROUND_GEM_COUNT]}>
        <icosahedronGeometry args={[1, 0]} /> 
        <meshPhysicalMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={0.5} roughness={0.1} metalness={0.9} transmission={0.1} thickness={1} envMapIntensity={2} />
      </instancedMesh>

      <instancedMesh ref={heartGemsRef} args={[undefined, undefined, HEART_GEM_COUNT]}>
        <extrudeGeometry args={[HeartShape, { depth: 0.4, bevelEnabled: true, bevelThickness: 0.1, bevelSize: 0.1, bevelSegments: 3 }]} />
        <meshPhysicalMaterial roughness={0.1} metalness={1.0} transmission={0.2} thickness={1.5} emissiveIntensity={0.2} envMapIntensity={3} />
      </instancedMesh>

      <instancedMesh ref={ornamentsRef} args={[undefined, undefined, ORNAMENT_COUNT]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial roughness={0.1} metalness={1} envMapIntensity={3} emissive="#ffffff" emissiveIntensity={0.2} />
      </instancedMesh>

      <instancedMesh ref={pearlsRef} args={[undefined, undefined, PEARL_COUNT]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial color="#fffaf0" roughness={0.4} metalness={0.2} emissive="#222" />
      </instancedMesh>

      <group ref={starRef} position={[0, 4.2, 0]}>
        <mesh>
          <extrudeGeometry args={[StarShape, { depth: 0.2, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 2 }]} />
          <meshStandardMaterial color="#DEA193" emissive="#DEA193" emissiveIntensity={4} roughness={0.2} metalness={0.9} toneMapped={false} />
        </mesh>
        <pointLight intensity={3} color="#DEA193" distance={8} decay={2} />
      </group>

      <Sparkles count={500} scale={15} size={4} speed={0.4} opacity={0.8} color="#ffffff" />
      <group ref={nebulaRingRef}>
          <group ref={photosGroupRef} scale={[0,0,0]}>
            {activePhotos.map((url, i) => {
                const ix = i * 3;
                if (photoNebulaPos[ix] === undefined) return null;
                return <PhotoFrame key={`${url}-${i}`} url={url} position={new THREE.Vector3(photoNebulaPos[ix], photoNebulaPos[ix+1], photoNebulaPos[ix+2])} rotation={new THREE.Euler(0, 0, 0)} isNebula={phase === 'nebula'} />
            })}
          </group>
      </group>
    </group>
  );
};

export default ChristmasTree;
