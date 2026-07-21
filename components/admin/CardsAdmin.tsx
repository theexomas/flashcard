'use client'

import { useState, useMemo } from 'react'
import { useGameStore, type Card } from '@/store/gameStore'

const emptyForm: Card = { ko: '', mn: '', category: '', lesson: 1, ex: '' }

export default function CardsAdmin() {
  const dbCards = useGameStore(s => s.dbCards)
  const adminUpsertCard = useGameStore(s => s.adminUpsertCard)
  const adminDeleteCard = useGameStore(s => s.adminDeleteCard)
  const setToast = useGameStore(s => s.setToast)

  const [editId, setEditId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Card>(emptyForm)
  const [newForm, setNewForm] = useState<Card>(emptyForm)
  const [busy, setBusy] = useState(false)

  const stats = useMemo(() => {
    const byLesson: Record<string, number> = {}
    dbCards.forEach(c => {
      const k = String(c.lesson)
      byLesson[k] = (byLesson[k] || 0) + 1
    })
    return { total: dbCards.length, byLesson }
  }, [dbCards])

  const startEdit = (c: Card) => {
    setEditId(c.id ?? null)
    setEditForm(c)
  }

  const cancelEdit = () => {
    setEditId(null)
    setEditForm(emptyForm)
  }

  const saveEdit = async () => {
    setBusy(true)
    const { error } = await adminUpsertCard(editForm)
    setBusy(false)
    if (error) { setToast('Алдаа: ' + error); return }
    setToast('Хадгалагдлаа')
    cancelEdit()
  }

  const handleDelete = async (id?: string) => {
    if (!id) return
    setBusy(true)
    const { error } = await adminDeleteCard(id)
    setBusy(false)
    if (error) { setToast('Алдаа: ' + error); return }
    setToast('Устгагдлаа')
  }

  const handleAdd = async () => {
    if (!newForm.ko || !newForm.mn) { setToast('ko, mn талбар заавал'); return }
    setBusy(true)
    const { error } = await adminUpsertCard({ ...newForm, lesson: Number(newForm.lesson) })
    setBusy(false)
    if (error) { setToast('Алдаа: ' + error); return }
    setToast('Нэмэгдлээ')
    setNewForm(emptyForm)
  }

  return (
    <div>
      <div className="sub" style={{ marginBottom: 12 }}>
        Нийт {stats.total} карт
        {Object.entries(stats.byLesson)
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([lesson, n]) => ` · Х${lesson}: ${n}`)}
      </div>

      <div className="preview" style={{ maxHeight: 480 }}>
        {dbCards.map((c, i) => {
          const isEditing = editId === c.id && c.id
          return isEditing ? (
            <div key={c.id ?? i} className="row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 6 }}>
              <input className="auth-field" value={editForm.ko} onChange={e => setEditForm({ ...editForm, ko: e.target.value })} placeholder="ko" />
              <input className="auth-field" value={editForm.mn} onChange={e => setEditForm({ ...editForm, mn: e.target.value })} placeholder="mn" />
              <input className="auth-field" value={editForm.category} onChange={e => setEditForm({ ...editForm, category: e.target.value })} placeholder="category" />
              <input className="auth-field" type="number" value={editForm.lesson as number} onChange={e => setEditForm({ ...editForm, lesson: Number(e.target.value) })} placeholder="lesson" />
              <input className="auth-field" value={editForm.ex ?? ''} onChange={e => setEditForm({ ...editForm, ex: e.target.value })} placeholder="example sentence" />
              <div className="modal-actions">
                <button className="m-cancel" onClick={cancelEdit} disabled={busy}>Cancel</button>
                <button className="m-ok" onClick={saveEdit} disabled={busy}>Save</button>
              </div>
            </div>
          ) : (
            <div key={c.id ?? i} className="row" onClick={() => startEdit(c)} style={{ cursor: 'pointer' }}>
              <span className="ko">{c.ko}</span>
              <span>{c.mn} · {c.category} · Х{c.lesson}</span>
              <button
                className="m-cancel"
                style={{ marginLeft: 8, padding: '4px 10px' }}
                onClick={e => { e.stopPropagation(); handleDelete(c.id) }}
                disabled={busy}
              >
                🗑
              </button>
            </div>
          )
        })}
      </div>

      <h4 style={{ marginTop: 16 }}>Шинэ карт нэмэх</h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <input className="auth-field" value={newForm.ko} onChange={e => setNewForm({ ...newForm, ko: e.target.value })} placeholder="ko (солонгос үг)" />
        <input className="auth-field" value={newForm.mn} onChange={e => setNewForm({ ...newForm, mn: e.target.value })} placeholder="mn (монгол орчуулга)" />
        <input className="auth-field" value={newForm.category} onChange={e => setNewForm({ ...newForm, category: e.target.value })} placeholder="category" />
        <input className="auth-field" type="number" value={newForm.lesson as number} onChange={e => setNewForm({ ...newForm, lesson: Number(e.target.value) })} placeholder="lesson (тоо)" />
        <input className="auth-field" value={newForm.ex ?? ''} onChange={e => setNewForm({ ...newForm, ex: e.target.value })} placeholder="жишээ өгүүлбэр" />
        <button className="m-ok" onClick={handleAdd} disabled={busy}>Нэмэх</button>
      </div>
    </div>
  )
}
