import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float, MeshWobbleMaterial } from '@react-three/drei'
import * as THREE from 'three'

interface Props {
  itemCount: number
  unlockedCount: number
  onItemClick?: (index: number) => void
}

export default function CrystalWall({ itemCount, unlockedCount }: Props) {
  const groupRef = useRef<THREE.Group>(null)

  const items = useMemo(() => {
    const cols = Math.ceil(Math.sqrt(itemCount))
    const spacing = 1.8
    return Array.from({ length: itemCount }, (_, i) => ({
      position: [
        (i % cols - (cols - 1) / 2) * spacing,
        (Math.floor(i / cols) - (Math.ceil(itemCount / cols) - 1) / 2) * spacing,
        0,
      ] as [number, number, number],
      rotation: Math.random() * Math.PI * 2,
      isUnlocked: i < unlockedCount,
      color: i < unlockedCount
        ? ['#4B7BFF', '#A78BFA', '#F59E0B', '#60A5FA'][i % 4]
        : '#1e293b',
    }))
  }, [itemCount, unlockedCount])

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.002
    }
  })

  return (
    <group ref={groupRef}>
      {items.map((item, i) => (
        <Float key={i} speed={1 + i * 0.1} rotationIntensity={0.3} floatIntensity={0.4}>
          <mesh position={item.position} rotation={[item.rotation, item.rotation, 0]}>
            <octahedronGeometry args={[0.4, 0]} />
            <MeshWobbleMaterial
              color={item.color}
              emissive={item.isUnlocked ? item.color : '#0f172a'}
              emissiveIntensity={item.isUnlocked ? 0.6 : 0.05}
              roughness={0.2}
              metalness={0.8}
              transparent
              opacity={item.isUnlocked ? 1 : 0.25}
              factor={item.isUnlocked ? 0.05 : 0}
              speed={0.3 + i * 0.05}
            />
          </mesh>
        </Float>
      ))}
    </group>
  )
}
