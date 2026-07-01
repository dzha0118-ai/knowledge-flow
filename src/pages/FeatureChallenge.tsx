import { useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowLeft, Gamepad2, Target, Award, TrendingUp, CheckCircle2, Layers } from 'lucide-react'
import PageTransition from '../components/ui/PageTransition'

gsap.registerPlugin(ScrollTrigger)

// motionsites.ai video — cosmic/ripple effect
const BG_VIDEO = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260403_050628_c4e32401-fab4-4a27-b7a8-6e9291cd5959.mp4'

const steps = [
  { icon: Target, title: 'AI 出题', desc: '基于视频字幕和知识图谱自动生成结构化题目，覆盖单选、多选、判断三种题型。' },
  { icon: Layers, title: '难度分级', desc: '每道题标记简单/中等/困难三级难度，随学习进度递进，挑战与成就感并存。' },
  { icon: CheckCircle2, title: '即时反馈', desc: '作答后立即显示正确/错误状态，附带详细解析，错误知识点一目了然。' },
  { icon: Award, title: '通关解锁', desc: '达到 60% 正确率即可通关，解锁自由回顾模式，所有内容永久开放。' },
]

export default function FeatureChallenge() {
  const navigate = useNavigate()
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.fc-hero-item', {
        y: 60, opacity: 0, duration: 1, stagger: 0.15, ease: 'power3.out',
      })

      gsap.from('.fc-step', {
        scrollTrigger: { trigger: '.fc-steps', start: 'top 70%', toggleActions: 'play none none none' },
        y: 80, opacity: 0, duration: 0.8, stagger: 0.12, ease: 'power3.out',
      })

      // Progress bar fill
      gsap.from('.fc-bar-fill', {
        scrollTrigger: { trigger: '.fc-progress-section', start: 'top 80%', toggleActions: 'play none none none' },
        scaleX: 0, duration: 1.2, ease: 'power3.inOut', transformOrigin: 'left',
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <PageTransition className="relative min-h-screen bg-[#070612]">
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#070612] via-[#0f0928] to-[#150b30]" />
        <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-30" style={{ pointerEvents: 'none' }}>
          <source src={BG_VIDEO} type="video/mp4" />
        </video>
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-[#070612] to-transparent" />
      </div>

      <div ref={sectionRef} className="relative z-10">
        {/* Hero */}
        <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 pt-24">
          <button onClick={() => navigate('/#features')} className="fc-hero-item flex items-center gap-2 text-[#7B89A8] hover:text-white transition-colors mb-12 text-sm">
            <ArrowLeft size={14} /> 返回首页
          </button>
          <div className="fc-hero-item w-16 h-16 rounded-2xl bg-gradient-to-br from-[#A78BFA] to-[#818CF8] flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(167,139,250,0.3)]">
            <Gamepad2 size={28} className="text-white" strokeWidth={1.8} />
          </div>
          <h1 className="fc-hero-item font-display font-bold text-4xl sm:text-5xl md:text-6xl text-white tracking-tight mb-6 text-center">
            游戏化
            <span className="text-shimmer px-3">闯关</span>
          </h1>
          <p className="fc-hero-item text-lg text-[#7B89A8] max-w-xl text-center leading-relaxed mb-16">
            AI 生成结构化题目，三种题型、三级难度，即时反馈让知识真正被消化。
          </p>

          {/* Progress demo bar */}
          <div className="fc-progress-section w-full max-w-md mx-auto mb-16">
            <div className="flex justify-between text-xs text-[#5A6A88] mb-2">
              <span>答题进度</span><span>7 / 10</span>
            </div>
            <div className="h-2 bg-white/[0.04] rounded-full overflow-hidden">
              <div className="fc-bar-fill h-full rounded-full bg-gradient-to-r from-[#A78BFA] to-[#818CF8]" style={{ width: '70%' }} />
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="fc-steps max-w-6xl mx-auto px-6 pb-32 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, i) => (
            <div key={i} className="fc-step rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl p-6 text-center group hover:border-[#A78BFA]/20 transition-all duration-300">
              <div className="w-10 h-10 rounded-xl bg-[#A78BFA]/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-[#A78BFA]/20 transition-colors">
                <s.icon size={20} className="text-[#A78BFA]" strokeWidth={1.5} />
              </div>
              <h3 className="font-display font-semibold text-white mb-2">{s.title}</h3>
              <p className="text-[#7B89A8] text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </PageTransition>
  )
}
