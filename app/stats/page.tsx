'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ErrorList from '@/components/stats/ErrorList'
import WordList from '@/components/stats/WordList'
import Toast from '@/components/Toast'

type StatsTab = 'errors' | 'words'

export default function StatsPage() {
  const router = useRouter()
  const [tab, setTab] = useState<StatsTab>('errors')

  return (
    <div className="wrap">
      <div className="topbar">
        <button
          className="quit"
          style={{ margin: 0, width: 'auto', fontSize: 14, color: 'var(--text)' }}
          onClick={() => router.push('/')}
        >
          ← Буцах
        </button>
      </div>

      <div className="stats-tabs">
        <button
          className={`stats-tab${tab === 'errors' ? ' on' : ''}`}
          onClick={() => setTab('errors')}
        >
          🔴 Хамгийн их алдсан
        </button>
        <button
          className={`stats-tab${tab === 'words' ? ' on' : ''}`}
          onClick={() => setTab('words')}
        >
          📋 Үгийн жагсаалт
        </button>
      </div>

      {tab === 'errors' && <ErrorList />}
      {tab === 'words' && <WordList />}
      <Toast />
    </div>
  )
}
