'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useGameStore, cardId } from '@/store/gameStore'
import { useTTS } from '@/lib/tts'
import { levenshtein, normAns } from '@/lib/sm2'
import QuizCard from '@/components/quiz/QuizCard'
import Options from '@/components/quiz/Options'
import TypeInput from '@/components/quiz/TypeInput'
import RatingRow from '@/components/quiz/RatingRow'
import ExStrip from '@/components/quiz/ExStrip'
import Toast from '@/components/Toast'

type Phase = 'question' | 'rated-wrong' | 'rated-correct' | 'near-correct'

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function QuizPage() {
  const router = useRouter()
  const session = useGameStore(s => s.session)
  const settings = useGameStore(s => s.settings)
  const allCardsFn = useGameStore(s => s.allCards)
  const srs = useGameStore(s => s.srs)
  const answerMCQWrong = useGameStore(s => s.answerMCQWrong)
  const rateCard = useGameStore(s => s.rateCard)
  const nextCard = useGameStore(s => s.nextCard)
  const speak = useTTS()

  const [phase, setPhase] = useState<Phase>('question')
  const [wrongAns, setWrongAns] = useState<string | null>(null)
  const [typeVal, setTypeVal] = useState('')
  const [typeBorderColor, setTypeBorderColor] = useState<string | undefined>(undefined)
  const [nearLabel, setNearLabel] = useState('')
  const [wrongLabel, setWrongLabel] = useState('')
  const [options, setOptions] = useState<string[]>([])

  const allCards = allCardsFn()

  useEffect(() => {
    if (!session) {
      router.replace('/')
    }
  }, [session, router])

  const card = session?.cards[session.ix]

  const useType = settings.dir === 'mn2ko' && settings.inputMode === 'type'

  // Build MCQ options when card changes
  useEffect(() => {
    if (!card || useType) return
    const dir = settings.dir
    const correctAns = dir === 'ko2mn' ? card.mn : card.ko
    const cid = cardId(card)
    const sameCat = allCards.filter(x => x.category === card.category && cardId(x) !== cid)
    const others = allCards.filter(x => x.category !== card.category && cardId(x) !== cid)
    const pool = [...shuffle(sameCat), ...shuffle(others)]
    const opts = [correctAns]
    for (const d of pool) {
      const v = dir === 'ko2mn' ? d.mn : d.ko
      if (!opts.includes(v)) opts.push(v)
      if (opts.length === 4) break
    }
    setOptions(shuffle(opts))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [card, useType, settings.dir])

  // auto-speak on card change (ko2mn)
  useEffect(() => {
    if (card && settings.dir === 'ko2mn') {
      speak(card.ko)
    }
    setPhase('question')
    setWrongAns(null)
    setTypeVal('')
    setTypeBorderColor(undefined)
    setNearLabel('')
    setWrongLabel('')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [card?.ko, card?.mn])

  const goNext = useCallback(() => {
    const done = nextCard()
    if (done) router.push('/results')
  }, [nextCard, router])

  const handleMCQAnswer = useCallback((opt: string) => {
    if (!card || phase !== 'question') return
    const correctAns = settings.dir === 'ko2mn' ? card.mn : card.ko
    if (settings.dir === 'mn2ko') speak(card.ko)
    if (opt === correctAns) {
      setPhase('rated-correct')
    } else {
      setWrongAns(opt)
      answerMCQWrong(card)
      setPhase('rated-wrong')
    }
  }, [card, phase, settings.dir, speak, answerMCQWrong])

  const handleRate = useCallback((q: number) => {
    if (!card) return
    rateCard(card, q)
    goNext()
  }, [card, rateCard, goNext])

  const handleTypeSubmit = useCallback(() => {
    if (!card || phase !== 'question') return
    const correctAns = card.ko
    const ua = normAns(typeVal)
    const ca = normAns(correctAns)
    speak(card.ko)

    if (ua === ca) {
      setTypeBorderColor('var(--green)')
      setPhase('rated-correct')
    } else if (levenshtein(ua, ca) === 1) {
      setTypeBorderColor('var(--amber)')
      setNearLabel('Бараг зөв! Зөв хариулт: ' + correctAns)
      setPhase('near-correct')
      rateCard(card, 4)
      setTimeout(goNext, 1400)
    } else {
      setTypeBorderColor('var(--red)')
      setWrongLabel('Зөв хариулт: ' + correctAns)
      answerMCQWrong(card)
      setPhase('rated-wrong')
    }
  }, [card, phase, typeVal, speak, rateCard, answerMCQWrong, goNext])

  const handleQuit = () => {
    if (typeof window !== 'undefined') window.speechSynthesis?.cancel()
    router.push('/')
  }

  if (!session || !card) return null

  const correctAns = settings.dir === 'ko2mn' ? card.mn : card.ko
  const showEx = phase !== 'question'
  const showRating = phase === 'rated-correct'
  const showNextBtn = phase === 'rated-wrong'

  return (
    <div className="wrap">
      <QuizCard
        card={card}
        dir={settings.dir}
        ix={session.ix}
        total={session.cards.length}
      />

      {!useType ? (
        <Options
          options={options}
          correctAns={correctAns}
          answered={phase !== 'question'}
          wrongAns={wrongAns}
          dir={settings.dir}
          onAnswer={handleMCQAnswer}
        />
      ) : (
        <TypeInput
          value={typeVal}
          onChange={setTypeVal}
          onSubmit={handleTypeSubmit}
          disabled={phase !== 'question'}
          borderColor={typeBorderColor}
        />
      )}

      {nearLabel && (
        <div className="near-label">{nearLabel}</div>
      )}
      {wrongLabel && (
        <div className="near-label" style={{ color: '#ff8a8e' }}>{wrongLabel}</div>
      )}

      {showEx && card.ex && <ExStrip ex={card.ex} />}

      <div className="next-row">
        {showRating && <RatingRow onRate={handleRate} />}
        {showNextBtn && (
          <button className="big-btn ghost" onClick={goNext}>
            {session.ix + 1 < session.cards.length ? 'Дараах →' : 'Дүн харах'}
          </button>
        )}
      </div>

      <button className="quit" onClick={handleQuit}>
        Гарах — явц хадгалагдана
      </button>
      <Toast />
    </div>
  )
}
