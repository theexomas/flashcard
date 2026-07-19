'use client'

import { useTTS } from '@/lib/tts'

interface ExStripProps {
  ex: string
}

export default function ExStrip({ ex }: ExStripProps) {
  const speak = useTTS()
  if (!ex) return null
  return (
    <div className="ex-strip">
      <span className="ex-ko ko">{ex}</span>
      <button onClick={() => speak(ex)}>🔊</button>
    </div>
  )
}
