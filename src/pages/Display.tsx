import { useState, useRef, useEffect, useLayoutEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Canvas } from '@react-three/fiber'
import { motion } from 'framer-motion'
import gsap from 'gsap'
import { Play, FileText, Presentation, Layout, GitFork, ArrowRight } from 'lucide-react'
import StarfieldBackground from '../components/three/StarfieldBackground'
import KnowledgeNodes from '../components/three/KnowledgeNodes'
import PageTransition from '../components/ui/PageTransition'
import ArticleView from '../components/ArticleView'
import SlidesView from '../components/SlidesView'
import OverviewView from '../components/OverviewView'
import KnowledgeTree from '../components/KnowledgeTree'
import { useAppStore } from '../store/useAppStore'

const VIDEO_BG = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260429_115139_0fc6bd3d-3631-4d26-ab9b-28293887dcc9.mp4'

type ViewMode = 'video' | 'slides' | 'article' | 'overview' | 'tree'

const MODES: { key: ViewMode; icon: typeof Play; labelZh: string; labelEn: string; color: string }[] = [
  { key: 'overview', icon: Layout, labelZh: '总览', labelEn: 'Overview', color: '#10B981' },
  { key: 'tree', icon: GitFork, labelZh: '知识树', labelEn: 'Tree', color: '#EC4899' },
  { key: 'slides', icon: Presentation, labelZh: 'PPT', labelEn: 'Slides', color: '#A78BFA' },
  { key: 'video', icon: Play, labelZh: '视频', labelEn: 'Video', color: '#4B7BFF' },
  { key: 'article', icon: FileText, labelZh: '图文', labelEn: 'Article', color: '#F59E0B' },
]

