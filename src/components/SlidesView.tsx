import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Zap, BookOpen, Lightbulb, ArrowRight, Tag } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import type { CourseData } from '../store/useAppStore'

const CAT_LABELS: Record<string, string> = { concept: '概念', method: '方法', example: '案例', application: '应用', background: '背景' }
const CAT_COLORS: Record<string, string> = { concept: '#4B7BFF', method: '#A78BFA', example: '#F59E0B', application: '#10B981', background: '#EC4899' }

interface Slide {
  id: string
  type: 'title' | 'chapter' | 'node' | 'summary' | 'cta'
  heading: string
  subheading?: string
  body: string
  detail?: string
  meta?: string
  color: string
  childrenLabels?: string[]
}

function buildSlides(course: CourseData, lang: 'zh' | 'en'): Slide[] {
  const t = (zh: string, en: string) => (lang === 'zh' ? zh : en)
  const slides: Slide[] = []
  const nodes = course.knowledgeNodes || []

  slides.push({
    id: 'title', type: 'title',
    heading: t(course.titleZh, course.titleEn),
    subheading: t(course.descriptionZh, course.descriptionEn),
    body: '',
    color: '#4B7BFF',
  })

  // Chapter slides — show full detail
  for (const ch of (course.chapters || [])) {
    const detailText = t((ch as any).detailZh || '', (ch as any).detailEn || '')
    slides.push({
      id: ch.id, type: 'chapter',
      heading: t(ch.titleZh, ch.titleEn),
      subheading: `${Math.floor((ch.startTime || 0) / 60)}:${String((ch.startTime || 0) % 60).padStart(2, '0')} - ${Math.floor((ch.endTime || 0) / 60)}:${String((ch.endTime || 0) % 60).padStart(2, '0')}`,
      body: detailText || t('暂无详细描述', 'No detail available'),
      color: '#A78BFA',
    })
  }

  // Knowledge node slides — show detail + children list
  for (const node of nodes) {
    const cat = (node as any).category || 'concept'
    const color = CAT_COLORS[cat] || '#4B7BFF'
    const detailText = t((node as any).detailZh || '', (node as any).detailEn || '')
    // Get children labels
    const childIds = node.connectedTo || []
    const childLabels = childIds
      .map((cid: string) => nodes.find(n => n.id === cid))
      .filter(Boolean)
      .map((c: any) => t(c.labelZh, c.labelEn))

    slides.push({
      id: node.id, type: 'node',
      heading: t(node.labelZh, node.labelEn),
      body: detailText || t('暂无详细说明', 'No detail available'),
      meta: (CAT_LABELS[cat] || cat) + ' · ' + t(
        childLabels.length > 0 ? `关联: ${childLabels.join('、')}` : '无关联节点',
        childLabels.length > 0 ? `Related: ${childLabels.join(', ')}` : 'No related nodes'
      ),
      color,
      childrenLabels: childLabels.length > 0 ? childLabels : undefined,
    })
  }

  // Summary slide
  if (course.summaryZh) {
    slides.push({
      id: 'summary', type: 'summary',
      heading: t('📝 内容总结', '📝 Summary'),
      body: t(course.summaryZh, course.summaryEn),
      color: '#10B981',
    })
  }

  // CTA slide
  slides.push({
    id: 'cta', type: 'cta',
    heading: t('准备好闯关了吗？', 'Ready for the challenge?'),
    body: t(`共 ${(course.quizQuestions || []).length} 道题目`, `${(course.quizQuestions || []).length} questions`),
    color: '#4B7BFF',
  })

  return slides
}

