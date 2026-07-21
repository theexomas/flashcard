'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useGameStore } from '@/store/gameStore'
import GrammarCard from '@/components/grammar/GrammarCard'
import ImportModal from '@/components/ImportModal'
import Toast from '@/components/Toast'
import type { GrammarRule } from '@/store/gameStore'

export default function GrammarPage() {
  const router = useRouter()
  const grammarCards = useGameStore(s => s.grammarCards)
  const dbGrammar = useGameStore(s => s.dbGrammar)
  const [importOpen, setImportOpen] = useState(false)

  const allGrammar = [...dbGrammar, ...grammarCards]

  // group by lesson
  const byLesson: Record<string, GrammarRule[]> = {}
  allGrammar.forEach(g => {
    const k = 'Хичээл ' + g.lesson
    if (!byLesson[k]) byLesson[k] = []
    byLesson[k].push(g)
  })

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
        <div style={{ flex: 1, textAlign: 'right', fontSize: 13, color: 'var(--muted)' }}>
          {allGrammar.length} дүрэм
        </div>
      </div>

      <div className="g-import-hint">
        Шинэ хичээлийн дүрэм нэмэхдээ: <code>📥</code> товч → <strong>Дүрэм JSON</strong> таб → JSON файлаа буулгаж Import хий.
      </div>

      {!allGrammar.length ? (
        <div className="grammar-empty">Дүрэм байхгүй байна.</div>
      ) : (
        Object.entries(byLesson).map(([lbl, rules]) => (
          <div key={lbl}>
            <div className="section-label">{lbl}</div>
            {rules.map((rule, i) => (
              <GrammarCard key={i} rule={rule} />
            ))}
          </div>
        ))
      )}

      <ImportModal open={importOpen} onClose={() => setImportOpen(false)} />
      <Toast />
    </div>
  )
}