export default function Display() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const { lang, currentCourse, processedCourses, setCurrentCourse, completeVideo, updateVideoProgress } = useAppStore()
  const pageRef = useRef<HTMLDivElement>(null)

  const course = courseId ? processedCourses[courseId] || currentCourse : currentCourse
  const [currentTime, setCurrentTime] = useState(0)
  const [activeCaptionIdx, setActiveCaptionIdx] = useState(0)
  const [viewMode, setViewMode] = useState<ViewMode>('overview')
  const timerRef = useRef<number | null>(null)
  const t = (zh: string, en: string) => (lang === 'zh' ? zh : en)

  useEffect(() => { if (courseId && processedCourses[courseId]) setCurrentCourse(courseId) }, [courseId])

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.display-header', { y: 30, opacity: 0, duration: 0.7, ease: 'power3.out', stagger: 0.1 })
      gsap.from('.video-panel', { scale: 0.95, opacity: 0, duration: 0.6, delay: 0.25, ease: 'power2.out' })
      gsap.from('.caption-item', { x: -20, opacity: 0, duration: 0.4, stagger: 0.03, delay: 0.4, ease: 'power2.out' })
      gsap.from('.chapter-btn', { y: 15, opacity: 0, duration: 0.4, stagger: 0.06, delay: 0.5, ease: 'back.out(1.2)' })
    }, pageRef)
    return () => ctx.revert()
  }, [course])

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <p className="text-gray-400 mb-4">{t('未找到课程数据', 'No course data found')}</p>
          <button onClick={() => navigate('/')} className="px-6 py-3 rounded-xl font-display font-semibold text-white bg-gradient-to-r from-cosmic-accent to-cosmic-purple">
            {t('返回首页', 'Back to Home')}
          </button>
        </motion.div>
      </div>
    )
  }

  const embedUrl = useAppStore.getState().getPlatformEmbedUrl(course.videoPlatform, course.videoId)
  const canEmbed = course.videoPlatform === 'youtube' || course.videoPlatform === 'bilibili'

  const startTimeTracking = () => {
    if (timerRef.current) return
    timerRef.current = window.setInterval(() => {
      setCurrentTime((prev) => {
        const next = Math.min(prev + 0.1, 480)
        updateVideoProgress(course.courseId, next)
        const sorted = [...course.captions].sort((a, b) => a.startTime - b.startTime)
        for (let i = sorted.length - 1; i >= 0; i--) { if (next >= sorted[i].startTime) { setActiveCaptionIdx(i); break } }
        return next
      })
    }, 100)
  }

  const handleComplete = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
    completeVideo(course.courseId)
    navigate(`/challenge/${course.courseId}`)
  }

  const pLabel = (p: string) => ({ youtube: 'YouTube', bilibili: 'B站', douyin: '抖音', xiaohongshu: '小红书' }[p] || p)
  const pColor = (p: string) => ({ youtube: '#FF0000', bilibili: '#FB7299', douyin: '#FE2C55', xiaohongshu: '#FF2442', unknown: '#666' }[p] || '#666')

  return (
    <PageTransition className="relative min-h-screen">
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[#070612]/90" />
        <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-25" style={{ pointerEvents: 'none' }}>
          <source src={VIDEO_BG} type="video/mp4" />
        </video>
      </div>
      <div className="fixed inset-0 z-[1] pointer-events-none">
        <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
          <ambientLight intensity={0.1} />
          <StarfieldBackground />
          <KnowledgeNodes nodes={course.knowledgeNodes} currentTime={currentTime} />
        </Canvas>
      </div>

      <div ref={pageRef} className="relative z-20 pt-24 pb-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="display-header mb-6">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium border" style={{ borderColor: pColor(course.videoPlatform), color: pColor(course.videoPlatform) }}>
                {pLabel(course.videoPlatform)}
              </span>
              <span className="text-xs text-gray-500">{t('由 AI 生成内容', 'AI-generated content')}</span>

              <div className="ml-auto flex items-center gap-0.5 p-0.5 rounded-lg border border-white/[0.08] bg-white/[0.03]">
                {MODES.map((m) => (
                  <button
                    key={m.key}
                    onClick={() => setViewMode(m.key)}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                      viewMode === m.key ? '' : 'text-gray-500 hover:text-gray-300'
                    }`}
                    style={viewMode === m.key ? { background: m.color + '20', color: m.color } : {}}
                  >
                    <m.icon size={12} />
                    <span className="hidden sm:inline">{t(m.labelZh, m.labelEn)}</span>
                  </button>
                ))}
              </div>
            </div>
            <h1 className="display-header font-display font-bold text-3xl sm:text-4xl text-white mb-2">
              <span className="text-shimmer">{t(course.titleZh, course.titleEn)}</span>
            </h1>
            <p className="display-header text-gray-400">{t(course.descriptionZh, course.descriptionEn)}</p>
          </div>

          {viewMode === 'overview' && <OverviewView course={course} />}
          {viewMode === 'tree' && (
            <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
              <KnowledgeTree course={course} />
              <div className="text-center mt-12 pb-8">
                <button onClick={handleComplete}
                  className="group inline-flex items-center gap-2 px-10 py-4 rounded-2xl font-display font-bold text-white text-lg bg-gradient-to-r from-cosmic-accent to-cosmic-purple hover:shadow-2xl hover:shadow-cosmic-accent/30 transition-all duration-300 hover:scale-[1.03]">
                  {t('完成学习，开始闯关 →', 'Finish & Start Challenge →')}
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          )}
          {viewMode === 'slides' && <SlidesView course={course} />}
          {viewMode === 'article' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <ArticleView course={course} />
              <div className="text-center mt-12 pb-8">
                <button onClick={handleComplete}
                  className="group inline-flex items-center gap-2 px-10 py-4 rounded-2xl font-display font-bold text-white text-lg bg-gradient-to-r from-cosmic-accent to-cosmic-purple hover:shadow-2xl hover:shadow-cosmic-accent/30 transition-all duration-300 hover:scale-[1.03]">
                  {t('完成学习，开始闯关 →', 'Finish & Start Challenge →')}
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          )}
          {viewMode === 'video' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="video-panel glass-card overflow-hidden">
                  {canEmbed && embedUrl ? (
                    <div className="aspect-video bg-black"><iframe className="w-full h-full" src={embedUrl} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /></div>
                  ) : (
                    <div className="aspect-video bg-black/40 flex flex-col items-center justify-center p-8 text-center">
                      <span className="text-4xl mb-4">{course.videoPlatform === 'douyin' ? '🎵' : '📕'}</span>
                      <h3 className="text-white font-display font-semibold text-lg mb-2">{t(`${pLabel(course.videoPlatform)} 暂不支持嵌入式播放`, `${pLabel(course.videoPlatform)} does not support embedded playback`)}</h3>
                      <a href={course.videoUrl} target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 rounded-xl font-medium text-sm bg-cosmic-accent/20 text-cosmic-accent hover:bg-cosmic-accent/30 transition-colors">{t('在原文中打开视频', 'Open video in new tab')} ↗</a>
                    </div>
                  )}
                </div>

                {canEmbed && (
                  <div className="flex items-center gap-4">
                    <button onClick={startTimeTracking} className="px-4 py-2 rounded-lg bg-cosmic-accent/10 border border-cosmic-accent/30 text-cosmic-accent text-sm font-medium hover:bg-cosmic-accent/20 transition-colors">
                      {t('模拟播放进度', 'Simulate Playback')}
                    </button>
                    <span className="text-xs text-gray-500">{t(`当前: ${Math.floor(currentTime)}s`, `Current: ${Math.floor(currentTime)}s`)}</span>
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {course.chapters.map((ch, i) => (
                    <button key={ch.id} onClick={() => setCurrentTime(ch.startTime)}
                      className={`chapter-btn p-3 rounded-lg border text-left transition-all text-xs ${currentTime >= ch.startTime && currentTime <= ch.endTime ? 'border-cosmic-accent bg-cosmic-accent/10 text-white' : currentTime > ch.endTime ? 'border-emerald-500/20 bg-emerald-500/5 text-gray-400' : 'border-white/5 bg-white/3 text-gray-500'}`}>
                      <div className="font-medium mb-0.5">{t(ch.titleZh, ch.titleEn)}</div>
                      <div className="text-gray-500">{Math.floor(ch.startTime / 60)}:{String(ch.startTime % 60).padStart(2, '0')}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-1 space-y-6">
                <div className="glass-card p-6">
                  <h3 className="font-display font-semibold text-white mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cosmic-accent animate-pulse" />{t('AI 字幕', 'AI Captions')}
                  </h3>
                  <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                    {course.captions.map((cap, i) => (
                      <div key={cap.id} onClick={() => canEmbed && setCurrentTime(cap.startTime)}
                        className={`caption-item p-3 rounded-lg transition-all duration-200 text-sm leading-relaxed ${canEmbed ? 'cursor-pointer' : ''} ${activeCaptionIdx === i ? 'bg-cosmic-accent/15 border border-cosmic-accent/30 text-white' : 'border border-transparent text-gray-500 hover:text-gray-300'}`}>
                        <span className="text-xs text-gray-500 block mb-1">{Math.floor(cap.startTime / 60)}:{String(cap.startTime % 60).padStart(2, '0')}</span>
                        {t(cap.zh, cap.en)}
                      </div>
                    ))}
                  </div>
                </div>
                <button onClick={handleComplete} className="w-full py-4 rounded-xl font-display font-semibold text-white bg-gradient-to-r from-cosmic-accent to-cosmic-purple hover:shadow-lg hover:shadow-cosmic-accent/30 transition-all duration-300 hover:scale-[1.02]">
                  {t('完成学习，开始闯关 →', 'Finish & Start Challenge →')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  )
}
