'use client'

import { useState, useCallback } from 'react'
import { useGameStore, type Card, type GrammarRule } from '@/store/gameStore'

interface ImportModalProps {
  open: boolean
  onClose: () => void
}

type TermDelim = 'tab' | 'comma' | 'custom'
type CardDelim = 'newline' | 'semicolon' | 'custom'

function parseCards(
  text: string,
  termDelim: TermDelim,
  cardDelim: CardDelim,
  termCustom: string,
  cardCustom: string
): Card[] {
  const td =
    termDelim === 'tab' ? '\t' : termDelim === 'comma' ? ',' : termCustom
  const cd =
    cardDelim === 'newline' ? '\n' : cardDelim === 'semicolon' ? ';' : cardCustom
  if (!text.trim() || !td || !cd) return []
  const out: Card[] = []
  text.split(cd).forEach(line => {
    line = line.trim()
    if (!line) return
    const i = line.indexOf(td)
    if (i < 0) return
    let ko = line.slice(0, i).trim()
    let def = line.slice(i + td.length).trim()
    if (!ko || !def) return
    // strip emoji prefix
    def = def.replace(/^[\p{Emoji_Presentation}\p{Extended_Pictographic}]+\s*/u, '')
    const bullet = def.indexOf('•')
    const mn = (bullet >= 0 ? def.slice(0, bullet) : def).trim()
    if (ko && mn) out.push({ ko, mn, category: 'Импорт', lesson: 'import' })
  })
  return out
}