export default function SlidesView({ course }: { course: CourseData }) {
  const { lang } = useAppStore()
  const navigate = useNavigate()
  const t = (zh: string, en: string) => (lang === 'zh' ? zh : en)
  const slides = buildSlides(course, lang)
  const [idx, setIdx] = useState(0)
  const total = slides.length
  const slide = slides[idx]
  if (total === 0) return null

  const prev = useCallback(() => setIdx(i => Math.max(0, i - 1)), [])
  const next = useCallback(() => setIdx(i => Math.min(total - 1, i + 1)), [total])
  const handleKey = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') prev()
    if (e.key === 'ArrowRight') next()
  }, [prev, next])

  return (
    <div tabIndex={0} onKeyDown={handleKey} className="outline-none flex flex-col items-center justify-center min-h-[60vh] px-4">
      {/* Progress bar */}
      <div className="w-full max-w-xl mb-8">
        <div className="flex gap-1">
          {slides.map((s, i) => (
            <button key={s.id} onClick={() => setIdx(i)}
              className="h-1 rounded-full flex-1 transition-all duration-300"
              style={{ background: i <= idx ? slide.color : 'rgba(255,255,255,0.08)', opacity: i <= idx ? 1 : 0.4 }}
            />
          ))}
        </div>
        <div className="text-center mt-2 text-[11px] text-gray-500">{idx + 1} / {total}</div>
      </div>

      {/* Slide Card */}
      <div
        className="w-full max-w-2xl rounded-3xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-2xl p-6 sm:p-10 transition-all duration-500 relative overflow-hidden"
        style={{ boxShadow: `0 0 100px ${slide.color}08, 0 0 40px ${slide.color}04` }}
      >
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-[0.05] blur-3xl pointer-events-none" style={{ background: slide.color }} />
        <div className="relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium mb-5 border"
            style={{ borderColor: slide.color + '35', color: slide.color }}>
            {slide.type === 'title' && <><BookOpen size={12} /> {t('封面', 'Cover')}</>}
            {slide.type === 'chapter' && <><BookOpen size={12} /> {t('章节', 'Chapter')}</>}
            {slide.type === 'node' && <><Lightbulb size={12} /> {t('知识点', 'Concept')}</>}
            {slide.type === 'summary' && <><Zap size={12} /> {t('总结', 'Summary')}</>}
            {slide.type === 'cta' && <><Zap size={12} /> {t('闯关', 'Challenge')}</>}
          </div>

          <h2 className="text-2xl sm:text-3xl font-display font-bold text-white mb-3 leading-tight">{slide.heading}</h2>
          {slide.subheading && <p className="text-xs text-[#8a9ab8] mb-4">{slide.subheading}</p>}

          {/* Full body text */}
          {slide.body && (
            <p className="text-sm text-[#c4d0e0] leading-relaxed mb-4 whitespace-pre-line">{slide.body}</p>
          )}

          {/* Children labels for node slides */}
          {slide.childrenLabels && slide.childrenLabels.length > 0 && (
            <div className="mt-3 mb-3">
              <div className="text-[10px] text-gray-500 mb-2 uppercase tracking-wider">
                {t('关联知识点', 'Related Concepts')}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {slide.childrenLabels.map((lbl, i) => (
                  <span key={i} className="text-[11px] px-2 py-1 rounded-lg border border-white/[0.06] bg-white/[0.02] text-gray-300 flex items-center gap-1">
                    <Tag size={10} className="text-gray-500" /> {lbl}
                  </span>
                ))}
              </div>
            </div>
          )}

          {slide.meta && <p className="text-[11px] text-gray-500 mt-2">{slide.meta}</p>}

          {slide.type === 'cta' && (
            <button
              onClick={() => navigate(`/challenge/${course.courseId}`)}
              className="mt-6 px-8 py-3.5 rounded-xl font-display font-semibold text-white text-sm bg-gradient-to-r from-[#4B7BFF] to-[#7C5CFC] hover:shadow-xl hover:shadow-[#4B7BFF]/25 transition-all duration-300 flex items-center gap-2 mx-auto"
            >
              {t('开始闯关', 'Start Challenge')} <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-4 mt-8">
        <button onClick={prev} disabled={idx === 0}
          className="w-12 h-12 rounded-full border border-white/[0.08] bg-white/[0.03] flex items-center justify-center text-white/60 hover:text-white hover:border-white/20 transition-all disabled:opacity-20 disabled:cursor-not-allowed">
          <ChevronLeft size={20} />
        </button>
        <button onClick={() => navigate(`/challenge/${course.courseId}`)}
          className="px-6 py-3 rounded-xl font-display font-semibold text-white text-sm bg-gradient-to-r from-emerald-500 to-teal-500 hover:shadow-lg hover:shadow-emerald-500/25 transition-all duration-300">
          {t('跳过，直接闯关', 'Skip to Challenge')} →
        </button>
        <button onClick={next} disabled={idx === total - 1}
          className="w-12 h-12 rounded-full border border-white/[0.08] bg-white/[0.03] flex items-center justify-center text-white/60 hover:text-white hover:border-white/20 transition-all disabled:opacity-20 disabled:cursor-not-allowed">
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  )
}
