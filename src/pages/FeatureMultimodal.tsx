import { useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowLeft, Play, Subtitles, Network, Zap, Monitor } from 'lucide-react'
import PageTransition from '../components/ui/PageTransition'

gsap.registerPlugin(ScrollTrigger)

// motionsites.ai video — flowing light/particles
const BG_VIDEO = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260411_104032_69319010-2458-492b-b04d-b40a5dfa4482.mp4'

const highlights = [
  { icon: Play, title: '视频全屏播放', desc: '支持 YouTube / B站 / 抖音 / 小红书等多平台视频嵌入，自动提取内容。' },
  { icon: Subtitles, title: 'AI 互动字幕', desc: '实时同步字幕高亮显示，点击字幕即可跳转对应时间点，精准定位关键内容。' },
  { icon: Network, title: '知识图谱可视化', desc: '3D 空间中展示知识点节点与连线关系，视频播放时节点实时高亮。' },
  { icon: Zap, title: '多维度同步', desc: '视频进度、字幕位置、知识节点三层数据完全联动，沉浸式学习体验。' },
]

export default function FeatureMultimodal() {
  const navigate = useNavigate()
  const sectionRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero stagger
      gsap.from('.fm-hero-item', {
        y: 60, opacity: 0, duration: 1, stagger: 0.15, ease: 'power3.out',
      })

      // Cards staggered reveal on scroll
      if (cardsRef.current) {
        gsap.from('.fm-card', {
          scrollTrigger: {
            trigger: cardsRef.current,
            start: 'top 75%',
            toggleActions: 'play none none none',
          },
          y: 80, opacity: 0, duration: 0.9, stagger: 0.12, ease: 'power3.out',
        })
      }

      // Tech spec numbers count-up
      gsap.from('.fm-stat', {
        scrollTrigger: {
          trigger: '.fm-stats-row',
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
        y: 40, opacity: 0, duration: 0.8, stagger: 0.15, ease: 'back.out(1.4)',
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <PageTransition className="relative min-h-screen bg-[#070612]">
      {/* Video Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#070612] via-[#0b0724] to-[#0f1a3a]" />
        <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-30" style={{ pointerEvents: 'none' }}>
          <source src={BG_VIDEO} type="video/mp4" />
        </video>
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-[#070612] to-transparent" />
      </div>

      <div ref={sectionRef} className="relative z-10">
        {/* Hero */}
        <div ref={heroRef} className="min-h-[70vh] flex flex-col items-center justify-center px-6 pt-24">
          <button onClick={() => navigate('/#features')} className="fm-hero-item flex items-center gap-2 text-[#7B89A8] hover:text-white transition-colors mb-12 text-sm">
            <ArrowLeft size={14} /> 返回首页
          </button>
          <div className="fm-hero-item w-16 h-16 rounded-2xl bg-gradient-to-br from-[#4B7BFF] to-[#60A5FA] flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(75,123,255,0.3)]">
            <Play size={28} className="text-white" strokeWidth={1.8} />
          </div>
          <h1 className="fm-hero-item font-display font-bold text-4xl sm:text-5xl md:text-6xl text-white tracking-tight mb-6 text-center">
            多模态
            <span className="text-shimmer px-3">展示</span>
          </h1>
          <p className="fm-hero-item text-lg text-[#7B89A8] max-w-xl text-center leading-relaxed mb-12">
            视频 + 互动字幕 + 知识图谱，三重视角同步呈现，让知识的流动看得见。
          </p>

          {/* Stats */}
          <div className="fm-stats-row grid grid-cols-3 gap-8 sm:gap-16 mb-16">
            {[{ n: '3', l: '展示维度' }, { n: '4', l: '平台支持' }, { n: '∞', l: '知识节点' }].map((s, i) => (
              <div key={i} className="fm-stat text-center">
                <div className="text-3xl sm:text-4xl font-display font-bold text-white mb-1">{s.n}</div>
                <div className="text-xs text-[#5A6A88] font-medium">{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Feature Cards */}
        <div ref={cardsRef} className="max-w-6xl mx-auto px-6 pb-32 grid grid-cols-1 md:grid-cols-2 gap-6">
          {highlights.map((h, i) => (
            <div key={i} className="fm-card rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl p-8 group hover:border-[#4B7BFF]/20 transition-all duration-300">
              <div className="w-10 h-10 rounded-xl bg-[#4B7BFF]/10 flex items-center justify-center mb-5 group-hover:bg-[#4B7BFF]/20 transition-colors">
                <h.icon size={20} className="text-[#4B7BFF]" strokeWidth={1.5} />
              </div>
              <h3 className="font-display font-semibold text-white text-lg mb-2">{h.title}</h3>
              <p className="text-[#7B89A8] text-sm leading-relaxed">{h.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </PageTransition>
  )
}
