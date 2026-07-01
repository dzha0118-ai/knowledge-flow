import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type VideoPlatform = 'youtube' | 'bilibili' | 'douyin' | 'xiaohongshu' | 'unknown'
export type Lang = 'zh' | 'en'
export type ProcessStatus = 'idle' | 'detecting' | 'transcribing' | 'generating' | 'ready' | 'error'

export interface Caption {
  id: string
  startTime: number
  endTime: number
  zh: string
  en: string
}

export interface KnowledgeNode {
  id: string
  labelZh: string
  labelEn: string
  timestamp: number
  connectedTo: string[]
  detailZh?: string
  detailEn?: string
  category?: string
}

export interface QuizQuestion {
  id: string
  type: 'single' | 'multiple' | 'truefalse'
  questionZh: string
  questionEn: string
  optionsZh: string[]
  optionsEn: string[]
  correctAnswer: number[]
  explanationZh: string
  explanationEn: string
  difficulty: 'easy' | 'medium' | 'hard'
  timestamp: number
}

export interface CourseData {
  courseId: string
  titleZh: string
  titleEn: string
  descriptionZh: string
  descriptionEn: string
  videoPlatform: VideoPlatform
  videoUrl: string
  videoId: string
  captions: Caption[]
  knowledgeNodes: KnowledgeNode[]
  quizQuestions: QuizQuestion[]
  chapters: { id: string; titleZh: string; titleEn: string; startTime: number; endTime: number; detailZh?: string; detailEn?: string }[]
  summaryZh: string
  summaryEn: string
  article?: {
    articleTitle: string
    articleSections: { heading: string; body: string; iconEmoji: string }[]
    keyHighlights: string[]
    conclusion: string
  }
}

interface UserProgress {
  courseId: string
  videoCompleted: boolean
  videoCurrentTime: number
  quizScore: number
  quizCompleted: boolean
  unlockedLevels: string[]
}

interface AppState {
  lang: Lang
  videoUrl: string
  videoPlatform: VideoPlatform
  processStatus: ProcessStatus
  processMessage: string
  currentCourse: CourseData | null
  processedCourses: Record<string, CourseData>
  progress: Record<string, UserProgress>
  lastError: string
  abortController: AbortController | null

  setLang: (lang: Lang) => void
  toggleLang: () => void
  setVideoUrl: (url: string) => void
  detectPlatform: (url: string) => VideoPlatform
  processVideo: (url: string) => Promise<void>
  cancelProcess: () => void
  setCourseData: (data: CourseData) => void
  getPlatformEmbedUrl: (platform: VideoPlatform, videoId: string) => string

  setCurrentCourse: (id: string) => void
  updateVideoProgress: (courseId: string, time: number) => void
  completeVideo: (courseId: string) => void
  completeQuiz: (courseId: string, score: number) => void
  getProgress: (courseId: string) => UserProgress | undefined
  resetProgress: (courseId: string) => void
  resetToIdle: () => void
  clearAllCache: () => void
  clearCacheRemote: () => Promise<boolean>
}

export function detectPlatformFromUrl(url: string): VideoPlatform {
  if (/youtube\.com|youtu\.be/i.test(url)) return 'youtube'
  if (/bilibili\.com|b23\.tv/i.test(url)) return 'bilibili'
  if (/douyin\.com|iesdouyin\.com|v\.douyin\.com/i.test(url)) return 'douyin'
  if (/xiaohongshu\.com|xhslink\.com/i.test(url)) return 'xiaohongshu'
  return 'unknown'
}

export function extractVideoId(url: string, platform: VideoPlatform): string {
  if (platform === 'youtube') {
    const m = url.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/)
    return m?.[1] || url
  }
  if (platform === 'bilibili') {
    const m = url.match(/(?:BV|bv)([a-zA-Z0-9]{10})/)
    return m ? `BV${m[1]}` : url.split('/').pop() || url
  }
  if (platform === 'douyin') {
    const m = url.match(/(?:video\/|modal_id=)(\d+)/)
    return m?.[1] || url.split('/').pop() || url
  }
  if (platform === 'xiaohongshu') {
    const m = url.match(/(?:explore\/|discovery\/item\/)([a-zA-Z0-9]+)/)
    return m?.[1] || url.split('/').pop() || url
  }
  return url
}