export default function ImportModal({ open, onClose }: ImportModalProps) {
  const addCustomCards = useGameStore(s => s.addCustomCards)
  const addGrammarRules = useGameStore(s => s.addGrammarRules)
  const setToast = useGameStore(s => s.setToast)

  const [tab, setTab] = useState<'words' | 'grammar'>('words')
  const [impText, setImpText] = useState('')
  const [termDelim, setTermDelim] = useState<TermDelim>('comma')
  const [cardDelim, setCardDelim] = useState<CardDelim>('newline')
  const [termCustom, setTermCustom] = useState('')
  const [cardCustom, setCardCustom] = useState('')
  const [append, setAppend] = useState(true)
  const [grammarText, setGrammarText] = useState('')
  const [grammarErr, setGrammarErr] = useState('')

  const preview = parseCards(impText, termDelim, cardDelim, termCustom, cardCustom)

  const handleImportWords = useCallback(() => {
    const cards = parseCards(impText, termDelim, cardDelim, termCustom, cardCustom)
    if (!cards.length) return
    if (!append) {
      // clear custom cards first - handled by store
    }
    const added = addCustomCards(append ? cards : cards)
    setToast(`${added} карт нэмэгдлээ`)
    setImpText('')
    onClose()
  }, [impText, termDelim, cardDelim, termCustom, cardCustom, append, addCustomCards, setToast, onClose])

  const handleImportGrammar = useCallback(() => {
    setGrammarErr('')
    try {
      const arr = JSON.parse(grammarText)
      if (!Array.isArray(arr)) throw new Error('Array биш байна')
      arr.forEach((g: GrammarRule) => {
        if (!g.lesson || !g.title || !g.rule)
          throw new Error('"lesson","title","rule" талбар заавал байна')
        g.examples = g.examples || []
      })
      const added = addGrammarRules(arr)
      setToast(`${added} дүрэм нэмэгдлээ`)
      setGrammarText('')
      onClose()
    } catch (e: unknown) {
      setGrammarErr('JSON алдаа: ' + (e instanceof Error ? e.message : String(e)))
    }
  }, [grammarText, addGrammarRules, setToast, onClose])

  const grammarValid = (() => {
    try {
      const a = JSON.parse(grammarText)
      return Array.isArray(a) && a.length > 0
    } catch {
      return false
    }
  })()

  if (!open) return null

  return (
    <div className="modal-bg show" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal">
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          <button
            className={`chip${tab === 'words' ? ' on' : ''}`}
            style={{ flex: 1, borderRadius: 10, textAlign: 'center' }}
            onClick={() => setTab('words')}
          >
            Үг оруулах
          </button>
          <button
            className={`chip${tab === 'grammar' ? ' on' : ''}`}
            style={{ flex: 1, borderRadius: 10, textAlign: 'center' }}
            onClick={() => setTab('grammar')}
          >
            Дүрэм JSON
          </button>
        </div>

        {tab === 'words' && (
          <div>
            <h3>Өөрийн үг оруулах</h3>
            <p className="sub">
              Word/Excel/Google Docs-оос хуулж буулгана уу. «Үг,Тайлбар» эсвэл «Үг [Tab] Тайлбар» хэлбэр, мөн хуучин «이모지 Тайлбар • дуудлага» формат хоёулаа танигдана.
            </p>
            <textarea
              value={impText}
              onChange={e => setImpText(e.target.value)}
              placeholder={"안녕하세요,Сайн байна уу?\n감사합니다,Баярлалаа"}
            />
            <h4>Үг ба тайлбарын хооронд</h4>
            <div className="seg">
              {(['tab', 'comma'] as TermDelim[]).map(v => (
                <button
                  key={v}
                  className={termDelim === v ? 'on' : ''}
                  onClick={() => { setTermDelim(v); setTermCustom('') }}
                >
                  {v === 'tab' ? 'Tab' : 'Comma'}
                </button>
              ))}
              <input
                value={termCustom}
                onChange={e => { setTermCustom(e.target.value); setTermDelim('custom') }}
                placeholder="Өөр тэмдэгт"
              />
            </div>
            <h4>Карт бүрийн хооронд</h4>
            <div className="seg">
              {(['newline', 'semicolon'] as CardDelim[]).map(v => (
                <button
                  key={v}
                  className={cardDelim === v ? 'on' : ''}
                  onClick={() => { setCardDelim(v); setCardCustom('') }}
                >
                  {v === 'newline' ? 'New line' : 'Semicolon'}
                </button>
              ))}
              <input
                value={cardCustom}
                onChange={e => { setCardCustom(e.target.value); setCardDelim('custom') }}
                placeholder="Өөр тэмдэгт"
              />
            </div>
            <h4>Preview — <span>{preview.length}</span> карт</h4>
            <div className="preview">
              {preview.length === 0 ? (
                <div className="empty">Одоогоор урьдчилан харах зүйл алга.</div>
              ) : (
                preview.slice(0, 30).map((c, i) => (
                  <div key={i} className="row">
                    <span className="ko">{c.ko}</span>
                    <span>{c.mn}</span>
                  </div>
                ))
              )}
            </div>
            <label className="check">
              <input type="checkbox" checked={append} onChange={e => setAppend(e.target.checked)} />
              Одоогийн оруулсан үгсэд нэмэх (сонгохгүй бол оруулсан үгсийг бүрэн солино — номын үгэнд нөлөөлөхгүй)
            </label>
            <div className="modal-actions">
              <button className="m-cancel" onClick={onClose}>Cancel</button>
              <button className="m-ok" disabled={preview.length === 0} onClick={handleImportWords}>
                Import
              </button>
            </div>
          </div>
        )}

        {tab === 'grammar' && (
          <div>
            <h3>Дүрэм JSON оруулах</h3>
            <p className="sub">
              Доорх форматаар JSON буулгана уу. Шинэ хичээл үзэх бүрт надаас JSON гаргуулж import хийнэ.
            </p>
            <textarea
              value={grammarText}
              onChange={e => { setGrammarText(e.target.value); setGrammarErr('') }}
              placeholder='[{"lesson":1,"title":"입니다","rule":"Нэр үгийн ард залгаж «A бол B» утга илэрхийлнэ.","examples":[{"ko":"학생입니다.","mn":"Оюутан."}]}]'
              style={{ minHeight: 180 }}
            />
            {grammarErr && (
              <div className="auth-msg err">{grammarErr}</div>
            )}
            <div className="modal-actions">
              <button className="m-cancel" onClick={onClose}>Cancel</button>
              <button className="m-ok" disabled={!grammarValid} onClick={handleImportGrammar}>
                Import
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
