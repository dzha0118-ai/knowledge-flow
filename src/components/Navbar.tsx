import { Link, useLocation, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useAppStore } from '../store/useAppStore'

export default function Navbar() {
  const location = useLocation()
  const params = useParams()
  const { lang, toggleLang, currentCourse, processedCourses, resetToIdle } = useAppStore()
  const [scrolled, setScrolled] = useState(false)

  const courseId =
    params.courseId
    || Object.keys(processedCourses)[0]
    || currentCourse?.courseId

  const isSubPage = location.pathname !== '/'
  const isStagePage = location.pathname.includes('-stage')
  const shouldShowFull = isSubPage && !isStagePage

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleHomeClick = () => {
    resetToIdle()
  }

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      style={{
        background: isStagePage
          ? 'rgba(7,6,18,0.9)'
          : scrolled
          ? 'rgba(10,10,26,0.85)'
          : 'transparent',
        backdropFilter: isStagePage ? 'blur(16px)' : scrolled ? 'blur(16px)' : 'none',
        WebkitBackdropFilter: isStagePage ? 'blur(16px)' : scrolled ? 'blur(16px)' : 'none',
        borderBottom: isStagePage
          ? '1px solid rgba(255,255,255,0.06)'
          : scrolled
          ? '1px solid rgba(255,255,255,0.06)'
          : '1px solid transparent',
      }}
    >
      <div className={`max-w-6xl mx-auto flex items-center justify-between px-4 sm:px-6 ${isStagePage ? 'py-2' : 'py-3'}`}>
        <Link to="/" onClick={handleHomeClick} className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cosmic-accent to-cosmic-purple flex items-center justify-center shadow-lg shadow-cosmic-accent/20 group-hover:shadow-cosmic-accent/40 transition-shadow duration-300">
            <span className="text-white font-bold text-sm">K</span>
          </div>
          <span className="font-display font-semibold text-white text-lg hidden sm:block transition-opacity duration-300">
            <span className="gradient-text">Knowledge</span>
            <span className="text-gray-400">Flow</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          {shouldShowFull && courseId && (
            <div className="hidden sm:flex items-center gap-1 bg-white/5 backdrop-blur-xl rounded-full p-1 border border-white/5">
              {[
                { to: `/display/${courseId}`, labelZh: '展示', labelEn: 'Display' },
                { to: `/challenge/${courseId}`, labelZh: '闯关', labelEn: 'Challenge' },
                { to: `/review/${courseId}`, labelZh: '回顾', labelEn: 'Review' },
              ].map((link) => {
                const pathStart = link.to.split('/')[1]
                const isActive = location.pathname.startsWith('/' + pathStart)
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`relative px-4 py-1.5 text-xs font-medium rounded-full transition-all duration-300 ${
                      isActive ? 'text-white' : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="nav-pill"
                        className="absolute inset-0 rounded-full bg-cosmic-accent/25 border border-cosmic-accent/30 shadow-lg shadow-cosmic-accent/10"
                        transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                      />
                    )}
                    <span className="relative z-10">{lang === 'zh' ? link.labelZh : link.labelEn}</span>
                  </Link>
                )
              })}
            </div>
          )}

          <Link
            to="/"
            onClick={handleHomeClick}
            className={`hidden sm:flex w-8 h-8 items-center justify-center rounded-full text-xs transition-all duration-300 ${
              location.pathname === '/'
                ? 'bg-cosmic-accent/20 text-white border border-cosmic-accent/30'
                : 'glass-card text-gray-400 hover:text-white hover:border-white/20'
            }`}
            title={lang === 'zh' ? '返回首页' : 'Home'}
          >
            ⌂
          </Link>

          <button
            onClick={toggleLang}
            className="w-9 h-9 rounded-full glass-card flex items-center justify-center text-xs font-medium text-gray-300 hover:text-white hover:border-white/20 transition-all hover:scale-105 active:scale-95"
            title={lang === 'zh' ? 'Switch to English' : '切换中文'}
          >
            {lang === 'zh' ? 'EN' : '中'}
          </button>
        </div>
      </div>
    </motion.nav>
  )
}
