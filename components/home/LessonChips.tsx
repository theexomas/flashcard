'use client'

interface LessonChipsProps {
  lessons: (number | 'import')[]
  hasCustom: boolean
  availableLessons: number[]
  onChange: (lessons: (number | 'import')[]) => void
}

export default function LessonChips({ lessons, hasCustom, availableLessons, onChange }: LessonChipsProps) {
  const lessonNums = [...new Set(availableLessons)].sort((a, b) => a - b)
  const available: [number | 'import', string][] = [
    ...lessonNums.map((n): [number, string] => [n, 'Хичээл ' + n]),
    ...(hasCustom ? ([['import', 'Миний үгс']] as [number | 'import', string][]) : []),
  ]

  const toggle = (v: number | 'import') => {
    const i = lessons.indexOf(v)
    if (i >= 0) {
      if (lessons.length > 1) {
        onChange(lessons.filter(l => l !== v))
      }
    } else {
      onChange([...lessons, v])
    }
  }

  return (
    <div className="chips">
      {available.map(([v, label]) => (
        <button
          key={String(v)}
          className={`chip${lessons.includes(v) ? ' on' : ''}`}
          onClick={() => toggle(v)}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
