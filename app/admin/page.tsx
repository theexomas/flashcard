'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useGameStore, ADMIN_EMAIL } from '@/store/gameStore'
import AuthModal from '@/components/AuthModal'
import CardsAdmin from '@/components/admin/CardsAdmin'
import GrammarAdmin from '@/components/admin/GrammarAdmin'
import Toast from '@/components/Toast'

export default function AdminPage() {
  const router = useRouter()
  const sbUser = useGameStore(s => s.sbUser)
  const [tab, setTab] = useState<'cards' | 'grammar'>('cards')
  const [authOpen, setAuthOpen] = useState(false)

  useEffect(() => {
    if (sbUser && sbUser.email !== ADMIN_EMAIL) {
      router.replace('/')
    }
  }, [sbUser, router])

  if (!sbUser) {
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
        <p className="sub" style={{ marginTop: 20 }}>Админ панель ашиглахын тулд нэвтэрнэ үү.</p>
        <button className="big-btn primary" onClick={() => setAuthOpen(true)}>Нэвтрэх</button>
        <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
      </div>
    )
  }

  if (sbUser.email !== ADMIN_EMAIL) return null

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

      <h3>Админ панель</h3>

      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        <button
          className={`chip${tab === 'cards' ? ' on' : ''}`}
          style={{ flex: 1, borderRadius: 10, textAlign: 'center' }}
          onClick={() => setTab('cards')}
        >
          Карт
        </button>
        <button
          className={`chip${tab === 'grammar' ? ' on' : ''}`}
          style={{ flex: 1, borderRadius: 10, textAlign: 'center' }}
          onClick={() => setTab('grammar')}
        >
          Дүрэм
        </button>
      </div>

      {tab === 'cards' && <CardsAdmin />}
      {tab === 'grammar' && <GrammarAdmin />}
      <Toast />
    </div>
  )
}
