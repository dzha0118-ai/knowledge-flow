import { motion } from 'framer-motion'

interface Props {
  current: number
  total: number
  label?: string
}

export default function ProgressBar({ current, total, label }: Props) {
  const percentage = total > 0 ? (current / total) * 100 : 0

  return (
    <div className="w-full">
      {(label || true) && (
        <div className="flex justify-between items-center mb-2">
          {label && <span className="text-xs text-gray-400 font-medium">{label}</span>}
          <span className="text-xs text-gray-500">{current}/{total}</span>
        </div>
      )}
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="h-full rounded-full bg-gradient-to-r from-cosmic-accent to-cosmic-purple"
        />
      </div>
    </div>
  )
}
