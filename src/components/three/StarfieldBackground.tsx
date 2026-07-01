import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function StarfieldBackground() {
  const pointsRef = useRef<THREE.Points>(null)
  const mouseRef = useRef({ x: 0, y: 0 })

  const { positions, sizes, colors } = useMemo(() => {
    const count = 1500
    const pos = new Float32Array(count * 3)
    const siz = new Float32Array(count)
    const col = new Float32Array(count * 3)

    const palette = [
      new THREE.Color('#4B7BFF'),
      new THREE.Color('#A78BFA'),
      new THREE.Color('#60A5FA'),
      new THREE.Color('#818CF8'),
      new THREE.Color('#F59E0B'),
      new THREE.Color('#FFFFFF'),
    ]

    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      pos[i3] = (Math.random() - 0.5) * 60
      pos[i3 + 1] = (Math.random() - 0.5) * 40
      pos[i3 + 2] = (Math.random() - 0.5) * 30

      siz[i] = Math.random() * 0.06 + 0.01

      const c = palette[Math.floor(Math.random() * palette.length)]
      col[i3] = c.r
      col[i3 + 1] = c.g
      col[i3 + 2] = c.b
    }

    return { positions: pos, sizes: siz, colors: col }
  }, [])

  useFrame((state) => {
    if (!pointsRef.current) return
    pointsRef.current.rotation.y += 0.00008
    pointsRef.current.rotation.x += 0.00003

    const mx = (mouseRef.current.x * 0.05)
    const my = (mouseRef.current.y * 0.05)
    state.camera.position.x += (mx - state.camera.position.x) * 0.01
    state.camera.position.y += (my - state.camera.position.y) * 0.01
  })

  if (typeof window !== 'undefined') {
    window.addEventListener('mousemove', (e) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1
    })
  }

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={sizes.length}
          array={sizes}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        vertexColors
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  )
}
