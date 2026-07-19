'use client'

import { useGameStore, cardId } from '@/store/gameStore'
import { BUILTIN } from '@/lib/data'
import { useTTS } from '@/lib/tts'

export default function ErrorList() {
  const srs = useGameStore(s => s.srs)
  const customCards = useGameStore(s => s.customCards)
  const speak = useTTS()

  const allCards = [...BUILTIN, ...customCards]
  const withLap = allCards.filter(c => {
    const s = srs[cardId(c)]
    return s && s.lapses > 0
  })
  withLap.sort((a, b) => (srs[cardId(b)]?.lapses ?? 0) - (srs[cardId(a)]?.lapses ?? 0))
  const top = withLap.slice(0, 20)

  if (!top.length) {
    return <div className="grammar-empty">Алдаа байхгүй байна — сайн байна! 🎉</div>
  }

  return (
    <div>
      {top.map((c, i) => (
        <div key={i} className="word-row">
          <span className="wr-ko ko">{c.ko}</span>
          <span className="wr-mn">{c.mn}</span>
          <span className="wr-lap">{srs[cardId(c)]?.lapses ?? 0}×</span>
          <button className="wr-sp" onClick={() => speak(c.ko)}>🔊</button>
        </div>
      ))}
    </div>
  )
}
