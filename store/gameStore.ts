'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { BUILTIN, BUILTIN_GRAMMAR } from '@/lib/data'
import {
  grade as sm2grade,
  getState,
  isNew,
  isDue,
  isDone,
  cardId,
  type Card,
  type GrammarRule,
  type SRSEntry,
} from '@/lib/sm2'
import { K_GRAMMAR, K_DB_CARDS, K_DB_GRAMMAR, loadJSON, saveJSON } from '@/lib/storage'
import { supabase } from '@/lib/supabase'

export type { Card, GrammarRule, SRSEntry }

export interface Settings {
  dir: 'ko2mn' | 'mn2ko'
  lessons: (number | 'import')[]
  cat: string
  inputMode: 'mcq' | 'type'
  streak: number
  lastActive: string
}

export interface Session {
  cards: Card[]
  ix: number
  missed: Card[]
  correct: number
  mode: 'review' | 'practice'
}

export interface SbUser {
  id: string
  email: string
}

const ADMIN_EMAIL = 'darklight749@gmail.com'

interface GameState {
  srs: Record<string, SRSEntry>
  customCards: Card[]
  grammarCards: GrammarRule[]
  dbCards: Card[]
  dbGrammar: GrammarRule[]
  contentLoaded: boolean
  settings: Settings
  session: Session | null
  toast: string
  sbUser: SbUser | null
  // Actions
  gradeCard: (id: string, q: number) => void
  recordActivity: () => void
  startSession: (mode: 'review' | 'practice') => string | null
  answerMCQWrong: (c: Card) => void
  rateCard: (c: Card, q: number) => void
  nextCard: () => boolean // returns true if done
  updateSettings: (partial: Partial<Settings>) => void
  addCustomCards: (cards: Card[]) => void
  addGrammarRules: (rules: GrammarRule[]) => void
  setToast: (msg: string) => void
  setSbUser: (user: SbUser | null) => void
  cloudPull: () => Promise<void>
  cloudScheduleSave: () => void
  allCards: () => Card[]
  filteredCards: () => Card[]
  fetchContent: () => Promise<void>
  adminUpsertCard: (card: Card) => Promise<{ error: string | null }>
  adminDeleteCard: (id: string) => Promise<{ error: string | null }>
  adminUpsertGrammar: (rule: GrammarRule) => Promise<{ error: string | null }>
  adminDeleteGrammar: (id: string) => Promise<{ error: string | null }>
}

let pushTimer: ReturnType<typeof setTimeout> | null = null
let pushing = false
let dirty = false

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function mergeSrs(
  local: Record<string, SRSEntry>,
  remote: Record<string, SRSEntry>
): Record<string, SRSEntry> {
  const out: Record<string, SRSEntry> = { ...remote }
  for (const id in local) {
    const l = local[id], r = out[id]
    if (!r || l.reps > r.reps || (l.reps === r.reps && (l.due || 0) > (r.due || 0))) {
      out[id] = l
    }
  }
  return out
}

