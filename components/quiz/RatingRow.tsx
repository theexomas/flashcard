'use client'

import { useEffect } from 'react'

interface RatingRowProps {
  onRate: (q: number) => void
}

export default function RatingRow({ onRate }: RatingRowProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) return
      if (e.key === '1') onRate(3)
      else if (e.key === '2') onRate(4)
      else if (e.key === '3') onRate(5)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onRate])

  return (
    <div className="rating-row">
      <button className="rating-btn hard" onClick={() => onRate(3)}>
        <span className="rb-key">[1]</span>Хэцүү
      </button>
      <button className="rating-btn good" onClick={() => onRate(4)} autoFocus>
        <span className="rb-key">[2]</span>За
      </button>
      <button className="rating-btn easy" onClick={() => onRate(5)}>
        <span className="rb-key">[3]</span>Амархан
      </button>
    </div>
  )
}
