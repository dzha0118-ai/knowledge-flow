import { useState, useRef, useLayoutEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import gsap from 'gsap'
import KnowledgeNodes from './three/KnowledgeNodes'
import NodeDetailPanel from './three/NodeDetailPanel'
import StarfieldBackground from './three/StarfieldBackground'
import { useAppStore } from '../store/useAppStore'
import type { KnowledgeNode } from '../store/useAppStore'

interface Props {
  course: {
    videoPlatform: string
    knowledgeNodes: KnowledgeNode[]
  }
  currentTime: number
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

export default function GraphView({ course, currentTime }: Props) {
  const lang = useAppStore((s) => s.lang)
  const [selectedNode, setSelectedNode] = useState<KnowledgeNode | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  const t = (zh: string, en: string) => lang === 'zh' ? zh : en
  const nodes = course?.knowledgeNodes || []

  useLayoutEffect(() => {
    if (panelRef.current) {
      gsap.from(panelRef.current, { y: 20, opacity: 0, duration: 0.5, ease: 'power3.out' })
    }
  }, [])

  const categories = Array.from(new Set(nodes.map(n => n.category || 'concept')))

  return (
    <div className="relative w-full" style={{ height: 'min(70vh, 600px)' }}>
      <div className="absolute inset-0 rounded-2xl overflow-hidden border border-white/[0.06] pointer-events-auto">
        <Canvas camera={{ position: [0, 2, 10], fov: 50 }}>
          <StarfieldBackground />
          <KnowledgeNodes
            nodes={nodes}
            currentTime={currentTime}
            onSelect={(n) => setSelectedNode(n)}
          />
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableDamping={true}
            dampingFactor={0.08}
            minDistance={3}
            maxDistance={20}
            autoRotate={true}
            autoRotateSpeed={0.8}
          />
        </Canvas>
      </div>

      {categories.length > 1 && (
        <div className="absolute top-3 right-3 z-20 pointer-events-none">
          <div className="rounded-lg border border-white/[0.08] bg-[#0D0B1A]/80 backdrop-blur-md px-3 py-2 pointer-events-auto">
            <p className="text-[10px] text-gray-500 font-medium mb-1.5">{t('图例', 'Legend')}</p>
            {categories.map((cat) => {
              const color = CATEGORY_COLORS[cat] || '#4B7BFF'
              const label: Record<string, [string, string]> = {
                concept: ['概念', 'Concept'],
                principle: ['原理', 'Principle'],
                example: ['示例', 'Example'],
                application: ['应用', 'Application'],
                tool: ['工具', 'Tool'],
                method: ['方法', 'Method'],
                reference: ['参考', 'Reference'],
              }
              const labelPair = label[cat] || [cat, cat]
              return (
                <div key={cat} className="flex items-center gap-1.5 py-0.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-[10px] text-gray-400">{t(labelPair[0], labelPair[1])}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="absolute top-3 left-3 z-20 pointer-events-none">
        <div className="rounded-lg border border-white/[0.08] bg-[#0D0B1A]/80 backdrop-blur-md px-3 py-2">
          <p className="text-xs text-gray-400 font-medium">
            {nodes.length} {t('个知识点', ' nodes')}
          </p>
        </div>
      </div>

      {selectedNode && (
        <NodeDetailPanel
          node={selectedNode}
          lang={lang}
          onClose={() => setSelectedNode(null)}
        />
      )}

      {!selectedNode && (
        <div className="absolute bottom-4 left-4 right-4 z-20 pointer-events-none">
          <p className="text-center text-[10px] text-gray-500">
            {t('拖拽旋转 · 滚轮缩放 · 点击节点查看详情', 'Drag to rotate · Scroll to zoom · Click a node')}
          </p>
        </div>
      )}
    </div>
  )
}
