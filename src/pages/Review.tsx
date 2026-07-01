import { useParams, useNavigate } from 'react-router-dom'
import { Canvas } from '@react-three/fiber'
import { motion } from 'framer-motion'
import { useRef, useLayoutEffect } from 'react'
import gsap from 'gsap'
import StarfieldBackground from '../components/three/StarfieldBackground'
import CrystalWall from '../components/three/CrystalWall'
import PageTransition from '../components/ui/PageTransition'
import { useAppStore } from '../store/useAppStore'

const VIDEO_BG = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260429_115139_0fc6bd3d-3631-4d26-ab9b-28293887dcc9.mp4'

export default function Review() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const { lang, currentCourse, processedCourses, progress } = useAppStore()
  const pageRef = useRef<HTMLDivElement>(null)

  const course = courseId ? processedCourses[courseId] || currentCourse : currentCourse
  const courseProgress = course ? progress[course.courseId] : undefined
  const quizScore = courseProgress?.quizScore || 0
  const quizCompleted = courseProgress?.quizCompleted || false
  const t = (zh: string, en: string) => (lang === 'zh' ? zh : en)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.review-title', { y: 30, opacity: 0, duration: 0.7, ease: 'power3.out' })
      gsap.from('.review-stat', { scale: 0.8, opacity: 0, duration: 0.5, stagger: 0.12, delay: 0.2, ease: 'back.out(1.4)' })
      gsap.from('.review-card', { y: 40, opacity: 0, duration: 0.6, stagger: 0.15, delay: 0.4, ease: 'power2.out' })
    }, pageRef)
    return () => ctx.revert()
  }, [course])

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">{t('未找到课程数据', 'No course data found')}</p>
      </div>
    )
  }

  const totalQuestions = course.quizQuestions.length
  const unlockedCount = quizCompleted ? totalQuestions + course.knowledgeNodes.length : Math.max(1, quizScore + course.knowledgeNodes.length)

  return (
    <PageTransition className="relative min-h-screen">
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[#070612]/90" />
        <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-25" style={{ pointerEvents: 'none' }}>
          <source src={VIDEO_BG} type="video/mp4" />
        </video>
      </div>
      <div className="fixed inset-0 z-[1] pointer-events-none">
        <Canvas camera={{ position: [0, 0, 14], fov: 50 }}>
          <ambientLight intensity={0.2} />
          <StarfieldBackground />
          <CrystalWall itemCount={totalQuestions + course.knowledgeNodes.length} unlockedCount={unlockedCount} />
        </Canvas>
      </div>

      <div ref={pageRef} className="relative z-20 pt-24 pb-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="review-title text-center mb-16">
            <h1 className="font-display font-bold text-4xl sm:text-5xl text-white mb-4">{t('自由回顾', 'Free Review')}</h1>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">{t('所有内容已解锁，随时回顾', 'All content unlocked, review anytime')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              { zh: '答题得分', en: 'Quiz Score', val: `${quizScore}/${totalQuestions}`, c: 'from-cosmic-accent' },
              { zh: '知识点', en: 'Knowledge Nodes', val: `${course.knowledgeNodes.length}`, c: 'from-cosmic-purple' },
              { zh: '状态', en: 'Status', val: quizCompleted ? t('已完成','Completed') : t('进行中','In Progress'), c: quizCompleted ? 'from-emerald-400' : 'from-amber-400' },
            ].map((s, i) => (
              <div key={i} className="review-stat glass-card p-6 text-center">
                <div className="text-3xl font-display font-bold text-white mb-1">{s.val}</div>
                <div className={`text-xs font-medium bg-gradient-to-r ${s.c} to-transparent bg-clip-text text-transparent`}>{t(s.zh, s.en)}</div>
              </div>
            ))}
          </div>

          <div className="review-card glass-card p-6 sm:p-8 mb-8">
            <h2 className="font-display font-semibold text-xl text-white mb-6">{t('📚 AI 生成内容摘要', '📚 AI-Generated Summary')}</h2>
            <p className="text-gray-300 leading-relaxed">{t(course.summaryZh, course.summaryEn)}</p>
          </div>

          <div className="review-card glass-card p-6 sm:p-8 mb-8">
            <h2 className="font-display font-semibold text-xl text-white mb-6">{t('📖 章节回顾', '📖 Chapter Review')}</h2>
            <div className="space-y-3">
              {course.chapters.map((ch, i) => (
                <div key={ch.id} onClick={() => navigate(`/display/${course.courseId}`)}
                  className="flex items-center gap-4 p-4 rounded-lg border border-white/5 hover:border-cosmic-accent/30 transition-all group cursor-pointer">
                  <div className="w-10 h-10 rounded-lg bg-cosmic-accent/10 flex items-center justify-center text-cosmic-accent font-medium text-sm group-hover:bg-cosmic-accent/20 transition-colors">{i + 1}</div>
                  <div className="flex-1">
                    <h4 className="text-white font-medium">{t(ch.titleZh, ch.titleEn)}</h4>
                    <p className="text-gray-500 text-xs">{Math.floor(ch.startTime / 60)}:{String(ch.startTime % 60).padStart(2, '0')} - {Math.floor(ch.endTime / 60)}:{String(ch.endTime % 60).padStart(2, '0')}</p>
                  </div>
                  <span className="text-gray-600 group-hover:text-cosmic-accent transition-colors">{t('播放 →', 'Play →')}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="review-card glass-card p-6 sm:p-8 mb-12">
            <h2 className="font-display font-semibold text-xl text-white mb-6">{t('🧠 AI 识别知识点', '🧠 AI-Identified Knowledge')}</h2>
            <div className="flex flex-wrap gap-3">
              {course.knowledgeNodes.map((node, i) => (
                <span key={node.id} className="px-4 py-2 rounded-full text-sm font-medium bg-cosmic-accent/10 border border-cosmic-accent/20 text-cosmic-accent hover:bg-cosmic-accent/20 transition-colors cursor-default">
                  {t(node.labelZh, node.labelEn)}
                </span>
              ))}
            </div>
          </div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="flex justify-center gap-4 mt-12">
            <button onClick={() => navigate(`/display/${course.courseId}`)} className="px-8 py-4 rounded-xl font-display font-semibold text-white bg-gradient-to-r from-cosmic-accent to-cosmic-purple hover:shadow-lg hover:shadow-cosmic-accent/30 transition-all duration-300 hover:scale-105">
              {t('返回展示页', 'Back to Display')}
            </button>
            <button onClick={() => navigate(`/challenge/${course.courseId}`)} className="px-8 py-4 rounded-xl font-display font-semibold text-gray-300 glass-card hover:border-white/20 transition-all duration-300">
              {t('重新挑战', 'Retry Challenge')}
            </button>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  )
}
