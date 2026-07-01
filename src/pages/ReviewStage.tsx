import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useRef, useLayoutEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Sparkles, BookOpen, BarChart3, RotateCcw, ArrowRight } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'

gsap.registerPlugin(ScrollTrigger)

const VIDEO_BG = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260429_115139_0fc6bd3d-3631-4d26-ab9b-28293887dcc9.mp4'

export default function ReviewStage() {
  const navigate = useNavigate()
  const { lang, toggleLang } = useAppStore()
  const t = (zh: string, en: string) => (lang === 'zh' ? zh : en)
  const sectionRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.hero-text-3', { y: 60, opacity: 0, duration: 1, ease: 'power3.out', stagger: 0.15 })
      gsap.from('.review-card', {
        y: 50, opacity: 0, duration: 0.8, ease: 'power2.out',
        scrollTrigger: { trigger: '.review-grid', start: 'top 80%' },
        stagger: 0.12,
      })
      gsap.from('.glow-line', {
        scaleX: 0, duration: 1.2, ease: 'power3.inOut',
        scrollTrigger: { trigger: '.glow-line', start: 'top 90%' },
        transformOrigin: 'left',
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <div ref={sectionRef} className="min-h-screen bg-[#070612] overflow-x-hidden">
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#070612] via-[#0f0a2e] to-[#1a1040]" />
        <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-35" style={{ pointerEvents: 'none' }}>
          <source src={VIDEO_BG} type="video/mp4" />
        </video>
      </div>

      <div className="relative z-10">
        <div className="pt-20 pb-24 px-6 max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <div className="hero-text-3 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#F59E0B]/30 bg-[#F59E0B]/5 text-xs text-[#F59E0B] mb-8">
              <Sparkles size={14} /> {t('阶段三', 'Phase 3')}
            </div>
            <h1 className="hero-text-3 text-5xl md:text-7xl font-display font-bold text-white mb-6">
              {t('自由回顾', 'Free Review')}
            </h1>
            <p className="hero-text-3 text-lg text-[#7B89A8] max-w-2xl mx-auto leading-relaxed">
              {t(
                '完成所有闯关后，全部内容永久解锁。随时回顾视频、查看笔记、重新挑战。AI 生成的摘要和知识点标签帮你快速定位核心内容。',
                'After completing all challenges, all content is permanently unlocked. Review videos, check notes, retry challenges anytime. AI-generated summaries and knowledge tags help quickly locate core content.'
              )}
            </p>
          </div>

          {/* Feature cards */}
          <div className="review-grid grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
            {[
              { icon: BookOpen, titleZh: 'AI 内容摘要', titleEn: 'AI Summary', descZh: '智能提炼视频核心观点', descEn: 'Smart extraction of core insights', color: '#F59E0B' },
              { icon: BarChart3, titleZh: '成绩统计', titleEn: 'Score Stats', descZh: '答题得分 & 知识掌握度', descEn: 'Quiz score & mastery level', color: '#F97316' },
              { icon: RotateCcw, titleZh: '重新挑战', titleEn: 'Retry Anytime', descZh: '无限次重玩闯关测试', descEn: 'Unlimited quiz retries', color: '#FBBF24' },
            ].map((f, i) => (
              <div key={i} className="review-card rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl p-8 hover:border-white/[0.12] transition-all duration-300">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ background: `linear-gradient(135deg, ${f.color}20, ${f.color}05)` }}>
                  <f.icon size={22} style={{ color: f.color }} />
                </div>
                <h3 className="text-white font-display font-semibold text-lg mb-2">{t(f.titleZh, f.titleEn)}</h3>
                <p className="text-[#7B89A8] text-sm">{t(f.descZh, f.descEn)}</p>
              </div>
            ))}
          </div>

          {/* Flow diagram */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl p-10 mb-20">
            <h2 className="text-white font-display font-bold text-2xl mb-10 text-center">{t('🔄 学习闭环', '🔄 Learning Loop')}</h2>
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
              {[
                { labelZh: '粘贴链接', labelEn: 'Paste Link', color: '#4B7BFF' },
                { labelZh: 'AI 分析', labelEn: 'AI Analysis', color: '#A78BFA' },
                { labelZh: '多模态学习', labelEn: 'Multimodal Study', color: '#F59E0B' },
                { labelZh: '闯关测试', labelEn: 'Quiz Challenge', color: '#F97316' },
                { labelZh: '自由回顾', labelEn: 'Free Review', color: '#10B981' },
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm" style={{ background: step.color }}>
                      {i + 1}
                    </div>
                    <span className="text-xs text-[#7B89A8]">{t(step.labelZh, step.labelEn)}</span>
                  </div>
                  {i < 4 && <ArrowRight size={20} className="text-white/20 hidden md:block" />}
                </div>
              ))}
            </div>
          </div>

          <div className="glow-line h-px bg-gradient-to-r from-transparent via-[#F59E0B]/30 to-transparent mb-20" />

          <div className="text-center">
            <button
              onClick={() => navigate('/')}
              className="group px-8 py-4 rounded-xl bg-gradient-to-r from-[#F59E0B] to-[#F97316] text-white font-display font-semibold hover:shadow-xl hover:shadow-[#F59E0B]/20 transition-all duration-300"
            >
              <span className="flex items-center gap-2">
                {t('立即体验', 'Try It Now')}
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
