'use client'

interface LessonChipsProps {
  lessons: (number | 'import')[]
  hasCustom: boolean
  onChange: (lessons: (number | 'import')[]) => void
}

const ALL_LESSONS: [number | 'import', string][] = [
  [1, 'Хичээл 1'],
  [2, 'Хичээл 2'],
  [3, 'Хичээл 3'],
]

export default function LessonChips({ lessons, hasCustom, onChange }: LessonChipsProps) {
  const available: [number | 'import', string][] = hasCustom
    ? [...ALL_LESSONS, ['import', 'Миний үгс']]
    : ALL_LESSONS

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
