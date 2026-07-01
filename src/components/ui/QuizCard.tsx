import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { useAppStore } from '../../store/useAppStore'
import type { QuizQuestion } from '../../store/useAppStore'

interface Props {
  question: QuizQuestion
  onAnswer: (answerIndex: number[]) => void
  questionIndex: number
  totalQuestions: number
}

export default function QuizCard({ question, onAnswer, questionIndex, totalQuestions }: Props) {
  const lang = useAppStore((s) => s.lang)
  const [selected, setSelected] = useState<number[]>([])
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)

  const t = (zh: string, en: string) => (lang === 'zh' ? zh : en)

  const handleSelect = (idx: number) => {
    if (isCorrect !== null) return
    if (question.type === 'single' || question.type === 'truefalse') {
      setSelected([idx])
    } else {
      setSelected((prev) =>
        prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
      )
    }
  }

  const handleSubmit = () => {
    if (selected.length === 0) return
    const correct =
      selected.length === question.correctAnswer.length &&
      selected.every((s) => question.correctAnswer.includes(s))
    setIsCorrect(correct)
    setShowExplanation(true)
    setTimeout(() => {
      onAnswer(selected)
      setSelected([])
      setIsCorrect(null)
      setShowExplanation(false)
    }, correct ? 1800 : 2500)
  }

  const difficultyLabel = { easy: t('简单', 'Easy'), medium: t('中等', 'Medium'), hard: t('困难', 'Hard') }
  const difficultyColor = {
    easy: 'text-emerald-400',
    medium: 'text-amber-400',
    hard: 'text-rose-400',
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={question.id}
        initial={{ opacity: 0, x: 60, rotateY: 10 }}
        animate={{ opacity: 1, x: 0, rotateY: 0 }}
        exit={{ opacity: 0, x: -60, rotateY: -10 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-xl mx-auto"
      >
        <div className="glass-card p-4 sm:p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cosmic-accent via-cosmic-purple to-cosmic-gold" />

          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <span className="text-[10px] sm:text-xs font-medium text-gray-400 uppercase tracking-wider">
              {t(`第 ${questionIndex + 1} / ${totalQuestions} 题`, `Question ${questionIndex + 1} / ${totalQuestions}`)}
            </span>
            <span className={`text-[10px] sm:text-xs font-medium ${difficultyColor[question.difficulty]}`}>
              {difficultyLabel[question.difficulty]}
            </span>
          </div>

          <h3 className="text-base sm:text-xl font-display font-semibold text-white mb-6 sm:mb-8 leading-relaxed">
            {t(question.questionZh, question.questionEn)}
          </h3>

          <div className="space-y-2 sm:space-y-3">
            {question.optionsZh.map((_, idx) => {
              const isSelected = selected.includes(idx)
              let optionStyle = 'border-white/10 hover:border-cosmic-accent/50 hover:bg-white/5'

              if (isCorrect !== null) {
                if (question.correctAnswer.includes(idx)) {
                  optionStyle = 'border-emerald-500/50 bg-emerald-500/10'
                } else if (isSelected && !question.correctAnswer.includes(idx)) {
                  optionStyle = 'border-rose-500/50 bg-rose-500/10'
                }
              } else if (isSelected) {
                optionStyle = 'border-cosmic-accent bg-cosmic-accent/10'
              }

              return (
                <motion.button
                  key={idx}
                  whileTap={isCorrect === null ? { scale: 0.97 } : {}}
                  onClick={() => handleSelect(idx)}
                  disabled={isCorrect !== null}
                  className={`w-full text-left p-3 sm:p-4 rounded-xl border transition-all duration-200 ${optionStyle}`}
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span
                      className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center text-[10px] sm:text-xs font-medium border transition-colors ${
                        isSelected
                          ? 'bg-cosmic-accent border-cosmic-accent text-white'
                          : 'border-white/20 text-gray-400'
                      }`}
                    >
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="text-gray-200 text-xs sm:text-sm">
                      {t(question.optionsZh[idx], question.optionsEn[idx])}
                    </span>
                  </div>
                </motion.button>
              )
            })}
          </div>

          {isCorrect === null && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: selected.length > 0 ? 1 : 0 }}
              onClick={handleSubmit}
              disabled={selected.length === 0}
              className="mt-6 w-full py-3.5 sm:py-3 rounded-xl font-display font-semibold text-sm bg-gradient-to-r from-cosmic-accent to-cosmic-purple text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:shadow-lg hover:shadow-cosmic-accent/25"
            >
              {t('确认答案', 'Submit Answer')}
            </motion.button>
          )}

          <AnimatePresence>
            {showExplanation && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 overflow-hidden"
              >
                <div
                  className={`p-3 sm:p-4 rounded-xl text-xs sm:text-sm ${
                    isCorrect
                      ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
                  }`}
                >
                  <p className="font-semibold mb-1">
                    {isCorrect ? t('✓ 回答正确！', '✓ Correct!') : t('✗ 回答错误', '✗ Incorrect')}
                  </p>
                  <p className="text-gray-300">{t(question.explanationZh, question.explanationEn)}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
