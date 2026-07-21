'use client'

import { useState, useMemo } from 'react'
import { useGameStore, type GrammarRule } from '@/store/gameStore'

const emptyForm: GrammarRule = { lesson: 1, title: '', rule: '', examples: [] }

export default function GrammarAdmin() {
  const dbGrammar = useGameStore(s => s.dbGrammar)
  const adminUpsertGrammar = useGameStore(s => s.adminUpsertGrammar)
  const adminDeleteGrammar = useGameStore(s => s.adminDeleteGrammar)
  const setToast = useGameStore(s => s.setToast)

  const [editId, setEditId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<GrammarRule>(emptyForm)
  const [editExamplesText, setEditExamplesText] = useState('[]')
  const [editErr, setEditErr] = useState('')

  const [newForm, setNewForm] = useState<GrammarRule>(emptyForm)
  const [newExamplesText, setNewExamplesText] = useState('[]')
  const [newErr, setNewErr] = useState('')
  const [busy, setBusy] = useState(false)

  const total = useMemo(() => dbGrammar.length, [dbGrammar])

  const startEdit = (g: GrammarRule) => {
    setEditId(g.id ?? null)
    setEditForm(g)
    setEditExamplesText(JSON.stringify(g.examples ?? [], null, 2))
    setEditErr('')
  }

  const cancelEdit = () => {
    setEditId(null)
    setEditForm(emptyForm)
    setEditErr('')
  }

  const saveEdit = async () => {
    let examples
    try {
      examples = JSON.parse(editExamplesText)
      if (!Array.isArray(examples)) throw new Error('Array биш байна')
    } catch (e: unknown) {
      setEditErr('JSON алдаа: ' + (e instanceof Error ? e.message : String(e)))
      return
    }
    setBusy(true)
    const { error } = await adminUpsertGrammar({ ...editForm, examples })
    setBusy(false)
    if (error) { setToast('Алдаа: ' + error); return }
    setToast('Хадгалагдлаа')
    cancelEdit()
  }

  const handleDelete = async (id?: string) => {
    if (!id) return
    setBusy(true)
    const { error } = await adminDeleteGrammar(id)
    setBusy(false)
    if (error) { setToast('Алдаа: ' + error); return }
    setToast('Устгагдлаа')
  }

  const handleAdd = async () => {
    if (!newForm.title || !newForm.rule) { setToast('title, rule талбар заавал'); return }
    let examples
    try {
      examples = JSON.parse(newExamplesText)
      if (!Array.isArray(examples)) throw new Error('Array биш байна')
    } catch (e: unknown) {
      setNewErr('JSON алдаа: ' + (e instanceof Error ? e.message : String(e)))
      return
    }
    setBusy(true)
    const { error } = await adminUpsertGrammar({ ...newForm, lesson: Number(newForm.lesson), examples })
    setBusy(false)
    if (error) { setToast('Алдаа: ' + error); return }
    setToast('Нэмэгдлээ')
    setNewForm(emptyForm)
    setNewExamplesText('[]')
    setNewErr('')
  }

  return (
    <div>
      <div className="sub" style={{ marginBottom: 12 }}>Нийт {total} дүрэм</div>

      <div className="preview" style={{ maxHeight: 480 }}>
        {dbGrammar.map((g, i) => {
          const isEditing = editId === g.id && g.id
          return isEditing ? (
            <div key={g.id ?? i} className="row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 6 }}>
              <input className="auth-field" type="number" value={editForm.lesson} onChange={e => setEditForm({ ...editForm, lesson: Number(e.target.value) })} placeholder="lesson" />
              <input className="auth-field" value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })} placeholder="title" />
              <textarea value={editForm.rule} onChange={e => setEditForm({ ...editForm, rule: e.target.value })} placeholder="rule" style={{ minHeight: 80 }} />
              <textarea value={editExamplesText} onChange={e => setEditExamplesText(e.target.value)} placeholder='[{"ko":"...","mn":"..."}]' style={{ minHeight: 100 }} />
              {editErr && <div className="auth-msg err">{editErr}</div>}
              <div className="modal-actions">
                <button className="m-cancel" onClick={cancelEdit} disabled={busy}>Cancel</button>
                <button className="m-ok" onClick={saveEdit} disabled={busy}>Save</button>
              </div>
            </div>
          ) : (
            <div key={g.id ?? i} className="row" onClick={() => startEdit(g)} style={{ cursor: 'pointer' }}>
              <span className="ko">Х{g.lesson}</span>
              <span>{g.title}</span>
              <button
                className="m-cancel"
                style={{ marginLeft: 8, padding: '4px 10px' }}
                onClick={e => { e.stopPropagation(); handleDelete(g.id) }}
                disabled={busy}
              >
                🗑
              </button>
            </div>
          )
        })}
      </div>

      <h4 style={{ marginTop: 16 }}>Шинэ дүрэм нэмэх</h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <input className="auth-field" type="number" value={newForm.lesson} onChange={e => setNewForm({ ...newForm, lesson: Number(e.target.value) })} placeholder="lesson (тоо)" />
        <input className="auth-field" value={newForm.title} onChange={e => setNewForm({ ...newForm, title: e.target.value })} placeholder="title" />
        <textarea value={newForm.rule} onChange={e => setNewForm({ ...newForm, rule: e.target.value })} placeholder="rule (дүрмийн тайлбар)" style={{ minHeight: 80 }} />
        <textarea
          value={newExamplesText}
          onChange={e => { setNewExamplesText(e.target.value); setNewErr('') }}
          placeholder='[{"ko":"학생입니다.","mn":"Оюутан."}]'
          style={{ minHeight: 100 }}
        />
        {newErr && <div className="auth-msg err">{newErr}</div>}
        <button className="m-ok" onClick={handleAdd} disabled={busy}>Нэмэх</button>
      </div>
    </div>
  )
}
