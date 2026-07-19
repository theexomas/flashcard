'use client'

interface DueHeroProps {
  dueCount: number
  totalCount: number
  learnedFraction: number
}

export default function DueHero({ dueCount, totalCount, learnedFraction }: DueHeroProps) {
  const circumference = 232.5
  const offset = circumference * (1 - Math.min(1, Math.max(0, learnedFraction)))

  return (
    <div className="due-hero">
      <div className="due-ring">
        <svg width="84" height="84" viewBox="0 0 84 84">
          <circle cx="42" cy="42" r="37" fill="none" stroke="#28303f" strokeWidth="7" />
          <circle
            cx="42" cy="42" r="37"
            fill="none" stroke="#3dd68c" strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.3s' }}
          />
        </svg>
        <div className="due-num">{dueCount}</div>
      </div>
      <div className="due-info">
        <h2>Өнөөдөр давтах карт</h2>
        <p>
          {dueCount
            ? `Сонгосон шүүлтээр ${totalCount} картаас ${dueCount} нь давтагдахад бэлэн.`
            : 'Өнөөдрийн давталт дууссан! 잘했어요 👏'}
        </p>
      </div>
    </div>
  )
}
