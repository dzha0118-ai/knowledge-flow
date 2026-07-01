import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Torus, Sphere } from '@react-three/drei'
import * as THREE from 'three'

interface Props {
  progress: number
  totalLevels: number
  completedLevels: number
  isSuccess: boolean
}

export default function OrbitSystem({ progress, totalLevels, completedLevels, isSuccess }: Props) {
  const groupRef = useRef<THREE.Group>(null)

  const orbitCount = Math.min(totalLevels, 6)
  const orbits = Array.from({ length: orbitCount }, (_, i) => ({
    radius: 1.8 + i * 1.2,
    speed: 0.15 - i * 0.02,
    rotation: (i * Math.PI) / 3,
    isCompleted: i < completedLevels,
    isCurrent: i === completedLevels,
  }))

  useFrame((_, delta) => {
    if (!groupRef.current) return
    orbits.forEach((orbit, i) => {
      const child = groupRef.current!.children[i] as THREE.Group
      if (child) {
        child.rotation.z += orbit.speed * delta
      }
    })
  })

  return (
    <group ref={groupRef}>
      {orbits.map((orbit, i) => (
        <group key={i} rotation={[0.5, orbit.rotation, 0]}>
          <Torus args={[orbit.radius, 0.03, 16, 100]}>
            <meshStandardMaterial
              color={orbit.isCompleted ? '#F59E0B' : orbit.isCurrent ? '#4B7BFF' : '#1e293b'}
              emissive={orbit.isCompleted ? '#F59E0B' : orbit.isCurrent ? '#4B7BFF' : '#0f172a'}
              emissiveIntensity={orbit.isCurrent ? 0.8 : 0.2}
              roughness={0.3}
              transparent
              opacity={orbit.isCurrent ? 1 : 0.4}
            />
          </Torus>

          {orbit.isCurrent && (
            <Sphere args={[0.12, 16, 16]} position={[orbit.radius, 0, 0]}>
              <meshStandardMaterial
                color="#60A5FA"
                emissive="#60A5FA"
                emissiveIntensity={1.5}
              />
            </Sphere>
          )}

          {orbit.isCompleted && (
            <Sphere args={[0.08, 8, 8]} position={[orbit.radius * Math.cos(Date.now() * 0.001 + i), orbit.radius * Math.sin(Date.now() * 0.001 + i), 0]}>
              <meshStandardMaterial color="#F59E0B" emissive="#F59E0B" emissiveIntensity={0.5} />
            </Sphere>
          )}
        </group>
      ))}
    </group>
  )
}