function mergeCards(local: Card[], remote: Card[]): Card[] {
  const out = [...remote]
  const ids = new Set(remote.map(cardId))
  local.forEach(c => {
    if (!ids.has(cardId(c))) { out.push(c); ids.add(cardId(c)) }
  })
  return out
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      srs: {},
      customCards: [],
      grammarCards: loadJSON<GrammarRule[]>(K_GRAMMAR, []),
      dbCards: loadJSON<Card[]>(K_DB_CARDS, BUILTIN),
      dbGrammar: loadJSON<GrammarRule[]>(K_DB_GRAMMAR, BUILTIN_GRAMMAR),
      contentLoaded: false,
      settings: {
        dir: 'ko2mn',
        lessons: [1, 2, 3, 'import'],
        cat: '',
        inputMode: 'mcq',
        streak: 0,
        lastActive: '',
      },
      session: null,
      toast: '',
      sbUser: null,

      allCards(): Card[] {
        const { dbCards, customCards } = get()
        return [...(dbCards.length ? dbCards : BUILTIN), ...customCards]
      },

      filteredCards(): Card[] {
        const { settings } = get()
        return get().allCards().filter(
          c =>
            settings.lessons.includes(c.lesson) &&
            (!settings.cat || c.category === settings.cat)
        )
      },

      gradeCard(id: string, q: number) {
        const newSrs = sm2grade(get().srs, id, q)
        set({ srs: newSrs })
        get().recordActivity()
        get().cloudScheduleSave()
      },

      recordActivity() {
        const today = todayStr()
        const { settings } = get()
        if (settings.lastActive === today) return
        const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
        const streak = settings.lastActive === yesterday ? (settings.streak || 0) + 1 : 1
        set({ settings: { ...settings, streak, lastActive: today } })
      },

      startSession(mode: 'review' | 'practice'): string | null {
        const pool = get().filteredCards()
        const { srs } = get()
        let cards =
          mode === 'review'
            ? pool.filter(c => isDue(srs, c))
            : [...pool]
        cards = shuffle(cards).slice(0, 20)
        if (!cards.length) return 'Энэ шүүлтэд карт алга'
        set({ session: { cards, ix: 0, missed: [], correct: 0, mode } })
        return null
      },

      answerMCQWrong(c: Card) {
        const { session } = get()
        if (!session) return
        const newSrs = sm2grade(get().srs, cardId(c), 1)
        set({
          srs: newSrs,
          session: { ...session, missed: [...session.missed, c] },
        })
        get().recordActivity()
        get().cloudScheduleSave()
      },

      rateCard(c: Card, q: number) {
        const { session } = get()
        if (!session) return
        const newSrs = sm2grade(get().srs, cardId(c), q)
        set({
          srs: newSrs,
          session: { ...session, correct: session.correct + 1 },
        })
        get().recordActivity()
        get().cloudScheduleSave()
      },

      nextCard(): boolean {
        const { session } = get()
        if (!session) return true
        const nextIx = session.ix + 1
        if (nextIx >= session.cards.length) return true
        set({ session: { ...session, ix: nextIx } })
        return false
      },

      updateSettings(partial: Partial<Settings>) {
        set({ settings: { ...get().settings, ...partial } })
        get().cloudScheduleSave()
      },

      addCustomCards(cards: Card[]) {
        const { customCards } = get()
        const ids = new Set(get().allCards().map(cardId))
        let added = 0
        const newCards = [...customCards]
        cards.forEach(c => {
          if (!ids.has(cardId(c))) {
            newCards.push(c)
            ids.add(cardId(c))
            added++
          }
        })
        set({ customCards: newCards })
        const { settings } = get()
        if (!settings.lessons.includes('import')) {
          set({ settings: { ...settings, lessons: [...settings.lessons, 'import'] } })
        }
        get().cloudScheduleSave()
        return added
      },

      addGrammarRules(rules: GrammarRule[]) {
        const existing = get().grammarCards
        const existingKeys = new Set(existing.map(g => g.lesson + '|' + g.title))
        const buildinKeys = new Set(BUILTIN_GRAMMAR.map(g => g.lesson + '|' + g.title))
        let added = 0
        const newRules = [...existing]
        rules.forEach(g => {
          const key = g.lesson + '|' + g.title
          if (!existingKeys.has(key) && !buildinKeys.has(key)) {
            newRules.push(g)
            existingKeys.add(key)
            added++
          }
        })
        set({ grammarCards: newRules })
        saveJSON(K_GRAMMAR, newRules)
        return added
      },

      setToast(msg: string) {
        set({ toast: msg })
        setTimeout(() => set({ toast: '' }), 2600)
      },

      setSbUser(user: SbUser | null) {
        set({ sbUser: user })
      },

      async cloudPull() {
        const { sbUser, srs, customCards, settings } = get()
        if (!sbUser) return
        const { data, error } = await supabase
          .from('user_data')
          .select('custom_cards,srs,settings')
          .eq('user_id', sbUser.id)
          .maybeSingle()
        if (error) {
          get().setToast('Синк алдаа: ' + error.message)
          return
        }
        if (data) {
          const mergedSrs = mergeSrs(srs, (data.srs as Record<string, SRSEntry>) || {})
          const mergedCards = mergeCards(customCards, (data.custom_cards as Card[]) || [])
          const mergedSettings = data.settings
            ? { ...settings, ...(data.settings as Partial<Settings>) }
            : settings
          set({ srs: mergedSrs, customCards: mergedCards, settings: mergedSettings })
        }
        // push merged state back
        await cloudPushFn(get)
      },

      cloudScheduleSave() {
        const { sbUser } = get()
        if (!sbUser) return
        if (pushTimer) clearTimeout(pushTimer)
        pushTimer = setTimeout(() => cloudPushFn(get), 1500)
      },

      async fetchContent() {
        const [cardsRes, grammarRes] = await Promise.all([
          supabase.from('cards').select('*'),
          supabase.from('grammar_rules').select('*'),
        ])
        if (!cardsRes.error && cardsRes.data && cardsRes.data.length) {
          const dbCards = cardsRes.data as Card[]
          set({ dbCards })
          saveJSON(K_DB_CARDS, dbCards)
        }
        if (!grammarRes.error && grammarRes.data && grammarRes.data.length) {
          const dbGrammar = grammarRes.data as GrammarRule[]
          set({ dbGrammar })
          saveJSON(K_DB_GRAMMAR, dbGrammar)
        }
        set({ contentLoaded: true })
      },

      async adminUpsertCard(card: Card) {
        const { id, ...rest } = card
        const payload = id ? { id, ...rest } : rest
        const { data, error } = await supabase
          .from('cards')
          .upsert(payload as Record<string, unknown>)
          .select()
        if (error) return { error: error.message }
        const saved = data?.[0] as Card | undefined
        set(state => {
          const dbCards = id
            ? state.dbCards.map(c => (c.id === id ? (saved ?? card) : c))
            : [...state.dbCards, saved ?? card]
          saveJSON(K_DB_CARDS, dbCards)
          return { dbCards }
        })
        return { error: null }
      },

      async adminDeleteCard(id: string) {
        const { error } = await supabase.from('cards').delete().eq('id', id)
        if (error) return { error: error.message }
        set(state => {
          const dbCards = state.dbCards.filter(c => c.id !== id)
          saveJSON(K_DB_CARDS, dbCards)
          return { dbCards }
        })
        return { error: null }
      },

      async adminUpsertGrammar(rule: GrammarRule) {
        const { id, ...rest } = rule
        const payload = id ? { id, ...rest } : rest
        const { data, error } = await supabase
          .from('grammar_rules')
          .upsert(payload as Record<string, unknown>)
          .select()
        if (error) return { error: error.message }
        const saved = data?.[0] as GrammarRule | undefined
        set(state => {
          const dbGrammar = id
            ? state.dbGrammar.map(g => (g.id === id ? (saved ?? rule) : g))
            : [...state.dbGrammar, saved ?? rule]
          saveJSON(K_DB_GRAMMAR, dbGrammar)
          return { dbGrammar }
        })
        return { error: null }
      },

      async adminDeleteGrammar(id: string) {
        const { error } = await supabase.from('grammar_rules').delete().eq('id', id)
        if (error) return { error: error.message }
        set(state => {
          const dbGrammar = state.dbGrammar.filter(g => g.id !== id)
          saveJSON(K_DB_GRAMMAR, dbGrammar)
          return { dbGrammar }
        })
        return { error: null }
      },
    }),
    {
      name: 'hmk_store',
      partialize: (state) => ({
        srs: state.srs,
        customCards: state.customCards,
        settings: state.settings,
      }),
    }
  )
)

