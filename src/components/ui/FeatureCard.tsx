import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'

interface Props {
  icon: LucideIcon
  title: string
  description: string
  gradient: string
  onClick?: () => void
  delay?: number
}

export default function FeatureCard({ icon: Icon, title, description, gradient, onClick, delay = 0 }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.3, ease: 'easeOut' } }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="group relative cursor-pointer"
    >
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"
        style={{ background: `linear-gradient(135deg, ${gradient})` }}
      />
      <div className="relative h-full rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl p-8 transition-all duration-300 group-hover:border-white/[0.12]">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110"
          style={{ background: `linear-gradient(135deg, ${gradient})` }}
        >
          <Icon size={22} strokeWidth={1.8} className="text-white" />
        </div>
        <h3 className="text-xl font-display font-semibold text-white mb-3 tracking-tight">{title}</h3>
        <p className="text-[#7B89A8] text-sm leading-relaxed">{description}</p>

        <div className="mt-6 flex items-center gap-1.5 text-sm font-medium text-[#4B7BFF] opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
          <span>了解更多</span>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </motion.div>
  )
}
