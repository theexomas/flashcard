'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useGameStore, useCardStats } from '@/store/gameStore'
import { BUILTIN } from '@/lib/data'
import Header from '@/components/Header'
import Toast from '@/components/Toast'
import ImportModal from '@/components/ImportModal'
import AuthModal from '@/components/AuthModal'
import DueHero from '@/components/home/DueHero'
import StatBadges from '@/components/home/StatBadges'
import DirToggle from '@/components/home/DirToggle'
import ModeToggle from '@/components/home/ModeToggle'
import LessonChips from '@/components/home/LessonChips'
import CatSelect from '@/components/home/CatSelect'

export default function HomePage() {
  const router = useRouter()
  const settings = useGameStore(s => s.settings)
  const customCards = useGameStore(s => s.customCards)
  const updateSettings = useGameStore(s => s.updateSettings)
  const startSession = useGameStore(s => s.startSession)
  const setToast = useGameStore(s => s.setToast)
  const { nNew, nLearn, nDone, nDue, total } = useCardStats()

  const [importOpen, setImportOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)

  const allCards = [...BUILTIN, ...customCards]
  const lessonFiltered = allCards.filter(c => settings.lessons.includes(c.lesson))
  const cats = [...new Set(lessonFiltered.map(c => c.category))]

  const learned = total > 0 ? (total - nDue) / total : 0

  const handleReview = () => {
    const err = startSession('review')
    if (err) { setToast(err); return }
    router.push('/quiz')
  }

  const handlePractice = () => {
    const err = startSession('practice')
    if (err) { setToast(err); return }
    router.push('/quiz')
  }

  return (
    <div className="wrap">
      <Header onImport={() => setImportOpen(true)} onAccount={() => setAuthOpen(true)} />

      <DueHero dueCount={nDue} totalCount={total} learnedFraction={learned} />
      <StatBadges nNew={nNew} nLearn={nLearn} nDone={nDone} />

      {settings.streak > 0 && (
        <div className="streak-chip">🔥 {settings.streak} хоног дараалан</div>
      )}

      <div className="section-label">Чиглэл</div>
      <DirToggle
        dir={settings.dir}
        onChange={dir => updateSettings({ dir })}
      />

      {settings.dir === 'mn2ko' && (
        <>
          <div className="section-label">Горим (Монгол→한국어)</div>
          <ModeToggle
            mode={settings.inputMode}
            onChange={inputMode => updateSettings({ inputMode })}
          />
        </>
      )}

      <div className="section-label">Хичээл</div>
      <LessonChips
        lessons={settings.lessons}
        hasCustom={customCards.length > 0}
        onChange={lessons => updateSettings({ lessons })}
      />

      <div className="section-label">Ангилал</div>
      <CatSelect
        categories={cats}
        value={settings.cat}
        onChange={cat => updateSettings({ cat })}
      />

      <button
        className="big-btn primary"
        disabled={nDue === 0}
        onClick={handleReview}
      >
        {nDue > 0 ? `Давталт эхлүүлэх (${Math.min(nDue, 20)} карт)` : 'Давталт дууссан'}
      </button>
      <button className="big-btn ghost" onClick={handlePractice}>
        Чөлөөт дасгал (SRS-гүй сонголтоос)
      </button>
      <button
        className="big-btn ghost"
        style={{ borderColor: 'rgba(76,141,255,.4)', color: '#8ab4ff' }}
        onClick={() => router.push('/grammar')}
      >
        📖 Дүрэм давтах
      </button>
      <button
        className="big-btn ghost"
        style={{ borderColor: 'rgba(61,214,140,.3)', color: 'var(--green)' }}
        onClick={() => router.push('/stats')}
      >
        📊 Статистик &amp; үгийн жагсаалт
      </button>
      <p className="hint">
        Давталт: SM-2 алгоритмаар зөв хариулсан үгийн интервал уртсаж, алдсан үг дахин ойртоно. Чөлөөт дасгал ч гэсэн давталтын хуваарьт тооцогдоно.
      </p>

      <ImportModal open={importOpen} onClose={() => setImportOpen(false)} />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
      <Toast />
    </div>
  )
}
