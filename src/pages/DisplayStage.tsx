import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useRef, useLayoutEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Monitor, Subtitles, Network, Zap, ArrowRight } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'

gsap.registerPlugin(ScrollTrigger)

const VIDEO_BG = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260429_115139_0fc6bd3d-3631-4d26-ab9b-28293887dcc9.mp4'

export default function DisplayStage() {
  const navigate = useNavigate()
  const { lang, toggleLang } = useAppStore()
  const t = (zh: string, en: string) => (lang === 'zh' ? zh : en)
  const sectionRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.hero-text-display', {
        y: 60, opacity: 0, duration: 1, ease: 'power3.out',
        stagger: 0.15,
      })
      gsap.from('.feature-row', {
        y: 40, opacity: 0, duration: 0.8, ease: 'power2.out',
        scrollTrigger: { trigger: '.feature-row', start: 'top 80%' },
        stagger: 0.12,
      })
      gsap.from('.tech-card', {
        scale: 0.9, opacity: 0, duration: 0.7, ease: 'back.out(1.4)',
        scrollTrigger: { trigger: '.tech-grid', start: 'top 75%' },
        stagger: 0.1,
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  const features = [
    { icon: Monitor, titleZh: '视频播放', titleEn: 'Video Player', descZh: '支持 YouTube / B站 嵌入式播放', descEn: 'Embedded YouTube & Bilibili support' },
    { icon: Subtitles, titleZh: '互动字幕', titleEn: 'Interactive Captions', descZh: 'AI 自动提取 + 时间戳联动', descEn: 'AI auto-extract + timestamp sync' },
    { icon: Network, titleZh: '知识图谱', titleEn: 'Knowledge Graph', descZh: '3D 节点可视化知识点关系', descEn: '3D node visualization of knowledge links' },
    { icon: Zap, titleZh: '实时同步', titleEn: 'Real-time Sync', descZh: '视频进度 ↔ 字幕 ↔ 节点联动', descEn: 'Video ↔ Captions ↔ Nodes sync' },
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
          {/* Hero */}
          <div className="text-center mb-20">
            <div className="hero-text-display inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#4B7BFF]/30 bg-[#4B7BFF]/5 text-xs text-[#4B7BFF] mb-8">
              <Monitor size={14} /> {t('阶段一', 'Phase 1')}
            </div>
            <h1 className="hero-text-display text-5xl md:text-7xl font-display font-bold text-white mb-6">
              {t('多模态展示', 'Multimodal Display')}
            </h1>
            <p className="hero-text-display text-lg text-[#7B89A8] max-w-2xl mx-auto leading-relaxed">
              {t(
                '粘贴任意视频链接，AI 自动提取字幕、识别知识点，构建 3D 知识网络。视频播放时字幕高亮同步、知识节点脉冲联动，打造沉浸式学习空间。',
                'Paste any video link, AI auto-extracts captions, identifies knowledge points, and builds a 3D knowledge network. Captions highlight and knowledge nodes pulse in sync with video playback.'
              )}
            </p>
          </div>

          {/* Feature rows */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">
            {features.map((f, i) => (
              <div key={i} className="feature-row rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl p-8 hover:border-white/[0.12] transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#4B7BFF]/20 to-[#4B7BFF]/5 flex items-center justify-center mb-5">
                  <f.icon size={22} className="text-[#4B7BFF]" />
                </div>
                <h3 className="text-white font-display font-semibold text-lg mb-2">{t(f.titleZh, f.titleEn)}</h3>
                <p className="text-[#7B89A8] text-sm">{t(f.descZh, f.descEn)}</p>
              </div>
            ))}
          </div>

          {/* Tech cards */}
          <div className="tech-grid grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { labelZh: 'YouTube 嵌入', labelEn: 'YouTube Embed', val: '✅' },
              { labelZh: 'B站 iframe', labelEn: 'Bilibili iframe', val: '✅' },
              { labelZh: 'WebVTT 字幕', labelEn: 'WebVTT captions', val: '✅' },
              { labelZh: '3D 知识节点', labelEn: '3D Knowledge Nodes', val: 'R3F' },
              { labelZh: '实时同步', labelEn: 'Real-time Sync', val: 'Hook' },
              { labelZh: '抖音/小红书', labelEn: 'Douyin/XHS', val: '🔗' },
            ].map((item, i) => (
              <div key={i} className="tech-card rounded-xl border border-white/[0.05] bg-white/[0.01] p-4 flex items-center justify-between">
                <span className="text-sm text-[#7B89A8]">{t(item.labelZh, item.labelEn)}</span>
                <span className="text-xs font-mono text-[#4B7BFF]">{item.val}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center mt-20">
            <button
              onClick={() => navigate('/')}
              className="group px-8 py-4 rounded-xl bg-gradient-to-r from-[#4B7BFF] to-[#7C5CFC] text-white font-display font-semibold hover:shadow-xl hover:shadow-[#4B7BFF]/20 transition-all duration-300"
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
