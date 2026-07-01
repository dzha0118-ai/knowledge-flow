import { BookOpen, Lightbulb, CheckCircle } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import type { CourseData } from '../store/useAppStore'

const ICON_MAP: Record<string, string> = {
  '📌': '📌', '📝': '📝', '📖': '📖', '🎯': '🎯', '📊': '📊',
  '🔑': '🔑', '💡': '💡', '⭐': '⭐', '🏆': '🏆', '✅': '✅',
  '📚': '📚', '💪': '💪', '🔍': '🔍', '🎓': '🎓', '🧠': '🧠',
}

export default function ArticleView({ course }: { course: CourseData }) {
  const { lang } = useAppStore()
  const t = (zh: string, en: string) => (lang === 'zh' ? zh : en)
  const article = course.article

  if (!article) return null

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-500/20 bg-amber-500/5 text-amber-400 text-xs mb-6">
          <BookOpen size={14} />
          {t('AI 图文解析', 'AI Article Analysis')}
        </div>
        <h1 className="text-3xl md:text-5xl font-display font-bold text-white mb-4 leading-tight">
          {article.articleTitle || t(course.titleZh, course.titleEn)}
        </h1>
        <div className="w-20 h-1 bg-gradient-to-r from-amber-400 to-orange-500 mx-auto rounded-full" />
      </div>

      {/* Key Highlights */}
      {(article.keyHighlights?.length || [] as any).length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {article.keyHighlights!.map((h: string, i: number) => (
            <div key={i} className="flex items-start gap-3 p-4 rounded-xl border border-amber-500/10 bg-amber-500/[0.03]">
              <Lightbulb size={18} className="text-amber-400 mt-0.5 shrink-0" />
              <span className="text-[#d4d8e0] text-sm leading-relaxed">{h}</span>
            </div>
          ))}
        </div>
      )}

      {/* Article Sections */}
      <div className="space-y-6">
        {(article.articleSections || []).map((section: any, i: number) => {
          const emoji = ICON_MAP[section.iconEmoji] || section.iconEmoji || '📌'
          return (
            <div key={i} className="group rounded-2xl border border-white/[0.06] bg-white/[0.015] hover:border-white/[0.12] transition-all duration-300 p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 flex items-center justify-center text-xl shrink-0">
                  {emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-display font-semibold text-white mb-3">
                    {section.heading}
                  </h3>
                  <p className="text-[#9aadc7] text-sm leading-relaxed">
                    {section.body}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Conclusion */}
      {article.conclusion && (
        <div className="rounded-2xl border border-emerald-500/10 bg-emerald-500/[0.03] p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle size={18} className="text-emerald-400" />
            <h3 className="text-sm font-display font-semibold text-emerald-400 uppercase tracking-wider">
              {t('总结', 'Conclusion')}
            </h3>
          </div>
          <p className="text-[#c4d0e0] text-sm leading-relaxed">
            {article.conclusion}
          </p>
        </div>
      )}
    </div>
  )
}
