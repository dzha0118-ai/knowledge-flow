import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useRef, useLayoutEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Play, Gamepad2, Sparkles, ArrowRight, Trash2 } from 'lucide-react'
import FeatureCard from '../components/ui/FeatureCard'
import { useAppStore } from '../store/useAppStore'
import { useState, useEffect } from 'react'
import type { VideoPlatform } from '../store/useAppStore'

gsap.registerPlugin(ScrollTrigger)

const BACKGROUND_VIDEOS = [
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260429_115139_0fc6bd3d-3631-4d26-ab9b-28293887dcc9.mp4',
]

const platformInfo: Record<VideoPlatform, { icon: string; label: string; color: string }> = {
  youtube:     { icon: '▶', label: 'YouTube',    color: '#FF0000' },
  bilibili:    { icon: '📺', label: 'Bilibili',   color: '#FB7299' },
  douyin:      { icon: '🎵', label: '抖音',        color: '#FE2C55' },
  xiaohongshu: { icon: '📕', label: '小红书',      color: '#FF2442' },
  unknown:     { icon: '❓', label: '未知平台',     color: '#666666' },
}

export default function Home() {
  const navigate = useNavigate()
  const {
    lang, videoPlatform, processStatus, processMessage,
    setVideoUrl, processVideo, currentCourse, resetToIdle, clearAllCache, clearCacheRemote,
  } = useAppStore()
  const t = (zh: string, en: string) => (lang === 'zh' ? zh : en)
  const [videoError, setVideoError] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [clearing, setClearing] = useState(false)
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    resetToIdle()
  }, [])

  useEffect(() => {
    if (processStatus === 'ready' && currentCourse) {
      navigate(`/display/${currentCourse.courseId}`)
    }
  }, [processStatus, currentCourse, navigate])

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.hero-text', {
        y: 60, opacity: 0, duration: 1, ease: 'power4.out', stagger: 0.12,
      })
      gsap.from('.url-input-wrap', {
        y: 20, autoAlpha: 0, duration: 0.7, delay: 0.5, ease: 'power3.out',
      })
      gsap.from('.platform-badge', {
        scale: 0, opacity: 0, duration: 0.5, delay: 0.8, stagger: 0.08, ease: 'back.out(2)',
      })
      gsap.from('.section-title', {
        y: 30, opacity: 0, duration: 0.6, ease: 'power3.out',
        scrollTrigger: { trigger: '.section-title', start: 'top 85%' },
      })
    }, heroRef)
    return () => ctx.revert()
  }, [])

  const handleInputChange = (val: string) => {
    setInputValue(val)
    setVideoUrl(val)
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text')
    const urls = pasted.match(/https?:\/\/[^\s'"]+/)
    if (urls) {
      e.preventDefault()
      const cleanUrl = urls[0]
      setInputValue(cleanUrl)
      setVideoUrl(cleanUrl)
    }
  }

  const handleSubmit = async () => {
    if (!inputValue.trim()) return
    await processVideo(inputValue.trim())
  }

  const handleClearCache = async () => {
    setClearing(true)
    clearAllCache()
    await clearCacheRemote()
    setInputValue('')
    setClearing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit()
  }

  const features = [
    {
      icon: Play, titleZh: '多模态展示', titleEn: 'Multimodal Display',
      descriptionZh: '视频 + 互动字幕 + 知识图谱多维度同步展示，沉浸式学习体验。',
      descriptionEn: 'Video + interactive captions + knowledge graph synchronized display for immersive learning.',
      gradient: '#4B7BFF, #60A5FA', route: '/display-stage',
    },
    {
      icon: Gamepad2, titleZh: '闯关测试', titleEn: 'Challenge Quiz',
      descriptionZh: 'AI 生成结构化题目，游戏化答题闯关，即时反馈巩固知识。',
      descriptionEn: 'AI-generated structured questions, gamified quiz challenges with instant feedback.',
      gradient: '#A78BFA, #818CF8', route: '/challenge-stage',
    },
    {
      icon: Sparkles, titleZh: '自由回顾', titleEn: 'Free Review',
      descriptionZh: '完成闯关后解锁全部内容，随时回顾视频和重新挑战。',
      descriptionEn: 'Unlock all content after completing challenges, review videos and retry anytime.',
      gradient: '#F59E0B, #F97316', route: '/review-stage',
    },
  ]

  const exampleUrls = [
    { label: 'YouTube', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
    { label: 'B站',     url: 'https://www.bilibili.com/video/BV1GJ411x7h7' },
    { label: '抖音',    url: 'https://v.douyin.com/fvVharYTwMA/' },
    { label: '小红书',  url: 'https://www.xiaohongshu.com/explore/64a1e7fa0000000012036c5d' },
  ]

  const steps = [
    { key: 'detecting', labelZh: '识别平台', labelEn: 'Detect Platform' },
    { key: 'transcribing', labelZh: '提取字幕', labelEn: 'Extract Captions' },
    { key: 'generating', labelZh: 'AI 生成题目', labelEn: 'AI Generate Quiz' },
  ]
  const currentStepIdx = steps.findIndex((s) => s.key === processStatus)

  return (
    <div ref={heroRef} className="relative min-h-screen bg-[#070612] overflow-x-hidden">
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#070612] via-[#0f0a2e] to-[#1a1040]" />
        {!videoError && (
          <video autoPlay loop muted playsInline onError={() => setVideoError(true)}
            className="absolute inset-0 w-full h-full object-cover opacity-40" style={{ pointerEvents: 'none' }}>
            <source src={BACKGROUND_VIDEOS[0]} type="video/mp4" />
          </video>
        )}
        <div className="absolute inset-0 opacity-[0.018] mix-blend-overlay"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.75\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")' }} />
      </div>

      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] rounded-full bg-[#4B7BFF] opacity-[0.04] blur-[140px]" />
        <div className="absolute top-1/3 right-0 w-[400px] h-[400px] rounded-full bg-[#A78BFA] opacity-[0.03] blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] rounded-full bg-[#F59E0B] opacity-[0.03] blur-[100px]" />
      </div>

      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {processStatus === 'idle' ? (
            <motion.div key="idle" initial={{ opacity: 1 }} exit={{ opacity: 0, filter: 'blur(8px)' }} transition={{ duration: 0.4 }}>
              <section className="min-h-screen flex flex-col items-center justify-center px-6 pt-20">
                <div className="text-center max-w-4xl w-full">
                  <span className="hero-text inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl text-xs font-medium text-[#8B9CC7] mb-10">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4B7BFF] shadow-[0_0_8px_rgba(75,123,255,0.6)]" />
                    {t('粘贴视频链接，AI 自动分析', 'Paste video link, AI auto-analyzes')}
                  </span>

                  <h1 className="hero-text font-display font-bold text-5xl sm:text-6xl md:text-7xl leading-[1.08] mb-6 tracking-tight">
                    <span className="text-white">{t('让知识', 'Let Knowledge')}</span>
                    <br />
                    <span className="text-shimmer">{t('流动起来', 'Flow')}</span>
                  </h1>

                  <p className="hero-text text-base sm:text-lg text-[#7B89A8] max-w-[520px] mx-auto mb-10 leading-relaxed">
                    {t(
                      '将视频内容转化为多种模态展示，通过游戏化闯关测试理解程度，让学习变得有趣且高效。',
                      'Transform video content into multimodal displays, test understanding through gamified challenges, making learning fun and efficient.'
                    )}
                  </p>

                  <div id="url-input-section" className="url-input-wrap max-w-xl mx-auto mb-4">
                    <div className="flex items-center gap-3 p-1.5 rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl transition-all duration-300 focus-within:border-[#4B7BFF]/40 focus-within:shadow-lg focus-within:shadow-[#4B7BFF]/5">
                      <input type="text" value={inputValue}
                        onChange={(e) => handleInputChange(e.target.value)} onKeyDown={handleKeyDown} onPaste={handlePaste}
                        placeholder={t('粘贴 YouTube / B站 / 抖音 / 小红书 视频链接...', 'Paste YouTube / Bilibili / Douyin / Xiaohongshu link...')}
                        className="flex-1 bg-transparent text-white placeholder:text-[#5A6A8C] px-4 py-3 outline-none text-sm"
                      />
                      <motion.button whileTap={{ scale: 0.95 }} onClick={handleSubmit} disabled={!inputValue.trim()}
                        className="px-5 py-2.5 rounded-xl font-display font-semibold text-white text-sm bg-gradient-to-r from-[#4B7BFF] to-[#7C5CFC] disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-[#4B7BFF]/25 transition-all whitespace-nowrap">
                        {t('开始分析', 'Analyze')} <ArrowRight size={14} className="inline ml-1" />
                      </motion.button>
                    </div>
                    {videoPlatform !== 'unknown' && inputValue.trim() && (
                      <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="mt-2 ml-3 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: platformInfo[videoPlatform].color }} />
                        <span className="text-xs text-[#5A6A8C]">
                          {t('检测到: ', 'Detected: ')}<span style={{ color: platformInfo[videoPlatform].color }}>{platformInfo[videoPlatform].label}</span>
                        </span>
                      </motion.div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-2">
                    {exampleUrls.map((ex) => (
                      <button key={ex.label} onClick={() => handleInputChange(ex.url)}
                        className="px-3 py-1.5 text-xs rounded-full border border-white/[0.06] text-[#5A6A8C] hover:text-white hover:border-white/[0.15] transition-all">
                        {ex.label}
                      </button>
                    ))}
                    <button onClick={handleClearCache} disabled={clearing}
                      className="px-3 py-1.5 text-xs rounded-full border border-red-500/15 text-red-400/60 hover:text-red-400 hover:border-red-500/30 transition-all flex items-center gap-1">
                      <Trash2 size={10} />
                      {clearing ? t('清除中...', 'Clearing...') : t('清除缓存', 'Clear Cache')}
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-4 mt-10">
                    {(['youtube','bilibili','douyin','xiaohongshu'] as VideoPlatform[]).map((p) => (
                      <div key={p} className="platform-badge flex items-center gap-2 px-3 py-2 rounded-lg border border-white/[0.05] bg-white/[0.02] text-xs">
                        <span>{platformInfo[p].icon}</span>
                        <span className="text-[#5A6A8C]">{platformInfo[p].label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <section id="features" className="px-6 pb-32">
                <div className="max-w-6xl mx-auto">
                  <div className="section-title text-center mb-16">
                    <h2 className="font-display font-bold text-3xl sm:text-4xl text-white mb-4 tracking-tight">
                      {t('学习三阶段', 'Three Learning Phases')}
                    </h2>
                    <p className="text-[#7B89A8] max-w-xl mx-auto">
                      {t('点击「了解更多」查看每个阶段的详细介绍', 'Click "Learn More" to explore each phase in detail')}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {features.map((f, i) => (
                      <FeatureCard
                        key={i}
                        icon={f.icon}
                        title={t(f.titleZh, f.titleEn)}
                        description={t(f.descriptionZh, f.descriptionEn)}
                        gradient={f.gradient}
                        onClick={() => navigate(f.route)}
                        delay={0.2 + i * 0.15}
                      />
                    ))}
                  </div>
                </div>
              </section>
            </motion.div>
          ) : processStatus === 'ready' ? (
            <motion.div key="ready" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="min-h-screen flex flex-col items-center justify-center px-6">
              <div className="w-full max-w-md mx-auto">
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.03] backdrop-blur-xl p-10 text-center">
                  <div className="text-5xl mb-6">✅</div>
                  <h2 className="font-display font-bold text-2xl text-white mb-3">{t('分析完成！', 'Analysis Complete!')}</h2>
                  <p className="text-[#7B89A8] text-sm mb-8">
                    {currentCourse?.titleZh ? t(currentCourse.titleZh, currentCourse.titleEn || '') : ''}
                  </p>
                  <button
                    onClick={() => currentCourse && navigate(`/display/${currentCourse.courseId}`)}
                    className="px-8 py-3 rounded-xl font-display font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:shadow-lg hover:shadow-emerald-500/25 transition-all"
                  >
                    {t('进入学习 →', 'Start Learning →')}
                  </button>
                </div>
              </div>
            </motion.div>
          ) : processStatus === 'error' ? (
            <motion.div key="error" initial={{ opacity: 0, filter: 'blur(8px)', scale: 0.97 }}
              animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }} className="min-h-screen flex flex-col items-center justify-center px-6">
              <div className="w-full max-w-md mx-auto">
                <div className="rounded-2xl border border-red-500/10 bg-red-500/[0.02] backdrop-blur-xl p-10 text-center">
                  <div className="text-5xl mb-6">⚠️</div>
                  <h2 className="font-display font-bold text-2xl text-white mb-3">
                    {t('分析失败', 'Analysis Failed')}
                  </h2>
                  <p className="text-[#7B89A8] text-sm mb-8 leading-relaxed">{processMessage}</p>
                  <div className="flex justify-center gap-3">
                    <button onClick={() => { resetToIdle(); setInputValue('') }}
                      className="px-6 py-3 rounded-xl font-display font-semibold text-white bg-gradient-to-r from-[#4B7BFF] to-[#7C5CFC] hover:shadow-lg hover:shadow-[#4B7BFF]/25 transition-all">
                      {t('重新输入', 'Try Again')}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div key="processing" initial={{ opacity: 0, filter: 'blur(8px)', scale: 0.97 }}
              animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }} className="min-h-screen flex flex-col items-center justify-center px-6">
              <div className="w-full max-w-md mx-auto">
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl p-10 text-center">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="w-16 h-16 mx-auto mb-8 rounded-full border-2 border-[#4B7BFF]/20 border-t-[#4B7BFF]" />
                  <h2 className="font-display font-bold text-2xl text-white mb-2">{t('AI 正在分析视频...', 'AI is analyzing video...')}</h2>
                  <p className="text-[#7B89A8] text-sm mb-8">{processMessage}</p>
                  <div className="space-y-3 text-left">
                    {steps.map((s, i) => {
                      const isActive = i === currentStepIdx; const isDone = i < currentStepIdx
                      return (
                        <div key={s.key} className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-all ${isDone ? 'bg-emerald-500 text-white' : isActive ? 'bg-[#4B7BFF] text-white animate-pulse' : 'bg-white/[0.04] text-[#5A6A8C]'}`}>
                            {isDone ? '✓' : i + 1}
                          </div>
                          <span className={`text-sm transition-colors ${isDone ? 'text-emerald-400' : isActive ? 'text-white' : 'text-[#4E5D7C]'}`}>
                            {lang === 'zh' ? s.labelZh : s.labelEn}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
