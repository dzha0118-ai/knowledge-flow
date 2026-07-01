import { X } from 'lucide-react'
import type { KnowledgeNode } from '../../store/useAppStore'

interface Props {
  node: KnowledgeNode
  lang: 'zh' | 'en'
  onClose: () => void
}

const CATEGORY_LABELS: Record<string, [string, string]> = {
  concept: ['概念', 'Concept'],
  principle: ['原理', 'Principle'],
  example: ['示例', 'Example'],
  application: ['应用', 'Application'],
  tool: ['工具', 'Tool'],
  method: ['方法', 'Method'],
  reference: ['参考', 'Reference'],
}

export default function NodeDetailPanel({ node, lang, onClose }: Props) {
  const t = (zh: string, en: string) => lang === 'zh' ? zh : en
  const label = lang === 'zh' ? node.labelZh : node.labelEn
  const detail = lang === 'zh' ? (node.detailZh || node.detailEn || '') : (node.detailEn || node.detailZh || '')
  const cat = CATEGORY_LABELS[node.category || ''] || [node.category, node.category]

  return (
    <div className="absolute bottom-4 left-4 right-4 z-30 pointer-events-none">
      <div className="max-w-md mx-auto pointer-events-auto">
        <div className="rounded-xl border border-white/[0.12] bg-[#0D0B1A]/95 backdrop-blur-xl p-4 shadow-2xl">
          <div className="flex items-start justify-between mb-2">
            <div>
              <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium border border-[#4B7BFF]/30 text-[#4B7BFF] bg-[#4B7BFF]/10 mb-1.5">
                {t(cat[0], cat[1])}
              </span>
              <h3 className="font-display font-bold text-white text-base">{label}</h3>
            </div>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/[0.06] transition-colors">
              <X size={14} className="text-gray-400" />
            </button>
          </div>
          <p className="text-gray-400 text-xs leading-relaxed">{detail}</p>
          {node.timestamp !== undefined && node.timestamp > 0 && (
            <p className="text-[10px] text-gray-500 mt-2">
              {t('时间戳', 'Timestamp')}: {Math.floor(node.timestamp)}s
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