export function getPlatformEmbedUrl(platform: VideoPlatform, videoId: string): string {
  switch (platform) {
    case 'youtube':
      return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`
    case 'bilibili':
      if (videoId.startsWith('BV')) {
        return `//player.bilibili.com/player.html?bvid=${videoId}&page=1&high_quality=1&danmaku=0`
      }
      return `//player.bilibili.com/player.html?aid=${videoId}&page=1&high_quality=1&danmaku=0`
    case 'douyin':
    case 'xiaohongshu':
      return ''
    default:
      return ''
  }
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      lang: 'zh',
      videoUrl: '',
      videoPlatform: 'unknown',
      processStatus: 'idle',
      processMessage: '',
      currentCourse: null,
      processedCourses: {},
      progress: {},
      lastError: '',
      abortController: null,

      setLang: (lang) => set({ lang }),
      toggleLang: () => set((s) => ({ lang: s.lang === 'zh' ? 'en' : 'zh' })),

      setVideoUrl: (url) => {
        const platform = detectPlatformFromUrl(url)
        set({ videoUrl: url, videoPlatform: platform })
      },

      detectPlatform: detectPlatformFromUrl,

      processVideo: async (url: string) => {
        // Abort any previous request
        const prev = get().abortController
        if (prev) { try { prev.abort() } catch {} }
        const ac = new AbortController()
        set({ abortController: ac })

        const platform = detectPlatformFromUrl(url)
        const lang = get().lang
        set({
          videoUrl: url,
          videoPlatform: platform,
          processStatus: 'detecting',
          processMessage: lang === 'zh' ? '正在识别视频平台...' : 'Detecting platform...',
          lastError: '',
          currentCourse: null,
        })

        await new Promise((r) => setTimeout(r, 400))
        if (ac.signal.aborted) return

        set({ processStatus: 'transcribing', processMessage: lang === 'zh' ? '正在提取内容...' : 'Extracting content...' })

        // Ping health endpoint first to wake up cold-starting Space
        try {
          await fetch(`${window.location.origin}/api/health`, { signal: AbortSignal.timeout(5000) })
        } catch { /* ignore */ }

        let resp: Response | null = null
        let fetchErr: string | null = null

        // Try up to 2 times to handle cold start
        for (let attempt = 0; attempt < 2; attempt++) {
          if (ac.signal.aborted) return
          try {
            resp = await fetch(`${window.location.origin}/api/process-video`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ url, lang }),
              signal: ac.signal,
            })
            fetchErr = null
            break
          } catch (e: any) {
            fetchErr = e?.name || 'fetch_failed'
            if (ac.signal.aborted) return
            // Wait 3s before retry if first attempt failed
            if (attempt === 0) await new Promise((r) => setTimeout(r, 3000))
          }
        }

        if (fetchErr || !resp) {
          set({
            processStatus: 'error',
            processMessage: lang === 'zh' ? '后端服务未就绪或超时，请确保 API Key 已配置后重试' : 'Backend timeout - check API Key and retry',
            lastError: fetchErr || 'fetch_failed',
          })
          return
        }

        if (!resp.ok) {
          const errBody = await resp.json().catch(() => ({}))
          const detail = errBody.detail || errBody.message || ''
          set({
            processStatus: 'error',
            processMessage: lang === 'zh'
              ? `后端返回错误 (${resp.status})${detail ? ': ' + detail : ''}`
              : `Backend error (${resp.status})${detail ? ': ' + detail : ''}`,
            lastError: `http_${resp.status}`,
          })
          return
        }

        set({ processStatus: 'generating', processMessage: lang === 'zh' ? 'AI 正在深度分析并生成题目...' : 'AI generating deep analysis...' })

        const result = await resp.json()

        const isAi = result.source === 'deepseek' || result.source === 'openai'

        if (isAi) {
          const quiz = result.quizQuestions
          if (!quiz || quiz.length === 0) {
            set({
              processStatus: 'error',
              processMessage: lang === 'zh' ? 'AI 已连接但未生成题目，请重试' : 'AI connected but returned no questions. Please retry.',
              lastError: 'ai_empty_quiz',
            })
            return
          }
          set({ processStatus: 'ready', processMessage: lang === 'zh' ? 'AI 分析完成！' : 'AI analysis done!' })
          set((s) => ({
            currentCourse: result,
            processedCourses: { ...s.processedCourses, [result.courseId]: result },
          }))
          return
        }

        const msg = result.message || result.ai_error || (lang === 'zh' ? 'AI 分析失败，请确认链接正确后重试' : 'AI analysis failed, please verify the link and try again.')
        set({
          processStatus: 'error',
          processMessage: msg,
          lastError: result.source || 'fallback',
          currentCourse: null,
        })
      },

      cancelProcess: () => {
        const ac = get().abortController
        if (ac) { try { ac.abort() } catch {} }
        const lang = get().lang
        set({
          processStatus: 'idle',
          processMessage: lang === 'zh' ? '已取消' : 'Cancelled',
          abortController: null,
        })
      },

      setCourseData: (data) => {
        set((s) => ({
          currentCourse: data,
          processedCourses: { ...s.processedCourses, [data.courseId]: data },
          processStatus: 'ready',
        }))
      },

      getPlatformEmbedUrl,

      setCurrentCourse: (id) => {
        const course = get().processedCourses[id]
        if (course) set({ currentCourse: course })
      },

      updateVideoProgress: (courseId, time) => {
        set((s) => {
          const p = s.progress[courseId] || { courseId, videoCompleted: false, videoCurrentTime: 0, quizScore: 0, quizCompleted: false, unlockedLevels: [] }
          return { progress: { ...s.progress, [courseId]: { ...p, videoCurrentTime: time } } }
        })
      },

      completeVideo: (courseId) => {
        set((s) => {
          const p = s.progress[courseId] || { courseId, videoCompleted: false, videoCurrentTime: 0, quizScore: 0, quizCompleted: false, unlockedLevels: [] }
          return { progress: { ...s.progress, [courseId]: { ...p, videoCompleted: true } } }
        })
      },

      completeQuiz: (courseId, score) => {
        set((s) => {
          const p = s.progress[courseId] || { courseId, videoCompleted: true, videoCurrentTime: 0, quizScore: 0, quizCompleted: false, unlockedLevels: [] }
          return { progress: { ...s.progress, [courseId]: { ...p, quizCompleted: true, quizScore: score } } }
        })
      },

      getProgress: (courseId) => get().progress[courseId],

      resetProgress: (courseId) => {
        set((s) => ({
          progress: { ...s.progress, [courseId]: { courseId, videoCompleted: false, videoCurrentTime: 0, quizScore: 0, quizCompleted: false, unlockedLevels: [] } },
        }))
      },

      resetToIdle: () => set({
        videoUrl: '',
        videoPlatform: 'unknown',
        processStatus: 'idle',
        processMessage: '',
        currentCourse: null,
        lastError: '',
      }),

      clearAllCache: () => {
        try { localStorage.removeItem('knowledge-flow-storage') } catch {}
        set({
          videoUrl: '',
          videoPlatform: 'unknown',
          processStatus: 'idle',
          processMessage: '',
          currentCourse: null,
          processedCourses: {},
          progress: {},
          lastError: '',
        })
      },

      clearCacheRemote: async () => {
        try {
          const resp = await fetch(`${window.location.origin}/api/clear-cache`, { method: 'POST' })
          return resp.ok
        } catch { return false }
      },
    }),
    {
      name: 'knowledge-flow-storage',
      partialize: (state) => ({
        lang: state.lang,
        processedCourses: state.processedCourses,
        currentCourse: state.currentCourse,
        progress: state.progress,
      }),
    }
  )
)
