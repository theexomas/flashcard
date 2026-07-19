'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useGameStore } from '@/store/gameStore'
import { useTTS } from '@/lib/tts'
import Toast from '@/components/Toast'

export default function ResultsPage() {
  const router = useRouter()
  const session = useGameStore(s => s.session)
  const startSession = useGameStore(s => s.startSession)
  const setToast = useGameStore(s => s.setToast)
  const speak = useTTS()

  useEffect(() => {
    if (!session) router.replace('/')
  }, [session, router])

  if (!session) return null

  const { cards, correct, missed } = session
  const pct = Math.round((correct / cards.length) * 100)
  const pctColor = pct >= 80 ? 'var(--green)' : pct >= 50 ? 'var(--amber)' : 'var(--red)'
  const desc =
    `${cards.length} картаас ${correct}-г зөв. ` +
    (pct === 100 ? '대박! 🎉' : pct >= 80 ? 'Маш сайн!' : 'Алдсан үгс чинь удахгүй дахин гарна.')

  const handleAgain = () => {
    const err = startSession('review')
    if (err) { setToast(err); return }
    router.push('/quiz')
  }

  return (
    <div className="wrap">
      <div className="score-hero">
        <div className="pct" style={{ color: pctColor }}>{pct}%</div>
        <p>{desc}</p>
      </div>

      {missed.length > 0 && (
        <div className="missed">
          <div className="section-label">Алдсан үгс — маргааш дахин гарна</div>
          {missed.map((c, i) => (
            <div key={i} className="missed-item">
              <span className="k ko">{c.ko}</span>
              <span className="m">{c.mn}</span>
              <button onClick={() => speak(c.ko)}>🔊</button>
            </div>
          ))}
        </div>
      )}

      <button className="big-btn primary" onClick={handleAgain}>
        Дараагийн давталт
      </button>
      <button className="big-btn ghost" onClick={() => router.push('/')}>
        Нүүр хуудас
      </button>
      <Toast />
    </div>
  )
}
