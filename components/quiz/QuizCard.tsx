'use client'

import type { Card } from '@/store/gameStore'
import { useTTS } from '@/lib/tts'

interface QuizCardProps {
  card: Card
  dir: 'ko2mn' | 'mn2ko'
  ix: number
  total: number
}

export default function QuizCard({ card, dir, ix, total }: QuizCardProps) {
  const speak = useTTS()
  const pct = (ix / total) * 100
  const term = dir === 'ko2mn' ? card.ko : card.mn
  const tag =
    (card.lesson === 'import' ? 'Миний үгс' : 'Хичээл ' + card.lesson) +
    ' · ' +
    card.category

  return (
    <>
      <div className="topbar">
        <div className="progress">
          <i style={{ width: pct + '%' }} />
        </div>
        <div className="counter">{ix + 1}/{total}</div>
      </div>
      <div className="qcard">
        {dir === 'ko2mn' && (
          <button className="speak" onClick={() => speak(card.ko)} title="Сонсох">
            🔊
          </button>
        )}
        <div className="tag">{tag}</div>
        <div className={`term${dir === 'mn2ko' ? ' mn-term' : ' ko'}`}>
          {term}
        </div>
      </div>
    </>
  )
}
