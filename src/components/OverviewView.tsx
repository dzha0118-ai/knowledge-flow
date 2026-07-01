import { useNavigate } from 'react-router-dom'
import { ArrowRight, Clock, Tag, Layers, Brain, Target } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import KnowledgeTree from './KnowledgeTree'
import type { CourseData } from '../store/useAppStore'

export default function OverviewView({ course }: { course: CourseData }) {
  const { lang } = useAppStore()
  const navigate = useNavigate()
  const t = (zh: string, en: string) => (lang === 'zh' ? zh : en)
  const article = course.article
  const nodes = course.knowledgeNodes || []
  const chaps = course.chapters || []

  const pLabel = (p: string) => ({ youtube: 'YouTube', bilibili: 'B站', douyin: '抖音', xiaohongshu: '小红书' }[p] || p)

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-[#0f0a2e] via-[#120e36] to-[#1a1040] p-8 sm:p-12">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#4B7BFF] opacity-[0.04] blur-[120px] pointer-events-none" />
        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium border border-[#4B7BFF]/30 text-[#4B7BFF] bg-[#4B7BFF]/5">
              {pLabel(course.videoPlatform)}
            </span>
            <span className="text-xs text-gray-500">{t('AI 生成 · 学习总览', 'AI Generated · Overview')}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-white mb-3 leading-tight">
            {t(course.titleZh, course.titleEn)}
          </h1>
          <p className="text-[#9aadc7] text-sm leading-relaxed max-w-2xl">{t(course.descriptionZh, course.descriptionEn)}</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: Layers, label: t('章节', 'Chapters'), value: String(chaps.length), color: '#4B7BFF' },
          { icon: Brain, label: t('知识点', 'Concepts'), value: String(nodes.length), color: '#A78BFA' },
          { icon: Target, label: t('题目', 'Questions'), value: String((course.quizQuestions || []).length), color: '#F59E0B' },
          { icon: Clock, label: t('字幕条', 'Captions'), value: String((course.captions || []).length), color: '#10B981' },
        ].map((s, i) => (
          <div key={i} className="rounded-2xl border border-white/[0.06] bg-white/[0.015] p-4 text-center">
            <div className="w-8 h-8 rounded-lg mx-auto mb-2 flex items-center justify-center" style={{ background: s.color + '18' }}>
              <s.icon size={15} style={{ color: s.color }} />
            </div>
            <div className="text-2xl font-display font-bold text-white">{s.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Detailed Summary */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.015] p-6 sm:p-8">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-1.5 h-5 rounded-full bg-[#4B7BFF]" />
          <h2 className="font-display font-semibold text-white text-lg">{t('📝 详细摘要', '📝 Detailed Summary')}</h2>
        </div>
        <p className="text-[#b0bed0] text-sm leading-relaxed whitespace-pre-line">
          {t(course.summaryZh || course.descriptionZh, course.summaryEn || course.descriptionEn)}
        </p>
      </div>

      {/* Knowledge Tree */}
      <KnowledgeTree course={course} />

      {/* Chapters with details */}
      {chaps.length > 0 && (
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.015] p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1.5 h-5 rounded-full bg-[#A78BFA]" />
            <h2 className="font-display font-semibold text-white text-lg">
              {t('📖 章节详解', '📖 Chapter Details')}
            </h2>
          </div>
          <div className="space-y-6">
            {chaps.map((ch: any, i: number) => (
              <div key={ch.id || i} className="flex items-start gap-4 group">
                <div className="flex flex-col items-center">
                  <div className="w-9 h-9 rounded-full bg-[#A78BFA]/10 border border-[#A78BFA]/20 flex items-center justify-center text-xs font-bold text-[#A78BFA] group-hover:bg-[#A78BFA]/20 transition-colors shrink-0">
                    {i + 1}
                  </div>
                  {i < chaps.length - 1 && <div className="w-px flex-1 bg-white/[0.06] mt-1 min-h-[40px]" />}
                </div>
                <div className="flex-1 min-w-0 pb-4">
                  <h3 className="text-white font-medium text-sm mb-1">{t(ch.titleZh, ch.titleEn)}</h3>
                  <span className="text-[10px] text-gray-500">
                    {Math.floor((ch.startTime || 0) / 60)}:{String((ch.startTime || 0) % 60).padStart(2, '0')}
                    {' - '}
                    {Math.floor((ch.endTime || 0) / 60)}:{String((ch.endTime || 0) % 60).padStart(2, '0')}
                  </span>
                  {(ch.detailZh || ch.detailEn) && (
                    <p className="text-xs text-[#8a9ab8] mt-2 leading-relaxed border-l border-white/[0.06] pl-3">
                      {t(ch.detailZh || '', ch.detailEn || '')}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Article sections if available */}
      {article?.articleSections?.length ? (
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.015] p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1.5 h-5 rounded-full bg-emerald-400" />
            <h2 className="font-display font-semibold text-white text-lg">
              {t('📄 图文解析', '📄 Article Analysis')}
            </h2>
          </div>
          <div className="space-y-5">
            {article.articleSections.map((s: any, i: number) => (
              <div key={i} className="group rounded-xl border border-white/[0.04] hover:border-white/[0.1] bg-white/[0.01] p-5 transition-all">
                <h3 className="text-white font-display font-semibold text-sm mb-3 flex items-center gap-2">
                  <span>{s.iconEmoji || '📌'}</span> {s.heading}
                </h3>
                <p className="text-[#8a9ab8] text-xs leading-relaxed">{s.body}</p>
              </div>
            ))}
            {article.conclusion && (
              <div className="rounded-xl border border-emerald-500/10 bg-emerald-500/[0.03] p-5">
                <h3 className="text-xs font-display font-semibold text-emerald-400 mb-2 uppercase tracking-wider">
                  {t('总结', 'Conclusion')}
                </h3>
                <p className="text-[#c4d0e0] text-sm leading-relaxed">{article.conclusion}</p>
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* Quiz Preview */}
      {(course.quizQuestions || []).length > 0 && (
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.015] p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1.5 h-5 rounded-full bg-[#EF4444]" />
            <h2 className="font-display font-semibold text-white text-lg">
              {t('🎯 闯关预览', '🎯 Quiz Preview')}
            </h2>
          </div>
          <div className="space-y-3">
            {(course.quizQuestions || []).slice(0, 5).map((q: any, i: number) => (
              <div key={q.id || i} className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02]">
                <span className="w-5 h-5 rounded bg-[#EF4444]/10 border border-[#EF4444]/20 flex items-center justify-center text-[10px] font-bold text-[#EF4444] shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#c4d0e0] leading-relaxed">{t(q.questionZh, q.questionEn)}</p>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded mt-1.5 inline-block ${
                    q.difficulty === 'easy'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}>
                    {q.difficulty === 'easy' ? t('简单', 'Easy') : t('中等', 'Medium')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom CTA */}
      <div className="text-center pt-4 pb-8">
        <button
          onClick={() => navigate(`/challenge/${course.courseId}`)}
          className="group inline-flex items-center gap-3 px-10 py-4 rounded-2xl font-display font-bold text-white text-lg bg-gradient-to-r from-[#4B7BFF] to-[#7C5CFC] hover:shadow-2xl hover:shadow-[#4B7BFF]/30 transition-all duration-300 hover:scale-[1.03]"
        >
          {t('开始闯关测试', 'Start Challenge Quiz')}
          <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  )
}
