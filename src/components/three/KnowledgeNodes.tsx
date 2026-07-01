import { useRef, useMemo, useState, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sphere, Line, Text } from '@react-three/drei'
import * as THREE from 'three'
import { useAppStore } from '../../store/useAppStore'
import type { KnowledgeNode } from '../../store/useAppStore'

interface Props {
  nodes: KnowledgeNode[]
  currentTime: number
  onSelect?: (node: KnowledgeNode | null) => void
}

const CATEGORY_COLORS: Record<string, string> = {
  concept: '#4B7BFF',
  principle: '#10B981',
  example: '#F59E0B',
  application: '#EC4899',
  tool: '#8B5CF6',
  method: '#06B6D4',
  reference: '#6B7280',
}

function getColor(cat?: string): string {
  return CATEGORY_COLORS[cat || ''] || '#4B7BFF'
}

function runForceLayout(nodes: KnowledgeNode[], steps = 100): THREE.Vector3[] {
  const n = nodes.length
  if (n === 0) return []
  const pos: THREE.Vector3[] = Array.from({ length: n }, () => {
    const phi = Math.acos(2 * Math.random() - 1)
    const theta = Math.random() * Math.PI * 2
    const r = 4 + Math.random() * 1.5
    return new THREE.Vector3(
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.sin(phi) * Math.sin(theta),
      r * Math.cos(phi),
    )
  })
  const vel = pos.map(() => new THREE.Vector3())

  for (let iter = 0; iter < steps; iter++) {
    const k = 0.04
    const repulsion = 2.5
    const center = 0.02
    for (let i = 0; i < n; i++) {
      vel[i].set(0, 0, 0)
      for (let j = 0; j < n; j++) {
        if (i === j) continue
        const diff = new THREE.Vector3().copy(pos[i]).sub(pos[j])
        const dist = diff.length() + 0.1
        vel[i].add(diff.clone().multiplyScalar(repulsion / (dist * dist)))
      }
      for (const targetId of nodes[i]?.connectedTo || []) {
        const j = nodes.findIndex((n) => n.id === targetId)
        if (j === -1) continue
        vel[i].add(new THREE.Vector3().copy(pos[j]).sub(pos[i]).multiplyScalar(k * 2))
      }
      vel[i].add(pos[i].clone().multiplyScalar(-center))
      vel[i].multiplyScalar(0.85)
      pos[i].add(vel[i])
      if (pos[i].length() > 7) pos[i].setLength(7)
      if (pos[i].length() < 1.5) pos[i].setLength(1.5)
    }
  }
  return pos
}

