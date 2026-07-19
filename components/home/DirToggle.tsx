'use client'

interface DirToggleProps {
  dir: 'ko2mn' | 'mn2ko'
  onChange: (dir: 'ko2mn' | 'mn2ko') => void
}

export default function DirToggle({ dir, onChange }: DirToggleProps) {
  return (
    <div className="dir-toggle">
      <button
        className={`ko${dir === 'ko2mn' ? ' active-ko' : ''}`}
        onClick={() => onChange('ko2mn')}
      >
        한국어 → Монгол
      </button>
      <button
        className={dir === 'mn2ko' ? 'active-mn' : ''}
        onClick={() => onChange('mn2ko')}
      >
        Монгол → 한국어
      </button>
    </div>
  )
}
