'use client'

interface OptionsProps {
  options: string[]
  correctAns: string
  answered: boolean
  wrongAns: string | null
  dir: 'ko2mn' | 'mn2ko'
  onAnswer: (opt: string) => void
}

export default function Options({
  options, correctAns, answered, wrongAns, dir, onAnswer,
}: OptionsProps) {
  return (
    <div className="opts">
      {options.map((opt, i) => {
        let cls = 'opt'
        if (dir === 'mn2ko') cls += ' ko'
        if (answered) {
          if (opt === correctAns) cls += ' correct'
          else if (opt === wrongAns) cls += ' wrong'
        }
        return (
          <button
            key={i}
            className={cls}
            disabled={answered}
            onClick={() => !answered && onAnswer(opt)}
          >
            {opt}
          </button>
        )
      })}
    </div>
  )
}