export default function KnowledgeNodes({ nodes, currentTime, onSelect }: Props) {
  const lang = useAppStore((s) => s.lang)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const particleRef = useRef(0)
  const glowRef = useRef(0)
  const ambientParticlesRef = useRef<THREE.Points>(null)

  const { positions, edges } = useMemo(() => {
    const pos = runForceLayout(nodes)
    const edgeList: [number, number][] = []
    for (let i = 0; i < nodes.length; i++) {
      for (const tId of nodes[i].connectedTo || []) {
        const j = nodes.findIndex(n => n.id === tId)
        if (j >= 0) edgeList.push([i, j])
      }
    }
    return { positions: pos, edges: edgeList }
  }, [nodes])

  const ambientParticles = useMemo(() => {
    const count = 200
    const geo = new THREE.BufferGeometry()
    const p = new Float32Array(count * 3)
    for (let i = 0; i < count * 3; i++) p[i] = (Math.random() - 0.5) * 20
    geo.setAttribute('position', new THREE.BufferAttribute(p, 3))
    return geo
  }, [])

  useFrame((_, delta) => {
    particleRef.current = (particleRef.current + delta * 0.4) % 1
    glowRef.current += delta * 0.5
  })

  const handleClick = useCallback((node: KnowledgeNode) => {
    const next = selectedId === node.id ? null : node.id
    setSelectedId(next)
    onSelect?.(next ? node : null)
  }, [selectedId, onSelect])

  const handlePointerOver = useCallback((id: string) => setHoveredId(id), [])
  const handlePointerOut = useCallback(() => setHoveredId(null), [])

  if (nodes.length === 0) return null

  return (
    <group>
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 10, 5]} intensity={1.2} />
      <pointLight position={[-5, -5, -5]} intensity={0.5} color="#4B7BFF" />
      <pointLight position={[5, -5, 5]} intensity={0.3} color="#EC4899" />

      <points ref={ambientParticlesRef} geometry={ambientParticles}>
        <pointsMaterial size={0.04} color="#4B7BFF" transparent opacity={0.3} depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>

      {edges.map(([i, j], ei) => {
        const start = positions[i]
        const end = positions[j]
        const mid = new THREE.Vector3().copy(start).lerp(end, particleRef.current)

        const segments = 12
        const segPoints: THREE.Vector3[] = []
        for (let s = 0; s <= segments; s++) {
          const t = s / segments
          segPoints.push(new THREE.Vector3().copy(start).lerp(end, t))
        }

        return (
          <group key={`edge-${ei}`}>
            <Line
              points={segPoints}
              color="#4B7BFF"
              lineWidth={1}
              transparent
              opacity={0.15}
            />
            <Line
              points={segPoints}
              color="#8B5CF6"
              lineWidth={0.5}
              transparent
              opacity={0.08}
            />
            <Sphere args={[0.06, 8, 8]} position={mid}>
              <meshBasicMaterial color="#A78BFA" transparent opacity={0.8} />
            </Sphere>
            <SpriteGlow position={mid} color="#A78BFA" size={0.15} />
          </group>
        )
      })}

      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -1.5, 0]}>
        <ringGeometry args={[2.5, 3, 64]} />
        <meshBasicMaterial color="#4B7BFF" transparent opacity={0.06} side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 1.5, 0]}>
        <ringGeometry args={[2, 2.5, 64]} />
        <meshBasicMaterial color="#EC4899" transparent opacity={0.04} side={THREE.DoubleSide} />
      </mesh>

      {nodes.map((node, i) => {
        const pos = positions[i]
        const isActive = Math.abs(currentTime - (node.timestamp || 0)) < 5
        const isHovered = hoveredId === node.id
        const isSelected = selectedId === node.id
        const scale = isSelected ? 1.8 : isHovered ? 1.4 : isActive ? 1.2 : 1
        const color = getColor(node.category)
        const label = lang === 'zh' ? node.labelZh : node.labelEn
        const glowPulse = 0.15 + Math.sin(glowRef.current + i * 0.8) * 0.08

        return (
          <group key={node.id}>
            <mesh position={pos}>
              <sphereGeometry args={[0.35 * scale + glowPulse, 24, 24]} />
              <meshBasicMaterial color={color} transparent opacity={0.08} depthWrite={false} />
            </mesh>
            <mesh position={pos}>
              <sphereGeometry args={[0.25 * scale, 16, 16]} />
              <meshBasicMaterial
                color={color}
                transparent
                opacity={isSelected ? 0.3 : isHovered ? 0.2 : 0.1}
                depthWrite={false}
              />
            </mesh>
            <Sphere
              args={[0.16 * scale, 32, 32]}
              position={pos}
              onClick={(e) => { e.stopPropagation(); handleClick(node) }}
              onPointerOver={() => handlePointerOver(node.id)}
              onPointerOut={handlePointerOut}
            >
              <meshPhysicalMaterial
                color={color}
                emissive={color}
                emissiveIntensity={isSelected ? 1.5 : isHovered ? 1 : isActive ? 0.6 : 0.2}
                roughness={0.1}
                metalness={0.3}
                clearcoat={0.4}
                clearcoatRoughness={0.3}
                transparent
                opacity={0.92}
              />
            </Sphere>
            <mesh position={[pos.x + 0.06 * scale, pos.y + 0.06 * scale, pos.z + 0.06 * scale]}>
              <sphereGeometry args={[0.03 * scale, 8, 8]} />
              <meshBasicMaterial color="#ffffff" transparent opacity={0.6} />
            </mesh>

            <Text
              position={[pos.x, pos.y - 0.35 * scale - 0.1, pos.z]}
              fontSize={0.13 * Math.min(scale, 1.4)}
              color={isSelected ? color : '#ffffff'}
              anchorX="center"
              anchorY="top"
              outlineWidth={0.03}
              outlineColor="#000000"
              outlineOpacity={0.6}
              maxWidth={2.2}
            >
              {label}
            </Text>
          </group>
        )
      })}
    </group>
  )
}

function SpriteGlow({ position, color, size }: { position: THREE.Vector3; color: string; size: number }) {
  const ref = useRef<THREE.Sprite>(null)
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 32; canvas.height = 32
    const ctx = canvas.getContext('2d')!
    const g = ctx.createRadialGradient(16, 16, 0, 16, 16, 16)
    g.addColorStop(0, 'rgba(167,139,250,1)')
    g.addColorStop(0.3, 'rgba(167,139,250,0.5)')
    g.addColorStop(1, 'rgba(167,139,250,0)')
    ctx.fillStyle = g; ctx.fillRect(0, 0, 32, 32)
    return new THREE.CanvasTexture(canvas)
  }, [])
  return (
    <sprite ref={ref} position={position} scale={[size, size, 1]}>
      <spriteMaterial map={texture} transparent opacity={0.6} depthWrite={false} blending={THREE.AdditiveBlending} />
    </sprite>
  )
}
