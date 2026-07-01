import { useState } from 'react'
import { ChevronRight, ChevronDown, Circle, Box } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import type { CourseData, KnowledgeNode } from '../store/useAppStore'

const CAT_COLORS: Record<string, string> = {
  concept: '#4B7BFF', method: '#A78BFA', example: '#F59E0B',
  application: '#10B981', background: '#EC4899',
}
const CAT_LABELS: Record<string, string> = { concept: '概念', method: '方法', example: '案例', application: '应用', background: '背景' }

function findRoots(nodes: KnowledgeNode[]): KnowledgeNode[] {
  if (nodes.length === 0) return []
  const childIds = new Set<string>()
  for (const n of nodes) {
    for (const kid of (n.connectedTo || [])) childIds.add(kid)
  }
  let roots = nodes.filter(n => !childIds.has(n.id))
  if (roots.length === 0) {
    roots = [nodes.reduce((a, b) => (a.connectedTo || []).length >= (b.connectedTo || []).length ? a : b)]
  }
  return roots
}

function getChildren(node: KnowledgeNode, nodes: KnowledgeNode[]): KnowledgeNode[] {
  const ids = node.connectedTo || []
  return ids.map(id => nodes.find(n => n.id === id)).filter(Boolean) as KnowledgeNode[]
}

function HoverCard({ node, nodes }: { node: KnowledgeNode; nodes: KnowledgeNode[] }) {
  const { lang } = useAppStore()
  const t = (zh: string, en: string) => lang === 'zh' ? zh : en
  const cat = (node as any).category || 'concept'
  const color = CAT_COLORS[cat] || '#4B7BFF'
  const detail = t((node as any).detailZh || '', (node as any).detailEn || '')
  const allChildren = getChildren(node, nodes)
  const previewChildren = allChildren.slice(0, 8)

  return (
    <div className="absolute left-full top-0 ml-3 z-50 w-72 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none" style={{ maxWidth: 'calc(100vw - 100px)' }}>
      <div className="rounded-2xl border p-5 shadow-2xl"
        style={{ borderColor: color + '30', background: '#0d0b1e', boxShadow: `0 0 60px ${color}15, 0 0 20px ${color}08` }}>
        <div className="absolute left-0 top-4 -translate-x-full">
          <div className="w-0 h-0 border-t-8 border-b-8 border-r-[10px] border-transparent" style={{ borderRightColor: color + '30' }} />
        </div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
          <span className="text-sm font-semibold text-white">{t(node.labelZh, node.labelEn)}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full border" style={{ borderColor: color + '40', color: color }}>
            {CAT_LABELS[cat] || cat}
          </span>
        </div>
        {detail ? (
          <p className="text-xs text-[#b0bed0] leading-relaxed mb-3">{detail}</p>
        ) : (
          <p className="text-xs text-gray-500 italic mb-3">暂无详细说明</p>
        )}
        {previewChildren.length > 0 && (
          <div>
            <div className="text-[10px] text-gray-500 mb-1.5 uppercase tracking-wider">
              {t('关联子项', 'Sub-items')} ({previewChildren.length})
            </div>
            <div className="flex flex-wrap gap-1">
              {previewChildren.map(c => (
                <span key={c.id} className="text-[10px] px-1.5 py-0.5 rounded border border-white/[0.06] text-gray-400">
                  {t(c.labelZh, c.labelEn)}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function TreeNode({ node, nodes, level, path }: { node: KnowledgeNode; nodes: KnowledgeNode[]; level: number; path: Set<string> }) {
  const { lang } = useAppStore()
  const t = (zh: string, en: string) => lang === 'zh' ? zh : en
  const [open, setOpen] = useState(level < 2)
  const allChildren = getChildren(node, nodes)
  const children = allChildren.filter(c => !path.has(c.id))
  const cat = (node as any).category || 'concept'
  const color = CAT_COLORS[cat] || '#4B7BFF'
  const detail = t((node as any).detailZh || '', (node as any).detailEn || '')

  return (
    <div className="relative">
      <div className="group relative">
        <div
          className="flex items-center gap-2 py-2 px-3 rounded-xl hover:bg-white/[0.04] transition-colors cursor-pointer"
          onClick={() => { if (children.length > 0) setOpen(!open) }}
        >
          {children.length > 0 ? (
            open ? <ChevronDown size={14} className="text-gray-500 shrink-0" /> : <ChevronRight size={14} className="text-gray-500 shrink-0" />
          ) : (
            <Circle size={6} className="text-gray-600 shrink-0 ml-1" />
          )}
          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color }} />
          <span className="text-sm font-medium text-white leading-tight">
            {t(node.labelZh, node.labelEn)}
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full border shrink-0" style={{ borderColor: color + '40', color: color }}>
            {CAT_LABELS[cat] || cat}
          </span>
          {children.length > 0 && (
            <span className="text-[10px] text-gray-500 ml-auto">{children.length}</span>
          )}
        </div>
        <HoverCard node={node} nodes={nodes} />
      </div>

      {open && detail && (
        <div className="ml-7 mt-0.5 mb-1 mr-2">
          <p className="text-xs text-gray-400 leading-relaxed pl-2 border-l border-white/[0.08]">
            {detail}
          </p>
        </div>
      )}

      {open && children.length > 0 && (
        <div className="ml-5 border-l border-white/[0.06] pl-2">
          {children.map(child => {
            const childPath = new Set(path)
            childPath.add(child.id)
            return <TreeNode key={child.id} node={child} nodes={nodes} level={level + 1} path={childPath} />
          })}
        </div>
      )}
    </div>
  )
}

export default function KnowledgeTree({ course }: { course: CourseData }) {
  const { lang } = useAppStore()
  const t = (zh: string, en: string) => lang === 'zh' ? zh : en
  const nodes = course.knowledgeNodes || []
  const roots = findRoots(nodes)

  if (!nodes.length) return null

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.015] p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <Box size={16} className="text-[#4B7BFF]" />
        <h2 className="font-display font-semibold text-white text-sm sm:text-base">
          {t('🧠 知识树', '🧠 Knowledge Tree')}
        </h2>
        <span className="text-[10px] text-gray-500 ml-auto">{nodes.length} 个节点</span>
        <span className="text-[10px] text-gray-600">
          {t('悬停查看详情', 'Hover for details')}
        </span>
      </div>
      <div className="max-h-[600px] overflow-y-auto pr-1">
        {roots.map(node => {
          const rootPath = new Set<string>()
          rootPath.add(node.id)
          return <TreeNode key={node.id} node={node} nodes={nodes} level={0} path={rootPath} />
        })}
      </div>
    </div>
  )
}