async function cloudPushFn(get: () => GameState) {
  const { sbUser, srs, customCards, settings } = get()
  if (!sbUser) return
  if (pushing) { dirty = true; return }
  pushing = true
  const { error } = await supabase.from('user_data').upsert({
    user_id: sbUser.id,
    custom_cards: customCards,
    srs,
    settings,
    updated_at: new Date().toISOString(),
  })
  pushing = false
  if (!error && dirty) {
    dirty = false
    cloudPushFn(get)
  }
}

// Helper selectors — use primitive returns to avoid SSR snapshot loop
export function useCardStats() {
  const nNew   = useGameStore(s => filtered(s).filter(c => isNew(s.srs, c)).length)
  const nDone  = useGameStore(s => filtered(s).filter(c => isDone(s.srs, c)).length)
  const nDue   = useGameStore(s => filtered(s).filter(c => isDue(s.srs, c)).length)
  const total  = useGameStore(s => filtered(s).length)
  const nLearn = total - nNew - nDone
  return { nNew, nDone, nLearn, nDue, total }
}

function filtered(s: GameState) {
  const all = [...(s.dbCards.length ? s.dbCards : BUILTIN), ...s.customCards]
  return all.filter(
    c => s.settings.lessons.includes(c.lesson) &&
         (!s.settings.cat || c.category === s.settings.cat)
  )
}

// Export helpers for use in components
export { isNew, isDue, isDone, cardId, getState, ADMIN_EMAIL }
export function allCards(customCards: Card[]) {
  return [...BUILTIN, ...customCards]
}
