import { useState, useRef, useLayoutEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Canvas } from '@react-three/fiber'
import { motion, AnimatePresence } from 'framer-motion'
import gsap from 'gsap'
import StarfieldBackground from '../components/three/StarfieldBackground'
import OrbitSystem from '../components/three/OrbitSystem'
import QuizCard from '../components/ui/QuizCard'
import ProgressBar from '../components/ui/ProgressBar'
import PageTransition from '../components/ui/PageTransition'
import { useAppStore } from '../store/useAppStore'

const VIDEO_BG = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260411_104032_69319010-2458-492b-b04d-b40a5dfa4482.mp4'

export default function Challenge() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const {
    lang, currentCourse, processedCourses, completeQuiz,
  } = useAppStore()

  const course = courseId
    ? processedCourses[courseId] || currentCourse
    : currentCourse

  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [score, setScore] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const pageRef = useRef<HTMLDivElement>(null)

  const t = (zh: string, en: string) => (lang === 'zh' ? zh : en)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.quiz-header', { y: 20, opacity: 0, duration: 0.6, ease: 'power3.out' })
      gsap.from('.quiz-card-wrap', { scale: 0.92, opacity: 0, duration: 0.5, delay: 0.15, ease: 'back.out(1.4)' })
    }, pageRef)
    return () => ctx.revert()
  }, [currentQuestion])

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">{t('未找到课程数据', 'No course data found')}</p>
      </div>
    )
  }

  const handleAnswer = (answerIdx: number[]) => {
    const q = course.quizQuestions[currentQuestion]
    const isCorrect =
      answerIdx.length === q.correctAnswer.length &&
      answerIdx.every((a) => q.correctAnswer.includes(a))

    if (isCorrect) setScore((s) => s + 1)

    if (currentQuestion < course.quizQuestions.length - 1) {
      setTimeout(() => setCurrentQuestion((c) => c + 1), 500)
    } else {
      setTimeout(() => {
        const finalScore = isCorrect ? score + 1 : score
        completeQuiz(course.courseId, finalScore)
        setShowResult(true)
        if (finalScore >= course.quizQuestions.length * 0.6) setShowSuccess(true)
      }, 800)
    }
  }

  return (
    <PageTransition className="relative min-h-screen">
      {/* Video bg */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[#070612]/90" />
        <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-20" style={{ pointerEvents: 'none' }}>
          <source src={VIDEO_BG} type="video/mp4" />
        </video>
      </div>
      {/* R3F layer */}
      <div className="fixed inset-0 z-[1]">
        <Canvas camera={{ position: [0, 0, 10], fov: 55 }}>
          <ambientLight intensity={0.15} />
          <StarfieldBackground />
          <OrbitSystem
            progress={((currentQuestion + 1) / course.quizQuestions.length) * 100}
            totalLevels={course.quizQuestions.length}
            completedLevels={showResult ? Math.ceil(score) : currentQuestion}
            isSuccess={showSuccess}
          />
        </Canvas>
      </div>

      <div ref={pageRef} className="relative z-20 pt-24 pb-16 px-4 sm:px-6 min-h-screen flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          {!showResult ? (
            <motion.div key="quiz" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-2xl mx-auto space-y-8">
              <div className="quiz-header text-center">
                <h1 className="font-display font-bold text-3xl text-white mb-2 tracking-tight">
                  <span className="text-shimmer">{t(course.titleZh, course.titleEn)} · {t('闯关测试', 'Challenge')}</span>
                </h1>
                <div className="max-w-md mx-auto">
                  <ProgressBar current={currentQuestion + 1} total={course.quizQuestions.length} label={t('答题进度', 'Progress')} />
                </div>
              </div>
              <div className="quiz-card-wrap">
                <QuizCard
                  question={course.quizQuestions[currentQuestion]}
                  onAnswer={handleAnswer}
                  questionIndex={currentQuestion}
                  totalQuestions={course.quizQuestions.length}
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="text-center"
            >
              <AnimatePresence>
                {showSuccess && (
                  <motion.div
                    initial={{ scale: 0, rotate: -10 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    className="text-7xl mb-8"
                  >
                    🎉
                  </motion.div>
                )}
              </AnimatePresence>

              <h2 className="font-display font-bold text-4xl text-white mb-4">
                {showSuccess ? t('恭喜通关！', 'Congratulations!') : t('继续加油！', 'Keep Going!')}
              </h2>

              <div className="glass-card inline-block px-12 py-8 mb-8">
                <div className="text-6xl font-display font-bold gradient-text mb-2">
                  {score}/{course.quizQuestions.length}
                </div>
                <div className="text-gray-400 text-sm">
                  {showSuccess
                    ? t('表现优秀，知识掌握得很好！', 'Excellent, you have mastered the knowledge!')
                    : t('建议回顾视频后再来挑战', 'Review the video and try again')}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate(`/review/${course.courseId}`)}
                  className="px-8 py-4 rounded-xl font-display font-semibold text-white bg-gradient-to-r from-cosmic-accent to-cosmic-purple hover:shadow-lg hover:shadow-cosmic-accent/30 transition-all duration-300 hover:scale-105"
                >
                  {t('进入回顾模式', 'Enter Review Mode')}
                </button>
                {!showSuccess && (
                  <button
                    onClick={() => { setCurrentQuestion(0); setScore(0); setShowResult(false); setShowSuccess(false) }}
                    className="px-8 py-4 rounded-xl font-display font-semibold text-gray-300 glass-card hover:border-white/20 transition-all duration-300"
                  >
                    {t('重新挑战', 'Retry')}
                  </button>
                )}
                <button
                  onClick={() => navigate(`/display/${course.courseId}`)}
                  className="px-8 py-4 rounded-xl font-display font-semibold text-gray-400 hover:text-white transition-colors"
                >
                  {t('返回展示页', 'Back to Display')}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  )
}
