import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useRef, useLayoutEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Gamepad2, Trophy, Zap, Target, ArrowRight } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'

gsap.registerPlugin(ScrollTrigger)

const VIDEO_BG = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260411_104032_69319010-2458-492b-b04d-b40a5dfa4482.mp4'

export default function ChallengeStage() {
  const navigate = useNavigate()
  const { lang, toggleLang } = useAppStore()
  const t = (zh: string, en: string) => (lang === 'zh' ? zh : en)
  const sectionRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.hero-text-2', { y: 60, opacity: 0, duration: 1, ease: 'power3.out', stagger: 0.15 })
      gsap.from('.quiz-type-card', {
        scale: 0.85, opacity: 0, duration: 0.7, ease: 'back.out(1.4)',
        scrollTrigger: { trigger: '.quiz-type-grid', start: 'top 75%' },
        stagger: 0.1,
      })
      gsap.from('.orbit-row', {
        x: -40, opacity: 0, duration: 0.8, ease: 'power2.out',
        scrollTrigger: { trigger: '.orbit-section', start: 'top 80%' },
        stagger: 0.12,
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  const quizTypes = [
    { icon: Target, titleZh: '单选题', titleEn: 'Single Choice', descZh: '经典四选一，精准测试知识点', descEn: 'Classic 4-option knowledge test', color: '#4B7BFF' },
    { icon: Gamepad2, titleZh: '多选题', titleEn: 'Multiple Choice', descZh: '多维度考察，全面检验理解', descEn: 'Multi-dimensional comprehensive test', color: '#A78BFA' },
    { icon: Zap, titleZh: '判断题', titleEn: 'True/False', descZh: '快速判断，即时反馈纠错', descEn: 'Quick judgment with instant feedback', color: '#F59E0B' },
  ]

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
            <div className="hero-text-2 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#A78BFA]/30 bg-[#A78BFA]/5 text-xs text-[#A78BFA] mb-8">
              <Gamepad2 size={14} /> {t('阶段二', 'Phase 2')}
            </div>
            <h1 className="hero-text-2 text-5xl md:text-7xl font-display font-bold text-white mb-6">
              {t('闯关测试', 'Challenge Quiz')}
            </h1>
            <p className="hero-text-2 text-lg text-[#7B89A8] max-w-2xl mx-auto leading-relaxed">
              {t(
                'AI 根据视频内容自动生成结构化题目。游戏化答题闯关、即时正误反馈、轨道进度可视化。通关后解锁全部内容，自由回顾。',
                'AI auto-generates structured questions from video content. Gamified quiz challenges with instant feedback, orbit progress visualization. Unlock full review after completion.'
              )}
            </p>
          </div>

          {/* Quiz Types */}
          <div className="quiz-type-grid grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
            {quizTypes.map((q, i) => (
              <div key={i} className="quiz-type-card rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl p-8 hover:border-white/[0.12] transition-all duration-300">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ background: `linear-gradient(135deg, ${q.color}20, ${q.color}05)` }}>
                  <q.icon size={22} style={{ color: q.color }} />
                </div>
                <h3 className="text-white font-display font-semibold text-lg mb-2">{t(q.titleZh, q.titleEn)}</h3>
                <p className="text-[#7B89A8] text-sm">{t(q.descZh, q.descEn)}</p>
              </div>
            ))}
          </div>

          {/* Progress system */}
          <div className="orbit-section rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl p-10 mb-20">
            <h2 className="text-white font-display font-bold text-2xl mb-8 text-center">{t('🎯 游戏化机制', '🎯 Gamification System')}</h2>
            <div className="space-y-5 max-w-lg mx-auto">
              {[
                { labelZh: '轨道进度环', labelEn: 'Orbit Progress Rings', descZh: '3D 多层轨道可视化答题进度', descEn: '3D multi-layer orbit visualizes quiz progress' },
                { labelZh: '即时反馈', labelEn: 'Instant Feedback', descZh: '每题答完立刻显示正误 + 解析', descEn: 'Immediate correct/incorrect + explanation' },
                { labelZh: '解锁机制', labelEn: 'Unlock System', descZh: '逐关解锁，通关后激活回顾模式', descEn: 'Level-by-level unlock, full review after completion' },
                { labelZh: '分数统计', labelEn: 'Score Tracking', descZh: '实时计分 + 通关成就判定', descEn: 'Real-time scoring + achievement determination' },
              ].map((item, i) => (
                <div key={i} className="orbit-row flex items-start gap-4 p-4 rounded-xl border border-white/[0.04]">
                  <div className="w-8 h-8 rounded-lg bg-[#A78BFA]/10 flex items-center justify-center text-[#A78BFA] text-sm font-bold flex-shrink-0">{i + 1}</div>
                  <div>
                    <h4 className="text-white font-medium text-sm">{t(item.labelZh, item.labelEn)}</h4>
                    <p className="text-[#7B89A8] text-xs mt-0.5">{t(item.descZh, item.descEn)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={() => navigate('/')}
              className="group px-8 py-4 rounded-xl bg-gradient-to-r from-[#A78BFA] to-[#818CF8] text-white font-display font-semibold hover:shadow-xl hover:shadow-[#A78BFA]/20 transition-all duration-300"
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
