'use client'

import { useState } from 'react'
import { useGameStore, cardId, isNew, isDone } from '@/store/gameStore'
import { useTTS } from '@/lib/tts'
import type { Card } from '@/store/gameStore'

export default function WordList() {
  const srs = useGameStore(s => s.srs)
  const allCardsFn = useGameStore(s => s.allCards)
  const speak = useTTS()
  const [lessonFilter, setLessonFilter] = useState('')

  const allCards = allCardsFn()
  const filtered = lessonFilter
    ? allCards.filter(c => String(c.lesson) === lessonFilter)
    : allCards
  const lessonOptions = [...new Set(allCards.map(c => c.lesson).filter((l): l is number => typeof l === 'number'))].sort((a, b) => a - b)

  // group by lesson + category
  const groups: Record<string, Card[]> = {}
  filtered.forEach(c => {
    const k =
      (c.lesson === 'import' ? 'Миний үгс' : 'Хичээл ' + c.lesson) + ' — ' + c.category
    if (!groups[k]) groups[k] = []
    groups[k].push(c)
  })

  return (
    <div>
      <select
        className="cat"
        value={lessonFilter}
        onChange={e => setLessonFilter(e.target.value)}
        style={{ marginBottom: 10 }}
      >
        <option value="">Бүх хичээл</option>
        {lessonOptions.map(n => (
          <option key={n} value={String(n)}>Хичээл {n}</option>
        ))}
      </select>

      {!filtered.length && (
        <div className="grammar-empty">Үг олдсонгүй.</div>
      )}

      {Object.entries(groups).map(([lbl, list]) => (
        <div key={lbl}>
          <div className="section-label">{lbl}</div>
          {list.map((c, i) => {
            let badgeCls = 'badge-new', badgeTxt = 'Шинэ'
            if (isDone(srs, c)) { badgeCls = 'badge-done'; badgeTxt = 'Сурсан' }
            else if (!isNew(srs, c)) { badgeCls = 'badge-learning'; badgeTxt = 'Сурч буй' }
            return (
              <div key={i} className="word-row">
                <span className="wr-ko ko">{c.ko}</span>
                <span className="wr-mn">{c.mn}</span>
                <span className={`wr-badge ${badgeCls}`}>{badgeTxt}</span>
                <button className="wr-sp" onClick={() => speak(c.ko)}>🔊</button>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
