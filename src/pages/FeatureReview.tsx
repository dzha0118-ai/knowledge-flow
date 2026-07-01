import { useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowLeft, Sparkles, BookOpen, Brain, RefreshCw, Unlock } from 'lucide-react'
import PageTransition from '../components/ui/PageTransition'

gsap.registerPlugin(ScrollTrigger)

const BG_VIDEO = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260324_151826_c7218672-6e92-402c-9e45-f1e0f454bdc4.mp4'

const perks = [
  { icon: BookOpen, title: '章节回顾', desc: '所有视频章节永久解锁，点击即跳转对应时间点，重复观看核心内容。' },
  { icon: Brain, title: '知识节点', desc: '已解锁的知识节点以标签云展示，点击查看详情，构建个人知识体系。' },
  { icon: RefreshCw, title: '重新挑战', desc: '随时重新发起闯关测试，检验复习效果，分数自动更新。' },
  { icon: Unlock, title: '全部解锁', desc: '通关后课程变为永久开放态，学习记录和进度自动保存。' },
]

export default function FeatureReview() {
  const navigate = useNavigate()
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.fr-hero-item', {
        y: 60, opacity: 0, duration: 1, stagger: 0.15, ease: 'power3.out',
      })

      gsap.from('.fr-perk', {
        scrollTrigger: { trigger: '.fr-perks', start: 'top 70%', toggleActions: 'play none none none' },
        y: 60, opacity: 0, duration: 0.7, stagger: 0.12, ease: 'power3.out',
      })

      // Glowing pulse on the lock icon
      gsap.to('.fr-lock-glow', {
        scrollTrigger: { trigger: '.fr-lock-glow', start: 'top 80%', toggleActions: 'play none none none' },
        scale: 1.15, opacity: 0.6, duration: 1.5, yoyo: true, repeat: -1, ease: 'sine.inOut',
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <PageTransition className="relative min-h-screen bg-[#070612]">
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#070612] via-[#0d0818] to-[#1a0e20]" />
        <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-30" style={{ pointerEvents: 'none' }}>
          <source src={BG_VIDEO} type="video/mp4" />
        </video>
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-[#070612] to-transparent" />
      </div>

      <div ref={sectionRef} className="relative z-10">
        {/* Hero */}
        <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 pt-24">
          <button onClick={() => navigate('/#features')} className="fr-hero-item flex items-center gap-2 text-[#7B89A8] hover:text-white transition-colors mb-12 text-sm">
            <ArrowLeft size={14} /> 返回首页
          </button>
          <div className="fr-hero-item w-16 h-16 rounded-2xl bg-gradient-to-br from-[#F59E0B] to-[#F97316] flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(245,158,11,0.3)] relative">
            <Sparkles size={28} className="text-white" strokeWidth={1.8} />
            <div className="fr-lock-glow absolute inset-0 rounded-2xl bg-[#F59E0B] opacity-20 blur-xl" />
          </div>
          <h1 className="fr-hero-item font-display font-bold text-4xl sm:text-5xl md:text-6xl text-white tracking-tight mb-6 text-center">
            自由
            <span className="text-shimmer px-3">回顾</span>
          </h1>
          <p className="fr-hero-item text-lg text-[#7B89A8] max-w-xl text-center leading-relaxed">
            闯关完成即永久解锁全部内容，随时回顾视频、笔记，或重新挑战刷新成绩。
          </p>
        </div>

        {/* Perks */}
        <div className="fr-perks max-w-6xl mx-auto px-6 pb-32 grid grid-cols-1 md:grid-cols-2 gap-6">
          {perks.map((p, i) => (
            <div key={i} className="fr-perk rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl p-8 flex gap-5 group hover:border-[#F59E0B]/20 transition-all duration-300">
              <div className="shrink-0 w-12 h-12 rounded-xl bg-[#F59E0B]/10 flex items-center justify-center group-hover:bg-[#F59E0B]/20 transition-colors">
                <p.icon size={22} className="text-[#F59E0B]" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="font-display font-semibold text-white text-lg mb-2">{p.title}</h3>
                <p className="text-[#7B89A8] text-sm leading-relaxed">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageTransition>
  )
}
